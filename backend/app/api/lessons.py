"""Lesson routes: list, detail, complete."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.lesson import Lesson
from app.models.progress import UserProgress
from app.models.user import User
from app.schemas.lesson import LessonCompleteRequest, LessonListResponse, LessonResponse
from app.services.xp import (
    LESSON_COMPLETE_XP,
    calculate_xp,
    check_badges,
    update_streak,
)

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/", response_model=LessonListResponse)
async def list_lessons(
    level: Optional[str] = Query(None, description="Filter by level (a1, a2, b1, b2)"),
    module: Optional[str] = Query(None, description="Filter by module name"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List available lessons, optionally filtered by level and module."""
    stmt = select(Lesson)

    if level is not None:
        stmt = stmt.where(Lesson.level == level)
    if module is not None:
        stmt = stmt.where(Lesson.module == module)

    stmt = stmt.order_by(Lesson.level, Lesson.module, Lesson.order)

    result = await db.execute(stmt)
    lessons = list(result.scalars().all())

    return LessonListResponse(
        lessons=[LessonResponse.model_validate(l) for l in lessons], total=len(lessons)
    )


@router.get("/recommended", response_model=LessonResponse)
async def get_recommended_lesson(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get the next recommended lesson based on user level and progress."""
    completed_result = await db.execute(
        select(UserProgress.lesson_id).where(UserProgress.user_id == current_user.id)
    )
    completed_ids = {row[0] for row in completed_result.all()}

    # Find first uncompleted lesson at user's level (skip game_content lessons)
    result = await db.execute(
        select(Lesson)
        .where(Lesson.level == current_user.level, Lesson.order < 999)
        .order_by(Lesson.module, Lesson.order)
    )
    for lesson in result.scalars().all():
        if lesson.id not in completed_ids:
            return lesson

    # All done at current level - try next level
    level_up = {"a2": "b1", "b1": "b2"}
    next_level = level_up.get(current_user.level)
    if next_level:
        result = await db.execute(
            select(Lesson)
            .where(Lesson.level == next_level, Lesson.order < 999)
            .order_by(Lesson.module, Lesson.order)
            .limit(1)
        )
        lesson = result.scalar_one_or_none()
        if lesson:
            return lesson

    # Fallback: first lesson of user's level
    result = await db.execute(
        select(Lesson)
        .where(Lesson.level == current_user.level, Lesson.order < 999)
        .order_by(Lesson.module, Lesson.order)
        .limit(1)
    )
    lesson = result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No lessons available"
        )
    return lesson


@router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single lesson by its ID."""
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()

    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found"
        )

    return lesson


@router.post("/{lesson_id}/complete")
async def complete_lesson(
    lesson_id: UUID,
    payload: LessonCompleteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a lesson as completed and award XP."""
    # Verify lesson exists
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found"
        )

    # Update streak
    streak = await update_streak(db, current_user.id)

    # Calculate XP
    xp_earned = calculate_xp(
        base_xp=LESSON_COMPLETE_XP, accuracy=payload.score, streak_days=streak
    )

    # Record progress
    progress = UserProgress(
        user_id=current_user.id, lesson_id=lesson_id, score=payload.score
    )
    db.add(progress)

    # Update user XP
    current_user.xp += xp_earned
    await db.flush()

    # Check badges
    badges = await check_badges(db, current_user.id, latest_score=payload.score)

    return {
        "xp_earned": xp_earned,
        "new_total_xp": current_user.xp,
        "streak": streak,
        "badges_earned": badges,
    }
