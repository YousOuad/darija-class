"""Adaptive learning engine for DarijaLingo.

Tracks user performance and generates personalised game sessions
that prioritise weak skill areas.  Games are scoped to the user's
CEFR level and use vocabulary from **completed lessons** so that
content always reinforces what the learner has already studied.
"""

import random
from datetime import datetime, timezone
from typing import List, Set
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lesson import Lesson
from app.models.progress import UserProgress, UserWeakness


# ---------------------------------------------------------------------------
# Difficulty scaling per CEFR level
# ---------------------------------------------------------------------------

LEVEL_DIFFICULTY = {
    "a1": {"word_match_count": 4, "fill_blank_count": 2, "cultural_quiz_count": 2},
    "a2": {"word_match_count": 5, "fill_blank_count": 3, "cultural_quiz_count": 3},
    "b1": {"word_match_count": 6, "fill_blank_count": 4, "cultural_quiz_count": 4},
    "b2": {"word_match_count": 8, "fill_blank_count": 5, "cultural_quiz_count": 4},
}

DEFAULT_DIFFICULTY = LEVEL_DIFFICULTY["a2"]


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

# All game types available in the platform.
# Sessions pick a random subset from this pool each time.
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
        "title": "Quick Quiz",
        "description": "Choose the correct meaning of a Darija word",
    },
    {
        "game_type": "translation",
        "title": "Translation",
        "description": "Translate words between Darija and English",
    },
    {
        "game_type": "conversation",
        "title": "Conversation Practice",
        "description": "Practice conversation with an AI partner in Darija",
    },
    {
        "game_type": "cultural_quiz",
        "title": "Cultural Quiz",
        "description": "Test your knowledge of Moroccan culture",
    },
    {
        "game_type": "memory_match",
        "title": "Memory Match",
        "description": "Find matching Darija-English word pairs",
    },
    {
        "game_type": "word_scramble",
        "title": "Word Scramble",
        "description": "Unscramble the letters to form Darija words",
    },
    {
        "game_type": "flashcard_sprint",
        "title": "Flashcard Sprint",
        "description": "Quick-fire flashcard review of vocabulary",
    },
    {
        "game_type": "conjugation_quiz",
        "title": "Conjugation Quiz",
        "description": "Pick the correct conjugation of a Darija verb",
    },
    {
        "game_type": "conjugation_fill",
        "title": "Conjugation Challenge",
        "description": "Fill in the correct verb conjugation",
    },
]

# Games that always appear in a session
CORE_GAME_TYPES = {"word_match", "conversation"}

# Maximum number of games per session
SESSION_SIZE = 5


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


async def _get_completed_modules(
    db: AsyncSession, user_id: UUID, level: str
) -> Set[str]:
    """Return the set of module IDs where the user has completed at least one lesson."""
    result = await db.execute(
        select(Lesson.module)
        .join(UserProgress, UserProgress.lesson_id == Lesson.id)
        .where(
            UserProgress.user_id == user_id, Lesson.level == level, Lesson.order < 999
        )
        .distinct()
    )
    return {row[0] for row in result.all()}


async def _load_game_content(
    db: AsyncSession, level: str, completed_modules: Set[str] | None = None
) -> dict:
    """Load game_content entries scoped to the user's completed modules.

    If *completed_modules* is provided, only game_content from those modules
    is returned so that games reinforce vocabulary the user has already learned.
    Falls back to all content for the level when no modules have been completed
    yet (first session).
    """
    stmt = select(Lesson.content_json, Lesson.module).where(
        Lesson.level == level, Lesson.order == 999
    )
    if completed_modules:
        stmt = stmt.where(Lesson.module.in_(completed_modules))

    result = await db.execute(stmt)
    all_content = {"word_match": [], "fill_blanks": [], "cultural_quiz": []}
    for cj, _module in result.all():
        gc = cj.get("game_content", {}) if cj else {}
        for key in all_content:
            all_content[key].extend(gc.get(key, []))

    # If nothing found from completed modules, fall back to all level content
    if not any(all_content.values()) and completed_modules:
        return await _load_game_content(db, level, completed_modules=None)

    return all_content


