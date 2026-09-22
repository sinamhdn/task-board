import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from server.app.schemas.card import CardResponse


class ListResponse(BaseModel):
    id: int
    uid: uuid.UUID
    board_id: int
    name: str
    created_at: datetime
    updated_at: Optional[datetime]
    owned_cards: list[CardResponse] = []
    model_config = ConfigDict(from_attributes=True)


class ListCreate(BaseModel):
    list_name: str