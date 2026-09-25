from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError

from config import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY
from data_store import password_hash, users


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    }


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
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
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
        current_user: Annotated[dict, Depends(get_current_user)],
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
