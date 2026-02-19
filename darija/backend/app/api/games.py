"""Game routes: session generation and result submission."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.progress import GameResult
from app.models.user import User
from app.schemas.game import GameSessionResponse, GameSubmitRequest, GameSubmitResponse
from app.services.adaptive import generate_session, track_answer
from app.services.xp import GAME_COMPLETE_XP, calculate_xp, check_badges, update_streak

router = APIRouter(prefix="/games", tags=["games"])


LEVEL_LABELS = {
    "a1": "Beginner",
    "a2": "Elementary",
    "b1": "Intermediate",
    "b2": "Upper-Intermediate",
}


@router.get("/session", response_model=GameSessionResponse)
async def get_game_session(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Generate a daily game session tailored to the user's level and weaknesses."""
    level = current_user.level
    games = await generate_session(db, current_user.id, level)
    return GameSessionResponse(
        games=games, level=level, level_label=LEVEL_LABELS.get(level, level.upper())
    )


@router.post("/{game_type}/submit", response_model=GameSubmitResponse)
async def submit_game(
    game_type: str,
    payload: GameSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit game results, calculate XP, and check for new badges."""
    valid_types = {
        "word_match",
        "fill_blank",
        "listening",
        "translation",
        "conversation",
    }
    if game_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid game type. Must be one of: {', '.join(sorted(valid_types))}",
        )

    # Track individual answers for adaptive learning
    skill_map = {
        "word_match": "vocabulary",
        "fill_blank": "grammar",
        "listening": "listening",
        "translation": "translation",
        "conversation": "conversation",
    }
    skill_area = skill_map.get(game_type, game_type)

    for answer in payload.answers:
        is_correct = answer.get("correct", False)
        await track_answer(db, current_user.id, skill_area, is_correct)

    # Update streak
    streak = await update_streak(db, current_user.id)

    # Calculate XP
    xp_earned = calculate_xp(
        base_xp=GAME_COMPLETE_XP, accuracy=payload.score, streak_days=streak
    )

    # Record game result
    game_result = GameResult(
        user_id=current_user.id,
        game_type=game_type,
        score=payload.score,
        xp_earned=xp_earned,
    )
    db.add(game_result)

    # Update user XP
    current_user.xp += xp_earned
    await db.flush()

    # Check badges
    badges = await check_badges(db, current_user.id, latest_score=payload.score)

    return GameSubmitResponse(
        xp_earned=xp_earned, new_total_xp=current_user.xp, badges_earned=badges
    )
