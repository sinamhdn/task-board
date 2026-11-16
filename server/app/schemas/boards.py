import uuid
from datetime import datetime
from email.policy import default
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .users import UserPublicResponse


class BoardResponse(BaseModel):
    id: int
    uid: uuid.UUID
    user_id: int
    name: str
    created_at: datetime
    updated_at: Optional[datetime]
    # members: list[UserPublicResponse] = []
    model_config = ConfigDict(from_attributes=True)


class BoardResponseWithMembers(BaseModel):
    id: int
    uid: uuid.UUID
    user_id: int
    name: str
    created_at: datetime
    updated_at: Optional[datetime]
    members: list[UserPublicResponse] = []
    model_config = ConfigDict(from_attributes=True)


class BoardCreateRequest(BaseModel):
    board_name: str = Field(min_length=3)


class BoardMemberAddRequest(BaseModel):
    board_member_email: EmailStr