async def _load_lesson_vocabulary(db: AsyncSession, user_id: UUID, level: str) -> list:
    """Extract vocabulary items from the user's completed lessons.

    Returns a flat list of vocabulary dicts that can be used to generate
    additional word_match pairs and flashcard content directly from words
    the user has studied.
    """
    result = await db.execute(
        select(Lesson.content_json)
        .join(UserProgress, UserProgress.lesson_id == Lesson.id)
        .where(
            UserProgress.user_id == user_id, Lesson.level == level, Lesson.order < 999
        )
    )
    vocab = []
    for (cj,) in result.all():
        if not cj:
            continue
        for item in cj.get("vocabulary", []):
            if item.get("arabic") and item.get("english"):
                vocab.append(
                    {
                        "darija_arabic": item["arabic"],
                        "darija_latin": item.get("romanized", ""),
                        "english": item["english"],
                    }
                )
    return vocab


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
                "english": item.get("english", item.get("hint", "")),
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


def _build_listening_config(vocab: list, count: int = 4) -> dict:
    """Build a Multiple-Choice quiz from vocabulary.

    Shows a Darija word and asks the user to pick the correct English meaning.
    Requires at least 4 vocabulary items to generate meaningful distractors.
    """
    if len(vocab) < 4:
        return {}

    sample = random.sample(vocab, min(count, len(vocab)))
    questions = []

    for item in sample:
        correct_english = item["english"]

        # Build distractors from other vocab English meanings
        distractors = list(
            {v["english"] for v in vocab if v["english"] != correct_english}
        )
        distractor_sample = random.sample(distractors, min(3, len(distractors)))

        options: list[dict] = [
            {"arabic": "", "latin": correct_english, "correct": True}
        ]
        for d in distractor_sample:
            options.append({"arabic": "", "latin": d, "correct": False})
        random.shuffle(options)
        for j, opt in enumerate(options):
            opt["id"] = chr(97 + j)

        questions.append(
            {
                "english": "What does this word mean?",
                "question": {
                    "arabic": item.get("darija_arabic", ""),
                    "latin": item.get("darija_latin", ""),
                },
                "options": options,
            }
        )

    return {"questions": questions}


def _build_translation_config(vocab: list, count: int = 3) -> dict:
    """Build a Fill-In-Blank style translation quiz from vocabulary.

    Shows an English word and asks the user to pick the correct Darija
    translation from multiple choice options.
    """
    if len(vocab) < 4:
        return {}

    sample = random.sample(vocab, min(count, len(vocab)))
    questions = []

    for item in sample:
        correct = {
            "arabic": item.get("darija_arabic", ""),
            "latin": item.get("darija_latin", ""),
        }

        # Build distractors from other vocab Darija words
        distractors = [
            {"arabic": v.get("darija_arabic", ""), "latin": v.get("darija_latin", "")}
            for v in vocab
            if v.get("darija_arabic", "") != correct["arabic"]
        ]
        distractor_sample = random.sample(distractors, min(3, len(distractors)))

        options: list[dict] = [
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
                "sentence_arabic": "___",
                "sentence_latin": "___",
                "english": f"How do you say '{item['english']}' in Darija?",
                "answer": correct,
                "hint": item["english"],
                "options": options,
            }
        )

    return {"questions": questions}


def _build_memory_match_config(vocab: list, count: int = 5) -> dict:
    """Build MemoryMatch game data from vocabulary.

    Creates pairs of Darija/English words for the memory card game.
    """
    if len(vocab) < 3:
        return {}

    sample = random.sample(vocab, min(count, len(vocab)))
    pairs = []
    for i, item in enumerate(sample):
        darija_text = item.get("darija_latin", "") or item.get("darija_arabic", "")
        pairs.append(
            {"id": i, "darija": darija_text, "english": item.get("english", "")}
        )
    return {"pairs": pairs}


