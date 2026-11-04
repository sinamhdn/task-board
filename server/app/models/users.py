from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CheckConstraint, Index, Integer, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from ..utils.db import Base
from .members import members_table

if TYPE_CHECKING:
    from .boards import Board


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uid: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), unique=True, default=uuid.uuid4, index=True
    )
    first_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    image_file: Mapped[Optional[str]] = mapped_column(
        String(200), nullable=True, default=None
    )
    is_active: Mapped[bool] = mapped_column(default=True)
    is_verified: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now(timezone.utc))
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        default=datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    owned_boards: Mapped[list[Board]] = relationship(
        "Board",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    membered_boards: Mapped[list["Board"]] = relationship(
        "Board",
        secondary=members_table,
        back_populates="members",  # points to Board.members
        cascade="all, delete",  # safer; don't delete boards automatically
    )

    __table_args__ = (
        Index(
            "ix_users_email_lower", func.lower(email)
        ),  # Optional: case-insensitive email index
        CheckConstraint(
            func.char_length(first_name) >= 3, name="some_string_min_length"
        ),
        CheckConstraint(
            func.char_length(last_name) >= 3, name="some_string_min_length"
        ),
        CheckConstraint(func.char_length(email) >= 10, name="some_string_min_length"),
    )

    @property
    def full_name(self) -> str:
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name or self.last_name or "Anonymous"

    @property
    def image_path(self) -> str:
        if self.image_file:
            return f"/media/profile_pics/{self.image_file}"
        return "/static/profile_pics/default.jpg"

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"

    @validates("first_name")
    def validate_first_name(self, key, value):
        if len(value) < 3:
            raise ValueError("Firstname must be at least 3 characters")
        return value

    @validates("last_name")
    def validate_last_name(self, key, value):
        if len(value) < 3:
            raise ValueError("Lastname must be at least 3 characters")
        return value
