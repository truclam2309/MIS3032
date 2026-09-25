"""Five US-03 tests against real Supabase (run with USE_SUPABASE=true)."""

import uuid

import pytest
from fastapi.testclient import TestClient

from config import SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, USE_SUPABASE

if not USE_SUPABASE:
    pytest.skip("Set USE_SUPABASE=true to run Supabase tests", allow_module_level=True)

import main
from database import supabase

if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY or supabase is None:
    pytest.fail("USE_SUPABASE=true requires valid Supabase URL/key and client")

client = TestClient(main.app)


def token_for(email: str) -> str:
    response = client.post(
        "/auth/login", data={"username": email, "password": "123456"}
    )
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def headers(email: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token_for(email)}"}


@pytest.fixture
def request_id():
    request_id = f"PR-TEST-{uuid.uuid4().hex[:12].upper()}"
    row = {
        "id": request_id,
        "title": "US-03 approval test",
        "department": "Operations",
        "amount": 1_000_000,
        "category": "Office",
        "justification": "Testing approval actions",
        "requester": "Test Employee",
        "created_by": "employee@demo.com",
        "created_role": "employee",
        "status": "PENDING_APPROVAL",
        "next_approval_role": "Manager",
    }
    inserted = supabase.table("purchase_requests").insert(row).execute()
    assert inserted.data and inserted.data[0]["id"] == request_id
    # IDs are unique; this Supabase role has no DELETE privilege.
    yield request_id


def stored_request(request_id: str) -> dict:
    return (
        supabase.table("purchase_requests")
        .select("*")
        .eq("id", request_id)
        .single()
        .execute()
        .data
    )


def decide(request_id: str, email: str, action: str):
    return client.post(
        f"/purchase-requests/{request_id}/decision",
        headers=headers(email),
        json={"action": action, "comment": "US-03 test"},
    )


def test_manager_approve(request_id):
    response = decide(request_id, "manager@demo.com", "approved")
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "APPROVED"
    assert response.json()["workflow"][1]["status"] == "pending"
    assert stored_request(request_id)["approved_by"] == "manager@demo.com"


def test_manager_reject(request_id):
    response = decide(request_id, "manager@demo.com", "rejected")
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "REJECTED"
    assert stored_request(request_id)["rejected_by"] == "manager@demo.com"


def test_manager_requests_revision(request_id):
    response = decide(request_id, "manager@demo.com", "revision")
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "REVISION_REQUIRED"
    assert stored_request(request_id)["revision_requested_by"] == "manager@demo.com"


def test_employee_cannot_approve(request_id):
    response = decide(request_id, "employee@demo.com", "approved")
    assert response.status_code == 403
    assert stored_request(request_id)["status"] == "PENDING_APPROVAL"


def test_approved_request_cannot_be_approved_again(request_id):
    assert decide(request_id, "manager@demo.com", "approved").status_code == 200
    response = decide(request_id, "manager@demo.com", "approved")
    assert response.status_code == 400
    assert stored_request(request_id)["status"] == "APPROVED"
