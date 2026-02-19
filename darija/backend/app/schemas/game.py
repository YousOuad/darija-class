from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class GameConfig(BaseModel):
    game_type: str
    title: str
    description: str
    config: Dict[str, Any] = {}


class GameSessionResponse(BaseModel):
    games: List[GameConfig]


class GameSubmitRequest(BaseModel):
    game_type: str
    score: float = Field(..., ge=0.0, le=1.0)
    answers: List[Dict[str, Any]] = []


class BadgeEarned(BaseModel):
    name: str
    description: str
    icon: str


class GameSubmitResponse(BaseModel):
    xp_earned: int
    new_total_xp: int
    badges_earned: List[BadgeEarned] = []
