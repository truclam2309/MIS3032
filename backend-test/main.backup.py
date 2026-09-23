from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="RoomFlow API", version="0.1.0")


class PurchaseRequestInput(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    department: str
    amount: float = Field(gt=0)
    category: str
    justification: str = Field(min_length=5)
    requester: str = "Nguyen Minh Anh"


class Decision(BaseModel):
    action: Literal["approved", "rejected"]
    comment: str = ""


budgets = {
    "Operations": {"limit": 300_000_000, "spent": 184_500_000},
    "Marketing": {"limit": 180_000_000, "spent": 126_800_000},
    "Engineering": {"limit": 500_000_000, "spent": 318_200_000},
}
requests: list[dict] = []


def budget_for(department: str, amount: float) -> dict:
    budget = budgets.get(department)
    if not budget:
        raise HTTPException(400, "Unknown department")
    available = budget["limit"] - budget["spent"]
    return {**budget, "available": available, "remaining": available - amount, "is_within_budget": amount <= available}


@app.get("/")
def root():
    return {"message": "RoomFlow API"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/budgets")
def list_budgets():
    return [{"department": name, **budget_for(name, 0)} for name in budgets]


@app.post("/budget-check")
def check_budget(department: str, amount: float):
    return budget_for(department, amount)


@app.get("/purchase-requests")
def list_requests():
    return requests


@app.post("/purchase-requests", status_code=201)
def create_request(data: PurchaseRequestInput):
    budget = budget_for(data.department, data.amount)
    request_id = f"PR-{datetime.now().year}-{len(requests) + 1:04d}"
    request = {
        "id": request_id, **data.model_dump(), "status": "Pending manager approval",
        "created_at": datetime.now(timezone.utc).isoformat(), "budget": budget,
        "workflow": [{"role": "Manager", "status": "pending"}, {"role": "Finance", "status": "waiting"}, {"role": "Procurement", "status": "waiting"}],
    }
    requests.append(request)
    return request


@app.post("/purchase-requests/{request_id}/decision")
def decide_request(request_id: str, decision: Decision):
    request = next((item for item in requests if item["id"] == request_id), None)
    if not request:
        raise HTTPException(404, "Purchase request not found")
    step = next((item for item in request["workflow"] if item["status"] == "pending"), None)
    if not step:
        raise HTTPException(409, "No pending approval")
    step["status"] = decision.action
    step["comment"] = decision.comment
    if decision.action == "rejected":
        request["status"] = "Rejected"
    elif step["role"] == "Procurement":
        request["status"] = "Approved"
        budgets[request["department"]]["spent"] += request["amount"]
    else:
        next_step = request["workflow"][request["workflow"].index(step) + 1]
        next_step["status"] = "pending"
        request["status"] = f"Pending {next_step['role']} approval"
    return request
