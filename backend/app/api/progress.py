"""Progress routes: summary, weaknesses, and recent activity."""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import cast, Date, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.lesson import Lesson
from app.models.progress import Badge, GameResult, UserBadge, UserProgress
from app.models.user import User
from app.schemas.progress import (
    ActivityEntry,
    BadgeSummary,
    ProgressSummary,
    SkillBreakdown,
    WeaknessResponse,
    XPHistoryEntry,
)
from app.services.adaptive import get_weaknesses

router = APIRouter(prefix="/progress", tags=["progress"])

# Maps game_type -> skill category for the radar chart
GAME_SKILL_MAP = {
    "word_match": "vocabulary",
    "memory_match": "vocabulary",
    "word_scramble": "vocabulary",
    "flashcard_sprint": "vocabulary",
    "fill_blank": "grammar",
    "translation": "phrases",
    "cultural_quiz": "culture",
    "conversation": "conversation",
    "listening": "phrases",
}


@router.get("/", response_model=ProgressSummary)
async def get_progress(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Return a summary of the authenticated user's learning progress."""
    # Count completed lessons
    lessons_result = await db.execute(
        select(func.count(UserProgress.id)).where(
            UserProgress.user_id == current_user.id
        )
    )
    total_lessons = lessons_result.scalar() or 0

    # Count games played
    games_result = await db.execute(
        select(func.count(GameResult.id)).where(GameResult.user_id == current_user.id)
    )
    total_games = games_result.scalar() or 0

    # Average score across lessons
    avg_result = await db.execute(
        select(func.avg(UserProgress.score)).where(
            UserProgress.user_id == current_user.id
        )
    )
    avg_score = avg_result.scalar() or 0.0

    # Lessons grouped by module (via lesson join)
    module_result = await db.execute(
        select(Lesson.module, func.count(UserProgress.id))
        .join(Lesson, UserProgress.lesson_id == Lesson.id)
        .where(UserProgress.user_id == current_user.id)
        .group_by(Lesson.module)
    )
    lessons_by_module = {row[0]: row[1] for row in module_result.all()}

    # --- Skill Breakdown: average score per skill from game results ---
    skill_result = await db.execute(
        select(
            GameResult.game_type, func.avg(GameResult.score), func.count(GameResult.id)
        )
        .where(GameResult.user_id == current_user.id)
        .group_by(GameResult.game_type)
    )
    # Aggregate scores by skill category
    skill_totals: dict[str, list[float]] = {
        "vocabulary": [],
        "grammar": [],
        "phrases": [],
        "culture": [],
        "conversation": [],
    }
    for game_type, avg_sc, count in skill_result.all():
        skill = GAME_SKILL_MAP.get(game_type)
        if skill and skill in skill_totals:
            skill_totals[skill].extend([float(avg_sc)] * int(count))

    skills = SkillBreakdown(
        vocabulary=round(
            sum(skill_totals["vocabulary"]) / len(skill_totals["vocabulary"]) * 100, 1
        )
        if skill_totals["vocabulary"]
        else 0,
        grammar=round(
            sum(skill_totals["grammar"]) / len(skill_totals["grammar"]) * 100, 1
        )
        if skill_totals["grammar"]
        else 0,
        phrases=round(
            sum(skill_totals["phrases"]) / len(skill_totals["phrases"]) * 100, 1
        )
        if skill_totals["phrases"]
        else 0,
        culture=round(
            sum(skill_totals["culture"]) / len(skill_totals["culture"]) * 100, 1
        )
        if skill_totals["culture"]
        else 0,
        conversation=round(
            sum(skill_totals["conversation"]) / len(skill_totals["conversation"]) * 100,
            1,
        )
        if skill_totals["conversation"]
        else 0,
    )

    # --- XP History: daily XP earned over last 14 days ---
    fourteen_days_ago = datetime.now(timezone.utc) - timedelta(days=14)

    # XP from games
    game_xp_result = await db.execute(
        select(
            cast(GameResult.played_at, Date).label("day"),
            func.sum(GameResult.xp_earned),
        )
        .where(
            GameResult.user_id == current_user.id,
            GameResult.played_at >= fourteen_days_ago,
        )
        .group_by("day")
    )
    daily_xp: dict[str, int] = {}
    for day, xp_sum in game_xp_result.all():
        key = day.isoformat() if hasattr(day, "isoformat") else str(day)
        daily_xp[key] = daily_xp.get(key, 0) + int(xp_sum or 0)

    # XP from lesson completions (estimate 50 XP * score per lesson)
    lesson_xp_result = await db.execute(
        select(
            cast(UserProgress.completed_at, Date).label("day"),
            func.sum(UserProgress.score * 50),
        )
        .where(
            UserProgress.user_id == current_user.id,
            UserProgress.completed_at >= fourteen_days_ago,
        )
        .group_by("day")
    )
    for day, xp_sum in lesson_xp_result.all():
        key = day.isoformat() if hasattr(day, "isoformat") else str(day)
        daily_xp[key] = daily_xp.get(key, 0) + int(xp_sum or 0)

    # Build full 14-day timeline (fill in zero days)
    xp_history = []
    for i in range(14):
        day = (datetime.now(timezone.utc) - timedelta(days=13 - i)).date()
        key = day.isoformat()
        xp_history.append(
            XPHistoryEntry(date=day.strftime("%b %d"), xp=daily_xp.get(key, 0))
        )

    # --- Badges ---
    badge_result = await db.execute(
        select(Badge, UserBadge.earned_at).outerjoin(
            UserBadge,
            (UserBadge.badge_id == Badge.id) & (UserBadge.user_id == current_user.id),
        )
    )
    badges = [
        BadgeSummary(
            id=str(badge.id),
            name=badge.name,
            description=badge.description,
            icon=badge.icon,
            earned=earned_at is not None,
            earned_at=earned_at,
        )
        for badge, earned_at in badge_result.all()
    ]

    return ProgressSummary(
        total_lessons_completed=total_lessons,
        total_games_played=total_games,
        total_xp=current_user.xp,
        current_level=current_user.level,
        current_streak=current_user.streak,
        average_score=round(float(avg_score), 3),
        lessons_by_module=lessons_by_module,
        xp_history=xp_history,
        skills=skills,
        badges=badges,
    )


@router.get("/weaknesses", response_model=list[WeaknessResponse])
async def get_user_weaknesses(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Return the user's weakness areas sorted by error count."""
    weaknesses = await get_weaknesses(db, current_user.id)
    return weaknesses


@router.get("/recent-activity", response_model=list[ActivityEntry])
async def get_recent_activity(
    limit: int = Query(10, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return recent lessons completed and games played."""
    activities = []

    # Recent lesson completions
    lesson_result = await db.execute(
        select(Lesson.title, UserProgress.score, UserProgress.completed_at)
        .join(Lesson, UserProgress.lesson_id == Lesson.id)
        .where(UserProgress.user_id == current_user.id)
        .order_by(UserProgress.completed_at.desc())
        .limit(limit)
    )
    for title, score, ts in lesson_result.all():
        activities.append(
            ActivityEntry(type="lesson", title=title, xp=int(score * 50), timestamp=ts)
        )

    # Recent game results
    game_result = await db.execute(
        select(GameResult.game_type, GameResult.xp_earned, GameResult.played_at)
        .where(GameResult.user_id == current_user.id)
        .order_by(GameResult.played_at.desc())
        .limit(limit)
    )
    for game_type, xp_earned, ts in game_result.all():
        activities.append(
            ActivityEntry(
                type="game",
                title=game_type.replace("_", " ").title(),
                xp=xp_earned,
                timestamp=ts,
            )
        )

    # Sort combined by timestamp descending
    activities.sort(key=lambda a: a.timestamp, reverse=True)
    return activities[:limit]