def _build_word_scramble_config(vocab: list, count: int = 4) -> dict:
    """Build WordScramble game data from vocabulary.

    Selects words with Latin transliterations for the user to unscramble.
    Only picks words with at least 3 characters.
    """
    eligible = [
        v for v in vocab if v.get("darija_latin", "") and len(v["darija_latin"]) >= 3
    ]
    if len(eligible) < 2:
        return {}

    sample = random.sample(eligible, min(count, len(eligible)))
    words = []
    for item in sample:
        words.append(
            {
                "word": item["darija_latin"],
                "meaning": item.get("english", ""),
                "arabic": item.get("darija_arabic", ""),
            }
        )
    return {"words": words}


def _build_flashcard_sprint_config(vocab: list, count: int = 8) -> dict:
    """Build FlashcardSprint game data from vocabulary.

    Creates flashcards with Darija front and English back for timed review.
    """
    if len(vocab) < 3:
        return {}

    sample = random.sample(vocab, min(count, len(vocab)))
    cards = []
    for item in sample:
        cards.append(
            {
                "front_arabic": item.get("darija_arabic", ""),
                "front_latin": item.get("darija_latin", ""),
                "back": item.get("english", ""),
            }
        )
    return {"cards": cards}


PRONOUN_LABELS = {
    "ana": "I",
    "nta": "you (m)",
    "nti": "you (f)",
    "huwa": "he",
    "hiya": "she",
    "hna": "we",
    "ntuma": "you (pl)",
    "huma": "they",
}
TENSE_LABELS = {
    "present": "present",
    "past": "past",
    "future": "future",
    "negative": "negative",
}


async def _load_lesson_conjugation(db: AsyncSession, user_id: UUID, level: str) -> list:
    """Extract conjugation entries from the user's completed lessons.

    Returns a flat list of conjugation dicts, each with verb, verb_arabic,
    english, and tense dicts (present, past, future, negative) mapping
    pronouns to conjugated forms.
    """
    result = await db.execute(
        select(Lesson.content_json)
        .join(UserProgress, UserProgress.lesson_id == Lesson.id)
        .where(
            UserProgress.user_id == user_id, Lesson.level == level, Lesson.order < 999
        )
    )
    conjugations = []
    for (cj,) in result.all():
        if not cj:
            continue
        for item in cj.get("conjugation", []):
            if item.get("verb") and item.get("present"):
                conjugations.append(item)
    return conjugations


def _build_conjugation_quiz_config(conjugations: list, count: int = 4) -> dict:
    """Build a Multiple-Choice conjugation quiz.

    Shows a verb + pronoun + tense and asks the user to pick the correct
    conjugated form from 4 options.
    """
    if not conjugations:
        return {}

    # Collect all available (verb, tense, pronoun) combinations
    candidates = []
    for conj in conjugations:
        for tense in ["present", "past", "future", "negative"]:
            forms = conj.get(tense)
            if not forms:
                continue
            for pronoun, form in forms.items():
                if form:
                    candidates.append(
                        {
                            "verb": conj["verb"],
                            "verb_arabic": conj.get("verb_arabic", ""),
                            "english": conj.get("english", ""),
                            "tense": tense,
                            "pronoun": pronoun,
                            "correct_form": form,
                        }
                    )

    if len(candidates) < 4:
        return {}

    sample = random.sample(candidates, min(count, len(candidates)))

    # Collect all forms for distractor generation
    all_forms = list({c["correct_form"] for c in candidates})

    questions = []
    for item in sample:
        pronoun_label = PRONOUN_LABELS.get(item["pronoun"], item["pronoun"])
        tense_label = TENSE_LABELS.get(item["tense"], item["tense"])

        # Build distractors from other forms (excluding the correct one)
        distractors = [f for f in all_forms if f != item["correct_form"]]
        distractor_sample = random.sample(distractors, min(3, len(distractors)))

        options = [{"arabic": "", "latin": item["correct_form"], "correct": True}]
        for d in distractor_sample:
            options.append({"arabic": "", "latin": d, "correct": False})
        random.shuffle(options)
        for j, opt in enumerate(options):
            opt["id"] = chr(97 + j)

        questions.append(
            {
                "english": (
                    f"Conjugate '{item['verb']}' ({item['english']}) — "
                    f"{item['pronoun']} ({pronoun_label}), {tense_label} tense"
                ),
                "question": {"arabic": item["verb_arabic"], "latin": item["verb"]},
                "options": options,
            }
        )

    return {"questions": questions}


