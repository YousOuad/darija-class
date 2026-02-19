from typing import Any, Dict, List
from uuid import UUID

from pydantic import BaseModel, Field


class LessonBase(BaseModel):
    level: str
    module: str
    order: int
    title: str


class LessonResponse(LessonBase):
    id: UUID
    content_json: Dict[str, Any]

    model_config = {"from_attributes": True}


class LessonListResponse(BaseModel):
    lessons: List[LessonResponse]
    total: int


class LessonCompleteRequest(BaseModel):
    score: float = Field(..., ge=0.0, le=1.0, description="Score between 0 and 1")
