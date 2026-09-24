from datetime import datetime, timedelta, timezone
from typing import Annotated, Literal
import os
import uuid

from dotenv import load_dotenv
from supabase import create_client, Client

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic import BaseModel, Field


app = FastAPI(title="RoomFlow API", version="0.2.0")


# ============================================================
# SECURITY CONFIG
# ============================================================

# DEMO ONLY.
# Move this value to an environment variable before production.
load_dotenv()

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "MIS3032-DEMO-SECRET-CHANGE-IN-PRODUCTION"
)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")

USE_SUPABASE = (
    os.getenv("USE_SUPABASE", "true").lower() == "true"
)

supabase: Client | None = None

if USE_SUPABASE:
    if not SUPABASE_URL or not SUPABASE_PUBLISHABLE_KEY:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required"
        )

    supabase = create_client(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
    )

password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ============================================================
# USERS / RBAC
# ============================================================

users = {
    "employee@demo.com": {
        "id": "1",
        "name": "Employee Demo",
        "email": "employee@demo.com",
        "role": "employee",
        "hashed_password": password_hash.hash("123456"),
        "disabled": False,
    },
    "manager@demo.com": {
        "id": "2",
        "name": "Manager Demo",
        "email": "manager@demo.com",
        "role": "manager",
        "hashed_password": password_hash.hash("123456"),
        "disabled": False,
    },
    "finance@demo.com": {
        "id": "3",
        "name": "Finance Demo",
        "email": "finance@demo.com",
        "role": "finance",
        "hashed_password": password_hash.hash("123456"),
        "disabled": False,
    },
    "procurement@demo.com": {
        "id": "4",
        "name": "Procurement Demo",
        "email": "procurement@demo.com",
        "role": "procurement",
        "hashed_password": password_hash.hash("123456"),
        "disabled": False,
    },
    "admin@demo.com": {
        "id": "5",
        "name": "System Administrator",
        "email": "admin@demo.com",
        "role": "admin",
        "hashed_password": password_hash.hash("123456"),
        "disabled": False,
    },
}


ROLE_PERMISSIONS = {
    "employee": [
        "request:create",
        "request:view",
    ],
    "manager": [
        "request:view",
        "request:approve",
        "request:reject",
        "request:revision",
    ],
    "finance": [
        "budget:view",
        "budget:check",
    ],
    "procurement": [
        "supplier:manage",
        "quotation:manage",
        "quotation:compare",
        "po:create",
        "receiving:manage",
    ],
    "admin": [
        "request:create",
        "request:view",
        "request:approve",
        "request:reject",
        "budget:view",
        "budget:check",
        "supplier:manage",
        "quotation:manage",
        "quotation:compare",
        "po:create",
        "receiving:manage",
        "user:manage",
    ],
}


# ============================================================
# AUTH MODELS
# ============================================================

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    role: str


def public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    }


# ============================================================
# AUTH HELPERS
# ============================================================

def authenticate_user(email: str, password: str):
    user = users.get(email.lower())

    if not user:
        return None

    if user["disabled"]:
        return None

    if not password_hash.verify(password, user["hashed_password"]):
        return None

    return user


def create_access_token(user: dict) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": user["email"],
        "role": user["role"],
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)]
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        email = payload.get("sub")

        if not email:
            raise credentials_exception

    except InvalidTokenError:
        raise credentials_exception

    user = users.get(email.lower())

    if not user:
        raise credentials_exception

    if user["disabled"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is disabled",
        )

    return user


def require_roles(*allowed_roles: str):
    async def role_checker(
        current_user: Annotated[dict, Depends(get_current_user)]
    ):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Role '{current_user['role']}' "
                    f"is not allowed for this action"
                ),
            )

        return current_user

    return role_checker


# ============================================================
# PURCHASE REQUEST MODELS
# ============================================================

