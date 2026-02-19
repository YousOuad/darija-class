"""Adaptive learning engine for DarijaLingo.

Tracks user performance and generates personalised game sessions
that prioritise weak skill areas.
"""

from datetime import datetime, timezone
from typing import List
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.progress import UserWeakness


# ---------------------------------------------------------------------------
# Track individual answers
# ---------------------------------------------------------------------------


async def track_answer(
    db: AsyncSession, user_id: UUID, skill_area: str, is_correct: bool
) -> None:
    """Record whether the user answered correctly for a given skill area.

    Increments error_count when the answer is wrong.  If the skill area does
    not exist yet for the user, a new row is created.
    """
    result = await db.execute(
        select(UserWeakness).where(
            UserWeakness.user_id == user_id, UserWeakness.skill_area == skill_area
        )
    )
    weakness = result.scalar_one_or_none()

    now = datetime.now(timezone.utc)

    if weakness is None:
        weakness = UserWeakness(
            user_id=user_id,
            skill_area=skill_area,
            error_count=0 if is_correct else 1,
            last_tested=now,
        )
        db.add(weakness)
    else:
        if not is_correct:
            weakness.error_count += 1
        weakness.last_tested = now

    await db.flush()


# ---------------------------------------------------------------------------
# Retrieve weaknesses
# ---------------------------------------------------------------------------


async def get_weaknesses(db: AsyncSession, user_id: UUID) -> List[UserWeakness]:
    """Return the user's weakness areas ordered by error count descending."""
    result = await db.execute(
        select(UserWeakness)
        .where(UserWeakness.user_id == user_id)
        .order_by(UserWeakness.error_count.desc())
    )
    return list(result.scalars().all())


# ---------------------------------------------------------------------------
# Generate a prioritised game session
# ---------------------------------------------------------------------------

# Default game types available in the platform
GAME_TYPES = [
    {
        "game_type": "word_match",
        "title": "Word Match",
        "description": "Match Darija words with their meanings",
    },
    {
        "game_type": "fill_blank",
        "title": "Fill in the Blank",
        "description": "Complete the sentence with the correct Darija word",
    },
    {
        "game_type": "listening",
        "title": "Listening Challenge",
        "description": "Listen and choose the correct transliteration",
    },
    {
        "game_type": "translation",
        "title": "Translation",
        "description": "Translate sentences between Darija and English",
    },
    {
        "game_type": "conversation",
        "title": "Conversation Practice",
        "description": "Practice conversation with an AI partner in Darija",
    },
]


async def generate_session(db: AsyncSession, user_id: UUID, level: str) -> List[dict]:
    """Generate a daily game session prioritising the user's weak areas.

    The returned list contains game config dicts ready to be serialised
    as ``GameConfig`` schemas.
    """
    weaknesses = await get_weaknesses(db, user_id)

    # Build a list of games; put weakness-related ones first
    session_games: List[dict] = []
    used_types: set = set()

    # Map skill areas to relevant game types
    skill_to_game = {
        "vocabulary": "word_match",
        "grammar": "fill_blank",
        "listening": "listening",
        "translation": "translation",
        "conversation": "conversation",
    }

    for w in weaknesses[:3]:
        game_type = skill_to_game.get(w.skill_area)
        if game_type and game_type not in used_types:
            game_def = next(
                (g for g in GAME_TYPES if g["game_type"] == game_type), None
            )
            if game_def:
                session_games.append(
                    {**game_def, "config": {"level": level, "focus": w.skill_area}}
                )
                used_types.add(game_type)

    # Fill remaining slots with games not yet included
    for g in GAME_TYPES:
        if g["game_type"] not in used_types:
            session_games.append({**g, "config": {"level": level}})
            used_types.add(g["game_type"])

    return session_games
