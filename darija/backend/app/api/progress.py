"""Progress routes: summary, weaknesses, and recent activity."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select, union_all, literal_column
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.lesson import Lesson
from app.models.progress import GameResult, UserProgress
from app.models.user import User
from app.schemas.progress import ActivityEntry, ProgressSummary, WeaknessResponse
from app.services.adaptive import get_weaknesses

router = APIRouter(prefix="/progress", tags=["progress"])


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

    return ProgressSummary(
        total_lessons_completed=total_lessons,
        total_games_played=total_games,
        total_xp=current_user.xp,
        current_level=current_user.level,
        current_streak=current_user.streak,
        average_score=round(float(avg_score), 3),
        lessons_by_module=lessons_by_module,
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
