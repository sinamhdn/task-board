from __future__ import annotations
from typing import Optional
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pydantic import EmailStr, field_validator
from passlib.context import CryptContext
import uuid

from utils.db import Base

pwd_context = CryptContext(schemas=["bcrypt"], deprecated="auto")


class UserBase(Base):
    first_name = Mapped[str] = mapped_column(String(50), default=None, max_length=50)
    last_name = Mapped[str] = mapped_column(String(50), default=None, max_length=50)
    email: Mapped[str | None] = mapped_column(
        String(120), unique=True, index=True, max_length=25, nullable=False
    )
    image_file: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
        default=None,
    )

    @property
    def image_path(self) -> str:
        if self.image_file:
            return f"/media/profile_pics/{self.image_file}"
        return "/static/profile_pics/default.jpg"

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, v):
        if v is not None and len(v.strip()) == 0:
            return None


class User(UserBase, table=True):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4, primary_key=True, index=True
    )
    hashed_password: Mapped[str] = mapped_column(nullable=False, max_length=255)
    is_active: Mapped[bool] = mapped_column(default=True)
    is_verified: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: Optional[datetime] = mapped_column(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )

    @property
    def full_name(self) -> str:
        """return the users fullname (property allows function call without paranthesis)"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return f"{self.first_name}"
        elif self.last_name:
            return f"{self.last_name}"
        else:
            return "Anonymous"

    def set_password(self, password: str) -> None:
        """hash and set the password"""
        self.hashed_password = pwd_context.hash(password)

    def verify_password(self, passwprd: str) -> None:
        """verify password againt saved password in database"""
        pwd_context.verify(passwprd, self.hashed_password)
