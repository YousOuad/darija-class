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


# ---------------------------------------------------------------------------
# Conversation scenarios by CEFR level
# ---------------------------------------------------------------------------

CONVERSATION_SCENARIOS = {
    "a1": [
        {
            "context": "You meet someone new and want to introduce yourself.",
            "scenario_prompt": (
                "The student is at a social gathering and meets a Moroccan person for the "
                "first time. They need to greet them, introduce themselves (name, where "
                "they're from), and ask the other person's name. Keep it very simple."
            ),
            "target_vocabulary": [
                "salam (hello)",
                "labas (how are you)",
                "smiyti (my name is)",
                "ana mn (I am from)",
                "mtsharfin (nice to meet you)",
            ],
            "initial_message": {
                "arabic": "سلام! لاباس عليك؟ أنا كريم.",
                "latin": "Salam! Labas 3lik? Ana Karim.",
                "english": "Hello! How are you? I'm Karim.",
            },
            "initial_suggestions": [
                {
                    "arabic": "سلام! لاباس الحمد لله",
                    "latin": "Salam! Labas lhamdulah",
                    "english": "Hello! I'm fine, thank God",
                },
                {
                    "arabic": "أهلا! سميتي...",
                    "latin": "Ahla! Smiyti...",
                    "english": "Hi! My name is...",
                },
            ],
        },
        {
            "context": "You're ordering tea at a traditional Moroccan café.",
            "scenario_prompt": (
                "The student walks into a Moroccan café (qahwa) and needs to order a "
                "drink. The waiter greets them. Practice ordering atay (tea), qahwa "
                "(coffee), and using 3afak (please) and choukran (thank you)."
            ),
            "target_vocabulary": [
                "atay (tea)",
                "qahwa (coffee)",
                "3afak (please)",
                "choukran (thank you)",
                "b na3na3 (with mint)",
                "bla sokkar (without sugar)",
            ],
            "initial_message": {
                "arabic": "مرحبا! أهلا بيك فالقهوة ديالنا. شنو بغيتي؟",
                "latin": "Merhba! Ahla bik f l'qahwa dyalna. Chnou bghiti?",
                "english": "Welcome! Welcome to our café. What would you like?",
            },
            "initial_suggestions": [
                {
                    "arabic": "أتاي بالنعناع عافاك",
                    "latin": "Atay b na3na3 3afak",
                    "english": "Mint tea please",
                },
                {
                    "arabic": "قهوة عافاك",
                    "latin": "Qahwa 3afak",
                    "english": "Coffee please",
                },
            ],
        },
        {
            "context": "You're asking for directions to the medina.",
            "scenario_prompt": (
                "The student is lost and needs to ask a passerby for directions to the "
                "medina (old town). Practice fin (where), limen (left), limin (right), "
                "nishan (straight), and choukran."
            ),
            "target_vocabulary": [
                "fin (where)",
                "l'mdina (the medina)",
                "sir nishan (go straight)",
                "dour l limen (turn left)",
                "dour l limin (turn right)",
                "b3id (far)",
                "qrib (close)",
            ],
            "initial_message": {
                "arabic": "أيه أ خويا، شنو كتقلب عليه؟",
                "latin": "Ayeh a khouya, chnou katqelleb 3lih?",
                "english": "Yes brother, what are you looking for?",
            },
            "initial_suggestions": [
                {
                    "arabic": "فين المدينة عافاك؟",
                    "latin": "Fin l'mdina 3afak?",
                    "english": "Where is the medina please?",
                },
                {
                    "arabic": "واش المدينة بعيدة؟",
                    "latin": "Wach l'mdina b3ida?",
                    "english": "Is the medina far?",
                },
            ],
        },
    ],
    "a2": [
        {
            "context": "You're shopping at a Moroccan souk and want to buy souvenirs.",
            "scenario_prompt": (
                "The student is browsing a stall at the souk and wants to buy a tajine "
                "pot or a rug. They need to ask the price, negotiate politely, and "
                "complete the purchase. Practice numbers, bchhal (how much), and ghali (expensive)."
            ),
            "target_vocabulary": [
                "bchhal (how much)",
                "ghali (expensive)",
                "rkhis (cheap)",
                "nqess chwiya (reduce a little)",
                "3jebni (I like it)",
                "khod (take)",
                "flous (money)",
            ],
            "initial_message": {
                "arabic": "مرحبا أ صاحبي! شوف هاد الطاجين، خدمة يدوية مزيانة بزاف!",
                "latin": "Merhba a sahbi! Chouf had ttajin, khedma ydawiya mezyana bzzaf!",
                "english": "Welcome my friend! Look at this tajine, very nice handmade work!",
            },
            "initial_suggestions": [
                {
                    "arabic": "بشحال هاد الطاجين؟",
                    "latin": "Bchhal had ttajin?",
                    "english": "How much is this tajine?",
                },
                {
                    "arabic": "عجبني! واش عندك حوايج خرين؟",
                    "latin": "3jebni! Wach 3ndek hwayej khrin?",
                    "english": "I like it! Do you have other things?",
                },
            ],
        },
        {
            "context": "You're ordering food at a Moroccan restaurant.",
            "scenario_prompt": (
                "The student is at a restaurant and needs to order a full meal. "
                "They should order a starter, main course, and drink. Practice food "
                "vocabulary, expressing preferences, and being polite."
            ),
            "target_vocabulary": [
                "l'carta (the menu)",
                "tabsil raissi (main dish)",
                "harira (soup)",
                "tajin (stew)",
                "koskso (couscous)",
                "bghit (I want)",
                "ma bghitch (I don't want)",
                "zidni (give me more)",
            ],
            "initial_message": {
                "arabic": "مرحبا! تفضلو! ها هي الكارطة. عندنا اليوم طاجين و كسكسو.",
                "latin": "Merhba! Tfaddlou! Ha hiya l'carta. 3ndna lyoum tajin w koskso.",
                "english": "Welcome! Here's the menu. Today we have tajine and couscous.",
            },
            "initial_suggestions": [
                {
                    "arabic": "بغيت الطاجين عافاك",
                    "latin": "Bghit ttajin 3afak",
                    "english": "I'd like the tajine please",
                },
                {
                    "arabic": "شنو عندكم فالحريرة؟",
                    "latin": "Chnou 3ndkom f l'harira?",
                    "english": "What do you have in the harira?",
                },
            ],
        },
        {
            "context": "You're taking a taxi in Casablanca.",
            "scenario_prompt": (
                "The student needs to take a petit taxi in Casablanca. They need to "
                "tell the driver where to go, ask about the price, and have a short "
                "conversation during the ride."
            ),
            "target_vocabulary": [
                "taxi (taxi)",
                "dini l (take me to)",
                "bchhal (how much)",
                "hna (here)",
                "temma (there)",
                "wqef hna (stop here)",
                "sir nishan (go straight)",
                "dour (turn)",
            ],
            "initial_message": {
                "arabic": "سلام خويا، فين غادي؟",
                "latin": "Salam khouya, fin ghadi?",
                "english": "Hello brother, where are you going?",
            },
            "initial_suggestions": [
                {
                    "arabic": "ديني لمحطة كازا ڤوياجور عافاك",
                    "latin": "Dini l mahatta Casa Voyageurs 3afak",
                    "english": "Take me to Casa Voyageurs station please",
                },
                {
                    "arabic": "بشحال للمدينة القديمة؟",
                    "latin": "Bchhal l l'mdina l'qdima?",
                    "english": "How much to the old town?",
                },
            ],
        },
    ],
    "b1": [
        {
            "context": "You're discussing your weekend plans with a Moroccan friend.",
            "scenario_prompt": (
                "The student is chatting with a Moroccan friend about plans for the "
                "weekend. They should discuss activities, suggest places to go, and "
                "agree on a plan. Practice future tense (ghadi), expressing preferences, "
                "and making suggestions."
            ),
            "target_vocabulary": [
                "ghadi (going to)",
                "weekend (weekend)",
                "nmchiw l (let's go to)",
                "wach bghiti (do you want)",
                "fikra mezyana (good idea)",
                "ma3endich wqt (I don't have time)",
                "nta3mlou (let's do)",
            ],
            "initial_message": {
                "arabic": "سلام صاحبي! شنو غادي دير هاد الويكاند؟ بغيتي نديرو شي حاجة مع بعضياتنا؟",
                "latin": "Salam sahbi! Chnou ghadi dir had l'weekend? Bghiti ndirou chi haja m3a b3diyatna?",
                "english": "Hi friend! What are you going to do this weekend? Want to do something together?",
            },
            "initial_suggestions": [
                {
                    "arabic": "فكرة مزيانة! نمشيو للبحر؟",
                    "latin": "Fikra mezyana! Nmchiw l l'bher?",
                    "english": "Good idea! Shall we go to the beach?",
                },
                {
                    "arabic": "مازال ماعرفتش. شنو كتقترح؟",
                    "latin": "Mazal ma3reftch. Chnou katqtereh?",
                    "english": "I don't know yet. What do you suggest?",
                },
            ],
        },
        {
            "context": "You're describing your family to a Moroccan colleague.",
            "scenario_prompt": (
                "The student is having a conversation with a Moroccan colleague at work "
                "about their families. They should describe family members, talk about "
                "what they do, and ask about the colleague's family."
            ),
            "target_vocabulary": [
                "l'3a2ila (family)",
                "bba (father)",
                "mmi (mother)",
                "khouya (brother)",
                "khti (sister)",
                "wlad (children)",
                "khddam (works)",
                "kbir (big/old)",
                "sghir (small/young)",
            ],
            "initial_message": {
                "arabic": "سمعت بلي عندك عائلة كبيرة! بشحال خوتك؟",
                "latin": "Sme3t blli 3ndek 3a2ila kbira! Bchhal khoutek?",
                "english": "I heard you have a big family! How many siblings do you have?",
            },
            "initial_suggestions": [
                {
                    "arabic": "عندي جوج خوت و وحدة الأخت",
                    "latin": "3ndi jouj khout w wehda l'okht",
                    "english": "I have two brothers and one sister",
                },
                {
                    "arabic": "إيه عائلتي كبيرة بزاف! و نتا؟",
                    "latin": "Iyeh 3a2ilti kbira bzzaf! W nta?",
                    "english": "Yes my family is very big! And you?",
                },
            ],
        },
    ],
    "b2": [
        {
            "context": "You're negotiating the price of a handmade rug at a Marrakech souk.",
            "scenario_prompt": (
                "The student is in an advanced negotiation at a rug shop in Marrakech. "
                "The merchant is skilled and persuasive. The student must negotiate "
                "firmly but politely, use idioms, and reach a fair price. This is a "
                "realistic souk bargaining scenario."
            ),
            "target_vocabulary": [
                "zerbia (rug)",
                "taman (price)",
                "akhir taman (final price)",
                "ma ymkenlich (I can't)",
                "hak l'flous (here's the money)",
                "radi n3tik (I'll give you)",
                "baraka men (enough of)",
                "3la slama (goodbye/deal done)",
            ],
            "initial_message": {
                "arabic": "هاد الزربية صوف خالص، خدمة فاسية أصيلة. تامنها أربعة ديال المليون.",
                "latin": "Had zzerbia souf khales, khedma fasiya asila. Tamanha reb3a dyal l'melyoun.",
                "english": "This rug is pure wool, authentic Fez craftsmanship. Its price is 4000 dirhams.",
            },
            "initial_suggestions": [
                {
                    "arabic": "أربعة ديال المليون؟ غالية بزاف أ الحاج!",
                    "latin": "Reb3a dyal l'melyoun? Ghalya bzzaf a l'haj!",
                    "english": "4000 dirhams? That's way too expensive!",
                },
                {
                    "arabic": "مزيانة ولكن بغيت نشوف حوايج خرين قبل",
                    "latin": "Mezyana walakin bghit nchouf hwayej khrin qbel",
                    "english": "It's nice but I want to see other things first",
                },
            ],
        },
        {
            "context": "You're discussing Moroccan culture and traditions with a local.",
            "scenario_prompt": (
                "The student is having a deep conversation about Moroccan traditions "
                "with a local friend — Ramadan, weddings, music (Gnawa, Chaabi), food "
                "culture. The conversation should be natural and use idioms, slang, "
                "and complex sentence structures."
            ),
            "target_vocabulary": [
                "taqalid (traditions)",
                "3adat (customs)",
                "l'3rss (wedding)",
                "ramdan (Ramadan)",
                "ftor (iftar/breaking fast)",
                "Gnawa (Gnawa music)",
                "sha3bi (popular/folk)",
                "l'ma3qoul (reasonable/proper)",
            ],
            "initial_message": {
                "arabic": "واش عمرك مشيتي لشي عرس مغربي؟ ما كاين والو بحالو فالدنيا!",
                "latin": "Wach 3emrek mchiti l chi 3rss meghribi? Ma kayn walo bhalo f ddnya!",
                "english": "Have you ever been to a Moroccan wedding? There's nothing like it in the world!",
            },
            "initial_suggestions": [
                {
                    "arabic": "إيه مشيت مرة وحدة وعجبني بزاف! الموسيقى كانت خطيرة",
                    "latin": "Iyeh mchit merra wehda w 3jebni bzzaf! L'mousiqa kanet khtira",
                    "english": "Yes I went once and loved it! The music was amazing",
                },
                {
                    "arabic": "لا عمرني. شنو كيوقع فالعرس المغربي؟",
                    "latin": "La 3emrni. Chnou kayw9e3 f l'3rss l'meghribi?",
                    "english": "Never. What happens at a Moroccan wedding?",
                },
            ],
        },
    ],
}


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


