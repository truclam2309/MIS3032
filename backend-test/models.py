from typing import Literal

from pydantic import BaseModel, Field


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    role: str


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
