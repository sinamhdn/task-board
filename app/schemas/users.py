import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator
from sqlmodel import Field, SQLModel

from ..models.users import UserBase


class UserBase(BaseModel):
    first_name: str = Field(min_length=2, max_length=100)
    last_name: str = Field(min_length=2, max_length=100)
    email: EmailStr = Field(max_length=120)


class UserCreate(UserBase):
    """schema for creating a new user"""

    password: str = Field(min_length=8, max_length=100)

    @field_validator
    @classmethod
    def validate_password(cls, v):
        """validate password complexity"""
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(char.islower() for char in v):
            raise ValueError("Password must contain at least one lowercase letter")
        return v


class UserUpdate(BaseModel):
    """Schema for updating user"""

    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    email: Optional[EmailStr] = Field(default=None, max_length=255)
    password: Optional[str] = Field(default=None, min_length=8, max_length=100)


class UserPublicResponse(BaseModel):
    """Schema for returning user data (excludes sensitive info)"""

    id: uuid.UUID
    full_name: str
    image_file: str | None
    image_path: str | None

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat(), uuid.UUID: lambda v: str(v)}


class UserPrivateResponse(UserPublicResponse):
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime]
