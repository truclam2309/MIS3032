from fastapi import HTTPException

from data_store import budgets


def budget_for(department: str, amount: float) -> dict:
    budget = budgets.get(department)

    if not budget:
        raise HTTPException(
            status_code=400,
            detail="Unknown department",
        )

    available = budget["limit"] - budget["spent"]
    return {
        **budget,
        "available": available,
        "remaining": available - amount,
        "is_within_budget": amount <= available,
    }
