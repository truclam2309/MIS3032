from datetime import datetime, timedelta, timezone
from typing import Annotated, Literal

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
SECRET_KEY = "MIS3032-DEMO-SECRET-CHANGE-IN-PRODUCTION"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

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

@app.get("/purchase-requests")
def list_requests(
    current_user: Annotated[
        dict,
        Depends(get_current_user)
    ]
):
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

    request_id = (
        f"PR-{datetime.now().year}-"
        f"{len(requests) + 1:04d}"
    )

    request = {
        "id": request_id,
        **data.model_dump(),
        "created_by": current_user["email"],
        "created_role": current_user["role"],
        "status": "PENDING_APPROVAL",
        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),
        "budget": budget,
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

    requests.append(request)

    return request


# ============================================================
# APPROVAL
# MANAGER + ADMIN ONLY
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

    # Chỉ request đang chờ Manager Approval mới được xử lý
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

    # APPROVE
    if decision.action == "approved":
        manager_step["status"] = "approved"
        manager_step["comment"] = decision.comment
        manager_step["approved_by"] = current_user["email"]

        request["status"] = "APPROVED"
        request["approved_by"] = current_user["email"]
        request["approved_at"] = datetime.now(
            timezone.utc
        ).isoformat()
        request["approval_comment"] = decision.comment

        next_step = next(
            (
                item
                for item in request["workflow"]
                if item["status"] == "waiting"
            ),
            None,
        )

        if next_step:
            next_step["status"] = "pending"
            request["next_approval_role"] = next_step["role"]

        return request

    # REJECT
    if decision.action == "rejected":
        manager_step["status"] = "rejected"
        manager_step["comment"] = decision.comment
        manager_step["rejected_by"] = current_user["email"]

        request["status"] = "REJECTED"
        request["rejected_by"] = current_user["email"]
        request["rejected_at"] = datetime.now(
            timezone.utc
        ).isoformat()
        request["approval_comment"] = decision.comment

        return request

    # REQUEST REVISION
    if decision.action == "revision":
        manager_step["status"] = "revision_required"
        manager_step["comment"] = decision.comment
        manager_step["revision_by"] = current_user["email"]

        request["status"] = "REVISION_REQUIRED"
        request["revision_requested_by"] = current_user["email"]
        request["revision_requested_at"] = datetime.now(
            timezone.utc
        ).isoformat()
        request["revision_comment"] = decision.comment

        return request

    raise HTTPException(
        status_code=400,
        detail="Invalid decision action",
    )