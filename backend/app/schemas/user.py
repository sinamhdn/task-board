from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field
from pydantic import EmailStr, field_validator
import uuid
from ..models.user import UserBase


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


class UserUpdate(SQLModel):
    """Schema for updating user"""

    first_name: Optional[str] = Field(default=None, max_length=50)
    last_name: Optional[str] = Field(default=None, max_length=50)
    email: Optional[EmailStr] = Field(default=None, max_length=255)
    password: Optional[str] = Field(default=None, min_length=8, max_length=100)


class UserResponse(UserBase):
    """Schema for returning user data (excludes sensitive info)"""

    id: uuid.UUID
    full_name: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat(), uuid.UUID: lambda v: str(v)}
