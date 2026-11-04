from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from ..utils.db import Base
from .members import members_table

if TYPE_CHECKING:
    from .cards import Card
    from .lists import List
    from .users import User


class Board(Base):
    __tablename__ = "boards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uid: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), unique=True, default=uuid.uuid4, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now(timezone.utc))
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        default=datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    owner: Mapped[User] = relationship(
        "User", foreign_keys=[user_id], back_populates="owned_boards"
    )
    members: Mapped[list[User]] = relationship(
        "User", secondary=members_table, back_populates="membered_boards"
    )
    owned_lists: Mapped[list[List]] = relationship(
        "List",
        back_populates="owner_board",
        cascade="all, delete-orphan",
    )
    owned_cards: Mapped[list[Card]] = relationship(
        "Card",
        back_populates="owner_board",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint(func.char_length(name) >= 3, name="some_string_min_length"),
    )

    def __repr__(self) -> str:
        return f"<Board(id={self.id}, name={self.name})>"

    @validates("name")
    def validate_name(self, key, value):
        if len(value) < 3:
            raise ValueError("Board name must be at least 3 characters")
        return value
