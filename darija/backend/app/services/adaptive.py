"""Adaptive learning engine for DarijaLingo.

Tracks user performance and generates personalised game sessions
that prioritise weak skill areas.
"""

import random
from datetime import datetime, timezone
from typing import List
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lesson import Lesson
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


async def _load_game_content(db: AsyncSession, level: str) -> dict:
    """Load all game_content entries from curriculum for the given level."""
    result = await db.execute(
        select(Lesson.content_json).where(Lesson.level == level, Lesson.order == 999)
    )
    all_content = {"word_match": [], "fill_blanks": [], "cultural_quiz": []}
    for (cj,) in result.all():
        gc = cj.get("game_content", {}) if cj else {}
        for key in all_content:
            all_content[key].extend(gc.get(key, []))
    return all_content


def _build_word_match_config(items: list, count: int = 5) -> dict:
    """Build WordMatch game data from curriculum word_match items."""
    sample = random.sample(items, min(count, len(items)))
    pairs = []
    for i, item in enumerate(sample, 1):
        pairs.append(
            {
                "id": i,
                "darija_arabic": item.get("darija_arabic", ""),
                "darija_latin": item.get("darija_latin", ""),
                "english": item.get("english", ""),
            }
        )
    return {"pairs": pairs}


def _build_fill_blank_config(items: list, count: int = 3) -> dict:
    """Build FillInBlank game data from curriculum fill_blanks items."""
    sample = random.sample(items, min(count, len(items)))

    # Collect all unique answers for generating distractors
    all_answers = []
    seen: set = set()
    for it in items:
        key = (it.get("answer_arabic", ""), it.get("answer_latin", ""))
        if key not in seen:
            seen.add(key)
            all_answers.append({"arabic": key[0], "latin": key[1]})

    questions = []
    for item in sample:
        correct = {
            "arabic": item.get("answer_arabic", ""),
            "latin": item.get("answer_latin", ""),
        }

        # Pick distractors from other items' answers
        distractors = [
            a
            for a in all_answers
            if a["latin"] != correct["latin"] or a["arabic"] != correct["arabic"]
        ]
        distractor_sample = random.sample(distractors, min(3, len(distractors)))

        # Build options list: 1 correct + 3 distractors (4 total)
        options = [
            {"arabic": correct["arabic"], "latin": correct["latin"], "correct": True}
        ]
        for d in distractor_sample:
            options.append(
                {"arabic": d["arabic"], "latin": d["latin"], "correct": False}
            )
        random.shuffle(options)
        for j, opt in enumerate(options):
            opt["id"] = chr(97 + j)

        questions.append(
            {
                "sentence_arabic": item.get("sentence_arabic", ""),
                "sentence_latin": item.get("sentence_latin", ""),
                "english": item.get("hint", ""),
                "answer": {
                    "arabic": item.get("answer_arabic", ""),
                    "latin": item.get("answer_latin", ""),
                },
                "hint": item.get("hint", ""),
                "options": options,
            }
        )
    return {"questions": questions}


def _build_cultural_quiz_config(items: list, count: int = 3) -> dict:
    """Build CulturalQuiz / MultipleChoice data from curriculum cultural_quiz."""
    sample = random.sample(items, min(count, len(items)))

    # Collect all correct answers for padding distractors when needed
    all_correct = [it["correct_answer"] for it in items if "correct_answer" in it]

    questions = []
    for item in sample:
        distractors = list(item.get("distractors", []))

        # Pad with other items' correct answers if fewer than 3 distractors
        if len(distractors) < 3:
            extra = [
                a
                for a in all_correct
                if a != item["correct_answer"] and a not in distractors
            ]
            distractors.extend(
                random.sample(extra, min(3 - len(distractors), len(extra)))
            )

        options = [{"text": item["correct_answer"], "correct": True}]
        for d in distractors[:3]:
            options.append({"text": d, "correct": False})
        random.shuffle(options)
        for j, opt in enumerate(options):
            opt["id"] = chr(97 + j)

        questions.append(
            {
                "question": item.get("question", ""),
                "explanation": item.get("explanation", ""),
                "options": options,
            }
        )
    return {"questions": questions}


async def generate_session(db: AsyncSession, user_id: UUID, level: str) -> List[dict]:
    """Generate a daily game session prioritising the user's weak areas.

    The returned list contains game config dicts ready to be serialised
    as ``GameConfig`` schemas, with actual game content from curriculum.
    """
    weaknesses = await get_weaknesses(db, user_id)
    content = await _load_game_content(db, level)

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
                config = _build_game_config(game_type, content, level)
                session_games.append({**game_def, "config": config})
                used_types.add(game_type)

    # Fill remaining slots with games not yet included
    for g in GAME_TYPES:
        if g["game_type"] not in used_types:
            config = _build_game_config(g["game_type"], content, level)
            session_games.append({**g, "config": config})
            used_types.add(g["game_type"])

    return session_games


def _build_game_config(game_type: str, content: dict, level: str) -> dict:
    """Build the config dict for a specific game type with real content."""
    base = {"level": level}

    if game_type == "word_match" and content["word_match"]:
        base.update(_build_word_match_config(content["word_match"]))
    elif game_type == "fill_blank" and content["fill_blanks"]:
        base.update(_build_fill_blank_config(content["fill_blanks"]))
    elif game_type == "cultural_quiz" and content["cultural_quiz"]:
        base.update(_build_cultural_quiz_config(content["cultural_quiz"]))
    # listening and conversation don't have curriculum content yet

    return base
