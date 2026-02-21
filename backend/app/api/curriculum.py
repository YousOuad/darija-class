"""Curriculum endpoints: load, list modules, get module, update/create/delete lessons."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_teacher_or_admin
from app.models.lesson import Lesson

router = APIRouter(prefix="/curriculum", tags=["curriculum"])


# ---------------------------------------------------------------------------
# Original load endpoint (kept for backward compatibility with seed scripts)
# ---------------------------------------------------------------------------


@router.post("/load", status_code=status.HTTP_201_CREATED)
async def load_curriculum(request: Request, db: AsyncSession = Depends(get_db)):
    """Load a curriculum module JSON into the lessons table.

    Expects the full module JSON body. Extracts each lesson and stores it.
    Skips lessons that already exist (by lesson_id matching title+level+module).
    """
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    module_id = data.get("module_id", "unknown")
    level = data.get("level", "a2")
    module_title = data.get("title", "Unknown Module")
    lessons_data = data.get("lessons", [])

    if not lessons_data:
        raise HTTPException(status_code=400, detail="No lessons found in module data")

    created = 0
    skipped = 0

    for lesson_data in lessons_data:
        title = lesson_data.get("title", "Untitled")
        order = lesson_data.get("order", 0)

        existing = await db.execute(
            select(Lesson).where(
                Lesson.level == level, Lesson.module == module_id, Lesson.title == title
            )
        )
        existing_lesson = existing.scalar_one_or_none()
        if existing_lesson is not None:
            existing_lesson.content_json = lesson_data
            created += 1  # counts as updated
            continue

        lesson = Lesson(
            level=level,
            module=module_id,
            order=order,
            title=title,
            content_json=lesson_data,
        )
        db.add(lesson)
        created += 1

    game_content = data.get("game_content")
    if game_content:
        game_title = f"{module_title} - Games"
        existing_game = await db.execute(
            select(Lesson).where(
                Lesson.level == level,
                Lesson.module == module_id,
                Lesson.title == game_title,
            )
        )
        existing_game_lesson = existing_game.scalar_one_or_none()
        if existing_game_lesson is None:
            game_lesson = Lesson(
                level=level,
                module=module_id,
                order=999,
                title=game_title,
                content_json={"game_content": game_content, "type": "game_content"},
            )
            db.add(game_lesson)
        else:
            existing_game_lesson.content_json = {
                "game_content": game_content,
                "type": "game_content",
            }
        created += 1

    await db.flush()

    return {
        "status": "ok",
        "module_id": module_id,
        "lessons_created": created,
        "lessons_skipped": skipped,
    }


# ---------------------------------------------------------------------------
# CRUD endpoints for the curriculum editor (teacher/admin only)
# ---------------------------------------------------------------------------


@router.get("/modules")
async def list_modules(
    db: AsyncSession = Depends(get_db), current_user=Depends(require_teacher_or_admin)
):
    """List all curriculum modules grouped by level."""
    result = await db.execute(
        select(Lesson.module, Lesson.level, func.count(Lesson.id).label("lesson_count"))
        .where(Lesson.order < 999)
        .group_by(Lesson.module, Lesson.level)
        .order_by(Lesson.level, Lesson.module)
    )
    rows = result.all()

    modules = []
    for module_id, level, lesson_count in rows:
        # Get module title from the game_content lesson (stored as "Title - Games")
        game_lesson = await db.execute(
            select(Lesson.title)
            .where(
                Lesson.module == module_id, Lesson.level == level, Lesson.order == 999
            )
            .limit(1)
        )
        game_title = game_lesson.scalar_one_or_none()
        module_title = module_id
        if game_title and game_title.endswith(" - Games"):
            module_title = game_title.replace(" - Games", "")

        modules.append(
            {
                "module_id": module_id,
                "level": level,
                "title": module_title,
                "lesson_count": lesson_count,
            }
        )

    return {"modules": modules}


@router.get("/modules/{module_id}")
async def get_module(
    module_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_teacher_or_admin),
):
    """Get all lessons and game content for a specific module."""
    result = await db.execute(
        select(Lesson)
        .where(Lesson.module == module_id, Lesson.order < 999)
        .order_by(Lesson.order)
    )
    lessons = list(result.scalars().all())

    if not lessons:
        raise HTTPException(status_code=404, detail="Module not found")

    level = lessons[0].level

    # Get game content
    game_result = await db.execute(
        select(Lesson).where(Lesson.module == module_id, Lesson.order == 999)
    )
    game_lesson = game_result.scalar_one_or_none()
    game_content = None
    game_lesson_id = None
    if game_lesson and game_lesson.content_json:
        game_content = game_lesson.content_json.get("game_content")
        game_lesson_id = str(game_lesson.id)

    return {
        "module_id": module_id,
        "level": level,
        "lessons": [
            {
                "id": str(lesson.id),
                "order": lesson.order,
                "title": lesson.title,
                "content_json": lesson.content_json,
            }
            for lesson in lessons
        ],
        "game_content": game_content,
        "game_lesson_id": game_lesson_id,
    }


@router.put("/lessons/{lesson_id}")
async def update_lesson(
    lesson_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_teacher_or_admin),
):
    """Update a lesson's title and/or content_json."""
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")

    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    if "title" in data:
        lesson.title = data["title"]
    if "content_json" in data:
        lesson.content_json = data["content_json"]

    await db.flush()
    await db.refresh(lesson)

    return {
        "id": str(lesson.id),
        "level": lesson.level,
        "module": lesson.module,
        "order": lesson.order,
        "title": lesson.title,
        "content_json": lesson.content_json,
    }


@router.post("/modules/{module_id}/lessons", status_code=status.HTTP_201_CREATED)
async def create_lesson(
    module_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_teacher_or_admin),
):
    """Create a new lesson in a module."""
    existing = await db.execute(
        select(Lesson).where(Lesson.module == module_id).limit(1)
    )
    existing_lesson = existing.scalar_one_or_none()
    if existing_lesson is None:
        raise HTTPException(status_code=404, detail="Module not found")

    level = existing_lesson.level

    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    title = data.get("title", "New Lesson")
    order = data.get("order", 0)
    content_json = data.get("content_json", {})

    lesson = Lesson(
        level=level,
        module=module_id,
        order=order,
        title=title,
        content_json=content_json,
    )
    db.add(lesson)
    await db.flush()
    await db.refresh(lesson)

    return {
        "id": str(lesson.id),
        "level": lesson.level,
        "module": lesson.module,
        "order": lesson.order,
        "title": lesson.title,
        "content_json": lesson.content_json,
    }


@router.delete("/lessons/{lesson_id}")
async def delete_lesson(
    lesson_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_teacher_or_admin),
):
    """Delete a lesson by ID."""
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")

    await db.delete(lesson)
    await db.flush()

    return {"status": "deleted", "id": str(lesson_id)}
