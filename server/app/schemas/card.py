import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CardCreateRequest(BaseModel):
    card_id: int
    card_name: str
    list_id: int
    board_id: int


class CardResponse(BaseModel):
    id: int
    uid: uuid.UUID
    list_id: int
    name: str
    created_at: datetime
    updated_at: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)
