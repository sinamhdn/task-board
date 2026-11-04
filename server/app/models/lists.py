from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from ..utils.db import Base

# to avoid circular dependency problem we do this
# instead we need to impoert each one inside __init__.py to solve name import problem in relationshipts
if TYPE_CHECKING:
    from .boards import Board
    from .cards import Card


class List(Base):
    __tablename__ = "lists"

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
    board_id: Mapped[int] = mapped_column(ForeignKey("boards.id"), nullable=False)
    owner_board: Mapped[Board] = relationship(
        "Board", foreign_keys=[board_id], back_populates="owned_lists"
    )
    owned_cards: Mapped[list[Card]] = relationship(
        "Card",
        back_populates="owner_list",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<List(id={self.id}, name={self.name})>"

    __table_args__ = (
        CheckConstraint(func.char_length(name) >= 3, name="some_string_min_length"),
    )

    @validates("name")
    def validate_name(self, key, value):
        if len(value) < 3:
            raise ValueError("List name must be at least 3 characters")
        return value
