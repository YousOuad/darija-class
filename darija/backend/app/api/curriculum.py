"""Curriculum loading endpoint for seeding lesson data."""

import json
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.core.database import get_db
from app.models.lesson import Lesson

router = APIRouter(prefix="/curriculum", tags=["curriculum"])


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
    module_number = data.get("module_number", 0)
    lessons_data = data.get("lessons", [])

    if not lessons_data:
        raise HTTPException(status_code=400, detail="No lessons found in module data")

    created = 0
    skipped = 0

    for lesson_data in lessons_data:
        lesson_id = lesson_data.get("lesson_id", "")
        title = lesson_data.get("title", "Untitled")
        order = lesson_data.get("order", 0)

        # Check if lesson already exists
        existing = await db.execute(
            select(Lesson).where(
                Lesson.level == level, Lesson.module == module_id, Lesson.title == title
            )
        )
        if existing.scalar_one_or_none() is not None:
            skipped += 1
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

    # Also store game_content as a special "games" lesson for the module
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
        if existing_game.scalar_one_or_none() is None:
            game_lesson = Lesson(
                level=level,
                module=module_id,
                order=999,
                title=game_title,
                content_json={"game_content": game_content, "type": "game_content"},
            )
            db.add(game_lesson)
            created += 1
        else:
            skipped += 1

    await db.flush()

    return {
        "status": "ok",
        "module_id": module_id,
        "lessons_created": created,
        "lessons_skipped": skipped,
    }