def _build_conjugation_fill_config(conjugations: list, count: int = 3) -> dict:
    """Build a Fill-In-The-Blank conjugation game.

    Shows a sentence template with a blank for the conjugated form
    and asks the user to pick the correct option.
    """
    if not conjugations:
        return {}

    # Collect all available (verb, tense, pronoun) combinations
    candidates = []
    for conj in conjugations:
        for tense in ["present", "past", "future", "negative"]:
            forms = conj.get(tense)
            if not forms:
                continue
            for pronoun, form in forms.items():
                if form:
                    candidates.append(
                        {
                            "verb": conj["verb"],
                            "verb_arabic": conj.get("verb_arabic", ""),
                            "english": conj.get("english", ""),
                            "tense": tense,
                            "pronoun": pronoun,
                            "correct_form": form,
                            "all_forms": forms,
                        }
                    )

    if len(candidates) < 3:
        return {}

    sample = random.sample(candidates, min(count, len(candidates)))

    questions = []
    for item in sample:
        pronoun_label = PRONOUN_LABELS.get(item["pronoun"], item["pronoun"])
        tense_label = TENSE_LABELS.get(item["tense"], item["tense"])
        correct = {"arabic": "", "latin": item["correct_form"]}

        # Distractors: other pronoun forms of the same verb+tense
        distractors = [
            {"arabic": "", "latin": f}
            for p, f in item["all_forms"].items()
            if p != item["pronoun"] and f != item["correct_form"]
        ]
        # If not enough same-verb distractors, pull from other verbs
        if len(distractors) < 3:
            extra = [
                {"arabic": "", "latin": c["correct_form"]}
                for c in candidates
                if c["correct_form"] != item["correct_form"]
                and c["correct_form"] not in [d["latin"] for d in distractors]
            ]
            distractors.extend(extra)
        distractor_sample = random.sample(distractors, min(3, len(distractors)))

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
                "sentence_arabic": "",
                "sentence_latin": f"{item['pronoun']} ___ ({item['verb']}, {tense_label})",
                "english": (
                    f"{pronoun_label} — {tense_label} tense of "
                    f"'{item['verb']}' ({item['english']})"
                ),
                "answer": correct,
                "hint": f"Think about how '{item['verb']}' changes for {item['pronoun']} in the {tense_label}",
                "options": options,
            }
        )

    return {"questions": questions}


