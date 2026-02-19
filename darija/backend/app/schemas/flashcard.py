from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class FlashcardCreate(BaseModel):
    front_arabic: str = Field(..., min_length=1, max_length=500)
    front_latin: str = Field(..., min_length=1, max_length=500)
    back: str = Field(..., min_length=1, max_length=500)
    is_public: bool = True


class FlashcardResponse(BaseModel):
    id: UUID
    front_arabic: str
    front_latin: str
    back: str
    is_public: bool
    created_at: datetime
    owner_name: str = ""

    model_config = {"from_attributes": True}


class DeckResponse(BaseModel):
    user_id: UUID
    display_name: str
    card_count: int
    cards: List[FlashcardResponse]
