from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from ..utils.db import Base

if TYPE_CHECKING:
    from .boards import Board
    from .lists import List


class Card(Base):
    __tablename__ = "cards"

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
    list_id: Mapped[int] = mapped_column(ForeignKey("lists.id"), nullable=False)
    board_id: Mapped[int] = mapped_column(ForeignKey("boards.id"), nullable=False)
    owner_list: Mapped[List] = relationship(
        "List", foreign_keys=[list_id], back_populates="owned_cards"
    )
    owner_board: Mapped[Board] = relationship(
        "Board", foreign_keys=[board_id], back_populates="owned_cards"
    )

    __table_args__ = (
        CheckConstraint(func.char_length(name) >= 3, name="some_string_min_length"),
    )

    def __repr__(self) -> str:
        return f"<Card(id={self.id}, name={self.name})>"

    @validates("name")
    def validate_name(self, key, value):
        if len(value) < 3:
            raise ValueError("Card name must be at least 3 characters")
        return value
