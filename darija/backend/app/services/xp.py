"""XP and gamification service for DarijaLingo.

Handles XP calculation, streak management, and badge awards.
"""

from datetime import datetime, timedelta, timezone
from typing import List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.progress import Badge, GameResult, UserBadge, UserProgress
from app.models.user import User

# ---------------------------------------------------------------------------
# XP constants
# ---------------------------------------------------------------------------

LESSON_COMPLETE_XP = 50
GAME_COMPLETE_XP = 30
PERFECT_SCORE_BONUS = 20
STREAK_BONUS_PER_DAY = 10


# ---------------------------------------------------------------------------
# XP calculation
# ---------------------------------------------------------------------------


def calculate_xp(base_xp: int, accuracy: float, streak_days: int = 0) -> int:
    """Calculate total XP earned for an activity.

    Parameters
    ----------
    base_xp : int
        Base XP for the activity (e.g. LESSON_COMPLETE_XP or GAME_COMPLETE_XP).
    accuracy : float
        Score between 0.0 and 1.0.
    streak_days : int
        Current streak length in days (used for bonus).

    Returns
    -------
    int
        Total XP earned, including bonuses.
    """
    xp = int(base_xp * accuracy)

    # Perfect score bonus
    if accuracy >= 1.0:
        xp += PERFECT_SCORE_BONUS

    # Streak bonus
    if streak_days > 0:
        xp += STREAK_BONUS_PER_DAY * min(streak_days, 30)  # cap at 30 days

    return max(xp, 1)  # always award at least 1 XP


# ---------------------------------------------------------------------------
# Streak management
# ---------------------------------------------------------------------------


async def update_streak(db: AsyncSession, user_id: UUID) -> int:
    """Update the user's daily streak and return the new streak count.

    If the user was active yesterday, increment the streak.
    If the user was already active today, leave it unchanged.
    Otherwise, reset to 1.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        return 0

    now = datetime.now(timezone.utc)
    today = now.date()

    if user.last_active is not None:
        last_date = user.last_active.date()
        if last_date == today:
            # Already counted today
            return user.streak
        elif last_date == today - timedelta(days=1):
            user.streak += 1
        else:
            user.streak = 1
    else:
        user.streak = 1

    user.last_active = now
    await db.flush()
    return user.streak


# ---------------------------------------------------------------------------
# Badge checking
# ---------------------------------------------------------------------------

# Built-in badge definitions (criteria checked in code)
BADGE_DEFINITIONS = [
    {
        "name": "First Steps",
        "description": "Complete your first lesson",
        "icon": "footprints",
        "check": "lessons_completed",
        "threshold": 1,
    },
    {
        "name": "Scholar",
        "description": "Complete 10 lessons",
        "icon": "book",
        "check": "lessons_completed",
        "threshold": 10,
    },
    {
        "name": "Game On",
        "description": "Play your first game",
        "icon": "gamepad",
        "check": "games_played",
        "threshold": 1,
    },
    {
        "name": "Streak Master",
        "description": "Reach a 7-day streak",
        "icon": "fire",
        "check": "streak",
        "threshold": 7,
    },
    {
        "name": "XP Hunter",
        "description": "Earn 500 XP total",
        "icon": "trophy",
        "check": "total_xp",
        "threshold": 500,
    },
    {
        "name": "Perfectionist",
        "description": "Get a perfect score on any activity",
        "icon": "star",
        "check": "perfect_score",
        "threshold": 1,
    },
]


async def check_badges(
    db: AsyncSession, user_id: UUID, latest_score: float = 0.0
) -> List[dict]:
    """Check all badge criteria and award any newly earned badges.

    Returns a list of dicts describing newly earned badges.
    """
    # Gather user stats
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if user is None:
        return []

    lessons_result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == user_id)
    )
    lessons_completed = len(lessons_result.scalars().all())

    games_result = await db.execute(
        select(GameResult).where(GameResult.user_id == user_id)
    )
    games_played = len(games_result.scalars().all())

    # Already-earned badge names
    earned_result = await db.execute(
        select(UserBadge.badge_id).where(UserBadge.user_id == user_id)
    )
    earned_badge_ids = {row[0] for row in earned_result.all()}

    newly_earned: List[dict] = []

    for badge_def in BADGE_DEFINITIONS:
        check = badge_def["check"]
        threshold = badge_def["threshold"]
        met = False

        if check == "lessons_completed":
            met = lessons_completed >= threshold
        elif check == "games_played":
            met = games_played >= threshold
        elif check == "streak":
            met = user.streak >= threshold
        elif check == "total_xp":
            met = user.xp >= threshold
        elif check == "perfect_score":
            met = latest_score >= 1.0

        if not met:
            continue

        # Ensure the badge row exists in the badges table
        badge_row_result = await db.execute(
            select(Badge).where(Badge.name == badge_def["name"])
        )
        badge_row = badge_row_result.scalar_one_or_none()
        if badge_row is None:
            badge_row = Badge(
                name=badge_def["name"],
                description=badge_def["description"],
                icon=badge_def["icon"],
                criteria_json={"check": check, "threshold": threshold},
            )
            db.add(badge_row)
            await db.flush()

        if badge_row.id in earned_badge_ids:
            continue

        # Award badge
        user_badge = UserBadge(user_id=user_id, badge_id=badge_row.id)
        db.add(user_badge)
        await db.flush()

        newly_earned.append(
            {
                "name": badge_def["name"],
                "description": badge_def["description"],
                "icon": badge_def["icon"],
            }
        )

    return newly_earned
