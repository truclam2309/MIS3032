from datetime import datetime, timezone
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException

from config import USE_SUPABASE
from data_store import requests
from database import supabase
from models import PurchaseRequestInput
from security import get_current_user, require_roles
from services.budget_service import budget_for
from services.purchase_request_service import workflow_for_status


router = APIRouter()


@router.get("/purchase-requests")
def list_requests(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    if USE_SUPABASE and supabase:
        response = (
            supabase.table("purchase_requests")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        result = []
        for row in response.data:
            item = dict(row)
            item["workflow"] = workflow_for_status(item["status"])
            result.append(item)
        return result

    return requests


@router.post("/purchase-requests", status_code=201)
def create_request(
    data: PurchaseRequestInput,
    current_user: Annotated[dict, Depends(require_roles("employee", "admin"))],
):
    budget = budget_for(data.department, data.amount)
    request_id = (
        f"PR-{datetime.now().year}-"
        f"{uuid.uuid4().hex[:8].upper()}"
    )
    created_at = datetime.now(timezone.utc).isoformat()

    request = {
        "id": request_id,
        **data.model_dump(),
        "created_by": current_user["email"],
        "created_role": current_user["role"],
        "status": "PENDING_APPROVAL",
        "created_at": created_at,
        "next_approval_role": "Manager",
        "budget": budget,
        "workflow": workflow_for_status("PENDING_APPROVAL"),
    }

    if USE_SUPABASE and supabase:
        db_request = {
            "id": request["id"],
            "title": request["title"],
            "department": request["department"],
            "amount": request["amount"],
            "category": request["category"],
            "justification": request["justification"],
            "requester": request["requester"],
            "created_by": request["created_by"],
            "created_role": request["created_role"],
            "status": request["status"],
            "created_at": request["created_at"],
            "next_approval_role": "Manager",
            "budget_limit": budget["limit"],
            "budget_spent": budget["spent"],
            "budget_available": budget["available"],
            "budget_remaining": budget["remaining"],
            "is_within_budget": budget["is_within_budget"],
        }
        response = (
            supabase.table("purchase_requests")
            .insert(db_request)
            .execute()
        )
        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to create purchase request",
            )

        created = dict(response.data[0])
        created["workflow"] = workflow_for_status(created["status"])
        return created

    requests.append(request)
    return request