def _build_conversation_config(level: str) -> dict:
    """Build Conversation Practice config by selecting a random scenario for the level."""
    scenarios = CONVERSATION_SCENARIOS.get(level, CONVERSATION_SCENARIOS.get("a1", []))
    if not scenarios:
        return {}
    scenario = random.choice(scenarios)
    return {
        "context": scenario["context"],
        "scenario_prompt": scenario["scenario_prompt"],
        "target_vocabulary": scenario["target_vocabulary"],
        "messages": [
            {
                "role": "ai",
                "arabic": scenario["initial_message"]["arabic"],
                "latin": scenario["initial_message"]["latin"],
                "english": scenario["initial_message"]["english"],
            }
        ],
        "suggestions": scenario["initial_suggestions"],
        "scenario": {
            "context": scenario["context"],
            "scenario_prompt": scenario["scenario_prompt"],
            "target_vocabulary": scenario["target_vocabulary"],
        },
    }


def _build_game_config(game_type: str, content: dict, level: str) -> dict:
    """Build the config dict for a specific game type with real content."""
    base = {"level": level}

    if game_type == "word_match" and content["word_match"]:
        base.update(_build_word_match_config(content["word_match"]))
    elif game_type == "fill_blank" and content["fill_blanks"]:
        base.update(_build_fill_blank_config(content["fill_blanks"]))
    elif game_type == "cultural_quiz" and content["cultural_quiz"]:
        base.update(_build_cultural_quiz_config(content["cultural_quiz"]))
    elif game_type == "conversation":
        base.update(_build_conversation_config(level))

    return base
