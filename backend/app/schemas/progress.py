from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class XPHistoryEntry(BaseModel):
    date: str
    xp: int


class SkillBreakdown(BaseModel):
    vocabulary: float = 0
    grammar: float = 0
    phrases: float = 0
    culture: float = 0
    conversation: float = 0


class BadgeSummary(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    earned: bool = False
    earned_at: Optional[datetime] = None


class ProgressSummary(BaseModel):
    total_lessons_completed: int
    total_games_played: int
    total_xp: int
    current_level: str
    current_streak: int
    average_score: float
    lessons_by_module: dict = {}
    xp_history: List[XPHistoryEntry] = []
    skills: SkillBreakdown = SkillBreakdown()
    badges: List[BadgeSummary] = []


class WeaknessResponse(BaseModel):
    skill_area: str
    error_count: int
    last_tested: Optional[datetime] = None

    model_config = {"from_attributes": True}


class BadgeResponse(BaseModel):
    id: UUID
    name: str
    description: str
    icon: str
    earned_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class LeaderboardUserEntry(BaseModel):
    user_id: UUID
    display_name: str
    xp_total: int
    rank: int


class LeaderboardResponse(BaseModel):
    period: str
    entries: List[LeaderboardUserEntry]
    user_rank: Optional[int] = None


class StreakResponse(BaseModel):
    current_streak: int
    last_active: Optional[datetime] = None


class ActivityEntry(BaseModel):
    type: str
    title: str
    xp: int
    timestamp: datetime
