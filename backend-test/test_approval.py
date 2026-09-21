from fastapi.testclient import TestClient

import main


client = TestClient(main.app)


def login(email: str, password: str = "123456") -> str:
    response = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": password,
        },
    )

    assert response.status_code == 200

    return response.json()["access_token"]


def auth_header(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}"
    }


def create_test_request(request_id: str):
    main.requests.clear()

    main.requests.append(
        {
            "id": request_id,
            "title": "Test Purchase Request",
            "department": "Operations",
            "amount": 1_000_000,
            "category": "Office",
            "justification": "Testing approval workflow",
            "requester": "Test Employee",
            "created_by": "employee@demo.com",
            "created_role": "employee",
            "status": "PENDING_APPROVAL",
            "workflow": [
                {
                    "role": "Manager",
                    "status": "pending",
                },
                {
                    "role": "Finance",
                    "status": "waiting",
                },
                {
                    "role": "Procurement",
                    "status": "waiting",
                },
            ],
        }
    )


def test_manager_approve_request():
    create_test_request("PR-TEST-001")

    token = login("manager@demo.com")

    response = client.post(
        "/purchase-requests/PR-TEST-001/decision",
        headers=auth_header(token),
        json={
            "action": "approved",
            "comment": "Approved by manager",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "APPROVED"
    assert data["approved_by"] == "manager@demo.com"
    assert data["workflow"][0]["status"] == "approved"
    assert data["workflow"][1]["status"] == "pending"


def test_manager_reject_request():
    create_test_request("PR-TEST-002")

    token = login("manager@demo.com")

    response = client.post(
        "/purchase-requests/PR-TEST-002/decision",
        headers=auth_header(token),
        json={
            "action": "rejected",
            "comment": "Budget is not appropriate",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "REJECTED"
    assert data["rejected_by"] == "manager@demo.com"


def test_manager_request_revision():
    create_test_request("PR-TEST-003")

    token = login("manager@demo.com")

    response = client.post(
        "/purchase-requests/PR-TEST-003/decision",
        headers=auth_header(token),
        json={
            "action": "revision",
            "comment": "Please provide more justification",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "REVISION_REQUIRED"
    assert (
        data["revision_requested_by"]
        == "manager@demo.com"
    )


def test_employee_cannot_approve():
    create_test_request("PR-TEST-004")

    token = login("employee@demo.com")

    response = client.post(
        "/purchase-requests/PR-TEST-004/decision",
        headers=auth_header(token),
        json={
            "action": "approved",
            "comment": "Try to approve",
        },
    )

    assert response.status_code == 403

    assert (
        main.requests[0]["status"]
        == "PENDING_APPROVAL"
    )


def test_approved_request_cannot_be_processed_again():
    create_test_request("PR-TEST-005")

    token = login("manager@demo.com")

    response = client.post(
        "/purchase-requests/PR-TEST-005/decision",
        headers=auth_header(token),
        json={
            "action": "approved",
            "comment": "Approved",
        },
    )

    assert response.status_code == 200

    assert (
        main.requests[0]["status"]
        == "APPROVED"
    )

    response = client.post(
        "/purchase-requests/PR-TEST-005/decision",
        headers=auth_header(token),
        json={
            "action": "approved",
            "comment": "Approve again",
        },
    )

    assert response.status_code == 400

    assert (
        main.requests[0]["status"]
        == "APPROVED"
    )