WORKFLOW_ROLES = ("Manager", "Finance", "Procurement")


def workflow_for_status(status_value: str) -> list[dict]:
    """Return the workflow shape expected by the frontend."""
    if status_value == "PENDING_APPROVAL":
        statuses = {
            "Manager": "pending",
            "Finance": "waiting",
            "Procurement": "waiting",
        }
    elif status_value == "APPROVED":
        statuses = {
            "Manager": "approved",
            "Finance": "pending",
            "Procurement": "waiting",
        }
    elif status_value == "REJECTED":
        statuses = {
            "Manager": "rejected",
            "Finance": "cancelled",
            "Procurement": "cancelled",
        }
    elif status_value == "REVISION_REQUIRED":
        statuses = {
            "Manager": "revision_required",
            "Finance": "cancelled",
            "Procurement": "cancelled",
        }
    else:
        statuses = {
            "Manager": "waiting",
            "Finance": "waiting",
            "Procurement": "waiting",
        }

    return [
        {"role": role, "status": statuses[role]}
        for role in WORKFLOW_ROLES
    ]
