from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..utils.db import Base

if TYPE_CHECKING:
    from .cards import Card
    from .users import Board


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
    owner: Mapped[Board] = relationship(
        "Board", foreign_keys=[board_id], back_populates="owned_lists"
    )
    owned_cards: Mapped[list[Card]] = relationship(
        "Card",
        back_populates="owner",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<List(id={self.id}, name={self.name})>"