async def generate_session(db: AsyncSession, user_id: UUID, level: str) -> List[dict]:
    """Generate a daily game session prioritising the user's weak areas.

    Games are scoped to the user's CEFR level and draw content only from
    modules/lessons the user has already completed, so vocabulary always
    reinforces prior learning.  Difficulty (number of items per game)
    scales with the CEFR level.

    A session contains SESSION_SIZE games chosen from a larger pool:
    core games (word_match, conversation) always appear, and the
    remaining slots are filled with weakness-targeted or random games.
    """
    weaknesses = await get_weaknesses(db, user_id)

    # Determine which modules the user has completed at this level
    completed_modules = await _get_completed_modules(db, user_id, level)

    # Load game_content scoped to completed modules
    content = await _load_game_content(db, level, completed_modules or None)

    # Also extract vocabulary directly from completed lessons to enrich
    # word_match content with words the user actually studied
    lesson_vocab = await _load_lesson_vocabulary(db, user_id, level)
    if lesson_vocab:
        # Merge lesson vocabulary into word_match pool (deduplicate)
        existing = {
            (w.get("darija_arabic", ""), w.get("english", ""))
            for w in content["word_match"]
        }
        for v in lesson_vocab:
            key = (v["darija_arabic"], v["english"])
            if key not in existing:
                content["word_match"].append(v)
                existing.add(key)

    # Combine all vocabulary sources for vocab-based games
    all_vocab = list(content["word_match"])  # already merged with lesson_vocab

    # Load conjugation data from completed lessons for conjugation games
    lesson_conjugation = await _load_lesson_conjugation(db, user_id, level)

    difficulty = LEVEL_DIFFICULTY.get(level, DEFAULT_DIFFICULTY)

    # Build a list of games; put weakness-related ones first
    session_games: List[dict] = []
    used_types: set = set()

    skill_to_game = {
        "vocabulary": "word_match",
        "grammar": "fill_blank",
        "listening": "listening",
        "translation": "translation",
        "conversation": "conversation",
        "conjugation": "conjugation_quiz",
    }

    # 1. Add core games that always appear
    for g in GAME_TYPES:
        if g["game_type"] in CORE_GAME_TYPES:
            config = _build_game_config(
                g["game_type"],
                content,
                level,
                difficulty,
                all_vocab,
                lesson_conjugation,
            )
            session_games.append({**g, "config": config})
            used_types.add(g["game_type"])

    # 2. Add weakness-targeted games
    for w in weaknesses[:2]:
        if len(session_games) >= SESSION_SIZE:
            break
        game_type = skill_to_game.get(w.skill_area)
        if game_type and game_type not in used_types:
            game_def = next(
                (g for g in GAME_TYPES if g["game_type"] == game_type), None
            )
            if game_def:
                config = _build_game_config(
                    game_type, content, level, difficulty, all_vocab, lesson_conjugation
                )
                session_games.append({**game_def, "config": config})
                used_types.add(game_type)

    # 3. Fill remaining slots randomly from unused game types
    remaining = [g for g in GAME_TYPES if g["game_type"] not in used_types]
    random.shuffle(remaining)
    for g in remaining:
        if len(session_games) >= SESSION_SIZE:
            break
        config = _build_game_config(
            g["game_type"], content, level, difficulty, all_vocab, lesson_conjugation
        )
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


def _build_game_config(
    game_type: str,
    content: dict,
    level: str,
    difficulty: dict | None = None,
    vocab: list | None = None,
    conjugations: list | None = None,
) -> dict:
    """Build the config dict for a specific game type with real content.

    The *difficulty* dict controls how many items each game contains,
    scaling with the user's CEFR level.  *vocab* is a flat list of
    vocabulary dicts used by vocab-based game types (listening,
    translation, memory_match, word_scramble, flashcard_sprint).
    *conjugations* is a flat list of conjugation dicts from completed
    lessons, used by conjugation_quiz and conjugation_fill games.
    """
    if difficulty is None:
        difficulty = LEVEL_DIFFICULTY.get(level, DEFAULT_DIFFICULTY)
    if vocab is None:
        vocab = []
    if conjugations is None:
        conjugations = []

    base = {"level": level}

    if game_type == "word_match" and content["word_match"]:
        base.update(
            _build_word_match_config(
                content["word_match"], count=difficulty["word_match_count"]
            )
        )
    elif game_type == "fill_blank" and content["fill_blanks"]:
        base.update(
            _build_fill_blank_config(
                content["fill_blanks"], count=difficulty["fill_blank_count"]
            )
        )
    elif game_type == "cultural_quiz" and content["cultural_quiz"]:
        base.update(
            _build_cultural_quiz_config(
                content["cultural_quiz"], count=difficulty["cultural_quiz_count"]
            )
        )
    elif game_type == "listening" and vocab:
        base.update(
            _build_listening_config(vocab, count=difficulty["word_match_count"])
        )
    elif game_type == "translation" and vocab:
        base.update(
            _build_translation_config(vocab, count=difficulty["fill_blank_count"])
        )
    elif game_type == "memory_match" and vocab:
        base.update(_build_memory_match_config(vocab, count=5))
    elif game_type == "word_scramble" and vocab:
        base.update(_build_word_scramble_config(vocab, count=4))
    elif game_type == "flashcard_sprint" and vocab:
        base.update(_build_flashcard_sprint_config(vocab, count=8))
    elif game_type == "conversation":
        base.update(_build_conversation_config(level))
    elif game_type == "conjugation_quiz" and conjugations:
        base.update(_build_conjugation_quiz_config(conjugations, count=4))
    elif game_type == "conjugation_fill" and conjugations:
        base.update(_build_conjugation_fill_config(conjugations, count=3))

    return base
