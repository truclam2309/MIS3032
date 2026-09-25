from typing import Annotated

from fastapi import APIRouter, Depends

from data_store import budgets
from security import require_roles
from services.budget_service import budget_for


router = APIRouter()


@router.get("/budgets")
def list_budgets(
    current_user: Annotated[dict, Depends(require_roles("finance", "admin"))],
):
    return [
        {"department": name, **budget_for(name, 0)}
        for name in budgets
    ]


@router.post("/budget-check")
def check_budget(
    department: str,
    amount: float,
    current_user: Annotated[dict, Depends(require_roles("finance", "admin"))],
):
    return budget_for(department, amount)
