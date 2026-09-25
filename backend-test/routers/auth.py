from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from data_store import ROLE_PERMISSIONS
from models import Token, UserPublic
from security import (
    authenticate_user,
    create_access_token,
    get_current_user,
    public_user,
)


router = APIRouter()


@router.post("/auth/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    user = authenticate_user(form_data.username, form_data.password)
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


@router.get("/auth/me", response_model=UserPublic)
async def get_me(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    return public_user(current_user)


@router.get("/auth/permissions")
async def get_permissions(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    return {
        "role": current_user["role"],
        "permissions": ROLE_PERMISSIONS.get(current_user["role"], []),
    }