class PurchaseRequestInput(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    department: str
    amount: float = Field(gt=0)
    category: str
    justification: str = Field(min_length=5)
    requester: str = "Nguyen Minh Anh"


class Decision(BaseModel):
    action: Literal["approved", "rejected", "revision"]
    comment: str = ""


# ============================================================
# BUSINESS DATA
# ============================================================

budgets = {
    "Operations": {
        "limit": 300_000_000,
        "spent": 184_500_000,
    },
    "Marketing": {
        "limit": 180_000_000,
        "spent": 126_800_000,
    },
    "Engineering": {
        "limit": 500_000_000,
        "spent": 318_200_000,
    },
}

requests: list[dict] = []


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


# ============================================================
# PUBLIC ENDPOINTS
# ============================================================

@app.get("/")
def root():
    return {
        "message": "RoomFlow API",
        "version": "0.2.0",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


# ============================================================
# AUTHENTICATION
# ============================================================

@app.post("/auth/login", response_model=Token)
async def login(
    form_data: Annotated[
        OAuth2PasswordRequestForm,
        Depends()
    ]
):
    user = authenticate_user(
        form_data.username,
        form_data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(user)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": public_user(user),
    }


@app.get("/auth/me", response_model=UserPublic)
async def get_me(
    current_user: Annotated[
        dict,
        Depends(get_current_user)
    ]
):
    return public_user(current_user)


@app.get("/auth/permissions")
async def get_permissions(
    current_user: Annotated[
        dict,
        Depends(get_current_user)
    ]
):
    return {
        "role": current_user["role"],
        "permissions": ROLE_PERMISSIONS.get(
            current_user["role"],
            [],
        ),
    }


# ============================================================
# BUDGET
# FINANCE + ADMIN ONLY
# ============================================================

@app.get("/budgets")
def list_budgets(
    current_user: Annotated[
        dict,
        Depends(require_roles("finance", "admin"))
    ]
):
    return [
        {
            "department": name,
            **budget_for(name, 0),
        }
        for name in budgets
    ]


@app.post("/budget-check")
def check_budget(
    department: str,
    amount: float,
    current_user: Annotated[
        dict,
        Depends(require_roles("finance", "admin"))
    ],
):
    return budget_for(department, amount)


# ============================================================
# PURCHASE REQUESTS
# ============================================================

WORKFLOW_ROLES = ("Manager", "Finance", "Procurement")


def workflow_for_status(status_value: str) -> list[dict]:
    """Return the workflow shape expected by the frontend.

    Supabase stores the workflow state in flat columns, so the API adds
    this computed workflow field to every PR response.
    """
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


@app.get("/purchase-requests")
def list_requests(
    current_user: Annotated[
        dict,
        Depends(get_current_user)
    ]
):
    if USE_SUPABASE and supabase:
        response = (
            supabase
            .table("purchase_requests")
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


@app.post(
    "/purchase-requests",
    status_code=201,
)
def create_request(
    data: PurchaseRequestInput,
    current_user: Annotated[
        dict,
        Depends(require_roles("employee", "admin"))
    ],
):
    budget = budget_for(
        data.department,
        data.amount,
    )

    # UUID suffix prevents duplicate IDs in both Supabase and in-memory mode.
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
            supabase
            .table("purchase_requests")
            .insert(db_request)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to create purchase request",
            )

        created = dict(response.data[0])
        created["workflow"] = workflow_for_status(
            created["status"]
        )
        return created

    requests.append(request)
    return request


# ============================================================
# APPROVAL
# MANAGER ONLY
# ============================================================

@app.post(
    "/purchase-requests/{request_id}/decision"
)
def decide_request(
    request_id: str,
    decision: Decision,
    current_user: Annotated[
        dict,
        Depends(require_roles("manager"))
    ],
):
    if USE_SUPABASE and supabase:
        response = (
            supabase
            .table("purchase_requests")
            .select("*")
            .eq("id", request_id)
            .limit(1)
            .execute()
        )

        request = (
            dict(response.data[0])
            if response.data
            else None
        )

        if request:
            request["workflow"] = workflow_for_status(
                request["status"]
            )
    else:
        request = next(
            (
                item
                for item in requests
                if item["id"] == request_id
            ),
            None,
        )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Purchase request not found",
        )

    # Chỉ request đang chờ Manager Approval mới được xử lý.
    if request["status"] != "PENDING_APPROVAL":
        raise HTTPException(
            status_code=400,
            detail=(
                f"Request is already in "
                f"'{request['status']}' state"
            ),
        )

    manager_step = next(
        (
            item
            for item in request["workflow"]
            if item["role"] == "Manager"
        ),
        None,
    )

    if not manager_step:
        raise HTTPException(
            status_code=400,
            detail="Manager approval step not found",
        )

    # APPROVE: Manager -> Finance.
    if decision.action == "approved":
        approved_at = datetime.now(timezone.utc).isoformat()

        if USE_SUPABASE and supabase:
            response = (
                supabase
                .table("purchase_requests")
                .update({
                    "status": "APPROVED",
                    "approved_by": current_user["email"],
                    "approved_at": approved_at,
                    "approval_comment": decision.comment,
                    "next_approval_role": "Finance",
                })
                .eq("id", request_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to update purchase request",
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

    # REJECT: terminal state.
    if decision.action == "rejected":
        rejected_at = datetime.now(timezone.utc).isoformat()

        if USE_SUPABASE and supabase:
            response = (
                supabase
                .table("purchase_requests")
                .update({
                    "status": "REJECTED",
                    "rejected_by": current_user["email"],
                    "rejected_at": rejected_at,
                    "approval_comment": decision.comment,
                    "next_approval_role": None,
                })
                .eq("id", request_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to update purchase request",
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

    # REQUEST REVISION: terminal state until a new PR/submission is made.
    if decision.action == "revision":
        revision_at = datetime.now(timezone.utc).isoformat()

        if USE_SUPABASE and supabase:
            response = (
                supabase
                .table("purchase_requests")
                .update({
                    "status": "REVISION_REQUIRED",
                    "revision_requested_by": current_user["email"],
                    "revision_requested_at": revision_at,
                    "revision_comment": decision.comment,
                    "next_approval_role": None,
                })
                .eq("id", request_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to update purchase request",
                )

            updated = dict(response.data[0])
            updated["workflow"] = workflow_for_status(
                "REVISION_REQUIRED"
            )
            return updated

        manager_step["status"] = "revision_required"
        manager_step["comment"] = decision.comment
        manager_step["revision_by"] = current_user["email"]

        request["status"] = "REVISION_REQUIRED"
        request["revision_requested_by"] = current_user["email"]
        request["revision_requested_at"] = revision_at
        request["revision_comment"] = decision.comment
        request["next_approval_role"] = None
        request["workflow"] = workflow_for_status(
            "REVISION_REQUIRED"
        )

        return request

    raise HTTPException(
        status_code=400,
        detail="Invalid decision action",
    )
