"""AI game routes: Claude Haiku conversation proxy."""

from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.claude import generate_conversation_response

router = APIRouter(prefix="/ai", tags=["ai"])


class ConversationTurn(BaseModel):
    role: str
    content: str


class ConversationRequest(BaseModel):
    message: str
    history: List[ConversationTurn] = []


class ConversationResponse(BaseModel):
    response: str
    error: str | None = None


@router.post("/conversation", response_model=ConversationResponse)
async def conversation(
    payload: ConversationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Proxy a conversation turn to Claude Haiku acting as a Darija partner."""
    history_dicts: List[Dict[str, str]] = [
        {"role": t.role, "content": t.content} for t in payload.history
    ]

    result = await generate_conversation_response(
        user_level=current_user.level,
        conversation_history=history_dicts,
        user_message=payload.message,
    )

    return ConversationResponse(response=result["response"], error=result.get("error"))
