from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from config import USE_SUPABASE
from data_store import requests
from database import supabase
from models import Decision
from security import require_roles
from services.purchase_request_service import workflow_for_status


router = APIRouter()


@router.post("/purchase-requests/{request_id}/decision")
def decide_request(
    request_id: str,
    decision: Decision,
    current_user: Annotated[dict, Depends(require_roles("manager"))],
):
    if USE_SUPABASE and supabase:
        response = (
            supabase.table("purchase_requests")
            .select("*")
            .eq("id", request_id)
            .limit(1)
            .execute()
        )
        request = dict(response.data[0]) if response.data else None
        if request:
            request["workflow"] = workflow_for_status(request["status"])
    else:
        request = next(
            (item for item in requests if item["id"] == request_id),
            None,
        )

    if not request:
        raise HTTPException(status_code=404, detail="Purchase request not found")

    # Chỉ request đang chờ Manager Approval mới được xử lý.
    if request["status"] != "PENDING_APPROVAL":
        raise HTTPException(
            status_code=400,
            detail=f"Request is already in '{request['status']}' state",
        )

    manager_step = next(
        (item for item in request["workflow"] if item["role"] == "Manager"),
        None,
    )
    if not manager_step:
        raise HTTPException(status_code=400, detail="Manager approval step not found")

    if decision.action == "approved":
        approved_at = datetime.now(timezone.utc).isoformat()
        if USE_SUPABASE and supabase:
            response = (
                supabase.table("purchase_requests")
                .update({
                    "status": "APPROVED",
                    "approved_by": current_user["email"],
                    "approved_at": approved_at,
                    "approval_comment": decision.comment,
                    "next_approval_role": "Finance",
                })
                .eq("id", request_id)
                .eq("status", "PENDING_APPROVAL")
                .execute()
            )
            if not response.data:
                raise HTTPException(
                    status_code=400,
                    detail="Request is no longer pending approval",
                )
            updated = dict(response.data[0])
            updated["workflow"] = workflow_for_status("APPROVED")
            return updated

        manager_step["status"] = "approved"
        manager_step["comment"] = decision.comment
        manager_step["approved_by"] = current_user["email"]
        request["status"] = "APPROVED"
        request["approved_by"] = current_user["email"]
        request["approved_at"] = approved_at
        request["approval_comment"] = decision.comment
        request["next_approval_role"] = "Finance"
        request["workflow"] = workflow_for_status("APPROVED")
        return request

    if decision.action == "rejected":
        rejected_at = datetime.now(timezone.utc).isoformat()
        if USE_SUPABASE and supabase:
            response = (
                supabase.table("purchase_requests")
                .update({
                    "status": "REJECTED",
                    "rejected_by": current_user["email"],
                    "rejected_at": rejected_at,
                    "approval_comment": decision.comment,
                    "next_approval_role": None,
                })
                .eq("id", request_id)
                .eq("status", "PENDING_APPROVAL")
                .execute()
            )
            if not response.data:
                raise HTTPException(
                    status_code=400,
                    detail="Request is no longer pending approval",
                )
            updated = dict(response.data[0])
            updated["workflow"] = workflow_for_status("REJECTED")
            return updated

        manager_step["status"] = "rejected"
        manager_step["comment"] = decision.comment
        manager_step["rejected_by"] = current_user["email"]
        request["status"] = "REJECTED"
        request["rejected_by"] = current_user["email"]
        request["rejected_at"] = rejected_at
        request["approval_comment"] = decision.comment
        request["next_approval_role"] = None
        request["workflow"] = workflow_for_status("REJECTED")
        return request

    if decision.action == "revision":
        revision_at = datetime.now(timezone.utc).isoformat()
        if USE_SUPABASE and supabase:
            response = (
                supabase.table("purchase_requests")
                .update({
                    "status": "REVISION_REQUIRED",
                    "revision_requested_by": current_user["email"],
                    "revision_requested_at": revision_at,
                    "revision_comment": decision.comment,
                    "next_approval_role": None,
                })
                .eq("id", request_id)
                .eq("status", "PENDING_APPROVAL")
                .execute()
            )
            if not response.data:
                raise HTTPException(
                    status_code=400,
                    detail="Request is no longer pending approval",
                )
            updated = dict(response.data[0])
            updated["workflow"] = workflow_for_status("REVISION_REQUIRED")
            return updated

        manager_step["status"] = "revision_required"
        manager_step["comment"] = decision.comment
        manager_step["revision_by"] = current_user["email"]
        request["status"] = "REVISION_REQUIRED"
        request["revision_requested_by"] = current_user["email"]
        request["revision_requested_at"] = revision_at
        request["revision_comment"] = decision.comment
        request["next_approval_role"] = None
        request["workflow"] = workflow_for_status("REVISION_REQUIRED")
        return request

    raise HTTPException(status_code=400, detail="Invalid decision action")
