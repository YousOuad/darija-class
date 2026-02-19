"""Claude Haiku proxy for Darija conversation practice."""

from typing import Any, Dict, List

import httpx

from app.core.config import settings

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
MODEL = "claude-3-haiku-20240307"

SYSTEM_PROMPT = """You are a friendly Darija (Moroccan Arabic) conversation partner for \
language learners. Your role is to:

1. Respond in Darija using both Arabic script and Latin transliteration.
2. Keep your language at the student's level ({level}).
3. Gently correct mistakes the student makes.
4. Provide translations in English in parentheses when using new vocabulary.
5. Use everyday conversational topics: greetings, food, directions, shopping, family.
6. Be encouraging and patient.

Format each response like this:
- Darija (Arabic): <your response in Arabic script>
- Darija (Latin): <your response in transliteration>
- English: <translation>
- Note: <optional grammar/vocabulary tip>

Keep responses concise (2-3 sentences max). Adjust complexity to level {level}:
- a1: Very basic greetings and single words
- a2: Simple sentences and common phrases
- b1: Longer sentences, varied vocabulary
- b2: Complex sentences, idioms, slang
"""


async def generate_conversation_response(
    user_level: str, conversation_history: List[Dict[str, str]], user_message: str
) -> Dict[str, Any]:
    """Send a conversation turn to Claude Haiku and return the response.

    Parameters
    ----------
    user_level : str
        CEFR-style level code (a1, a2, b1, b2).
    conversation_history : list
        Previous turns as ``[{"role": "user"|"assistant", "content": "..."}]``.
    user_message : str
        The latest message from the learner.

    Returns
    -------
    dict
        ``{"response": str, "error": str | None}``
    """
    if not settings.ANTHROPIC_API_KEY:
        return {
            "response": (
                "Salam! (Hello!) -- AI conversation is not configured yet. "
                "Please set ANTHROPIC_API_KEY in your .env file."
            ),
            "error": "ANTHROPIC_API_KEY not set",
        }

    system = SYSTEM_PROMPT.format(level=user_level)

    # Build the messages list
    messages: List[Dict[str, str]] = []
    for turn in conversation_history:
        messages.append({"role": turn["role"], "content": turn["content"]})
    messages.append({"role": "user", "content": user_message})

    headers = {
        "x-api-key": settings.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    payload = {
        "model": MODEL,
        "max_tokens": 512,
        "system": system,
        "messages": messages,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(ANTHROPIC_API_URL, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()

        assistant_text = data["content"][0]["text"]
        return {"response": assistant_text, "error": None}

    except httpx.HTTPStatusError as exc:
        return {
            "response": "Sorry, I could not process your message right now.",
            "error": f"Anthropic API error: {exc.response.status_code}",
        }
    except Exception as exc:
        return {
            "response": "Sorry, something went wrong. Please try again.",
            "error": str(exc),
        }
