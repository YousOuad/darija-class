"""Claude Haiku proxy for Darija conversation practice via AWS Bedrock."""

import json
from typing import Any, Dict, List, Optional

import boto3
from botocore.exceptions import ClientError

from app.core.config import settings

MODEL_ID = "arn:aws:bedrock:eu-west-3:557720455286:inference-profile/eu.anthropic.claude-haiku-4-5-20251001-v1:0"

BASE_SYSTEM_PROMPT = """\
You are a friendly Moroccan conversation partner helping a language learner practice real everyday Darija.

## Scenario
{scenario_context}

## Target Vocabulary
The student should practice these words/phrases: {target_vocabulary}

## CRITICAL LANGUAGE RULES
- You MUST write EXCLUSIVELY in Moroccan Darija (the actual spoken dialect of Morocco).
- Do NOT use Modern Standard Arabic (Fusha) or formal Arabic. Only use words and expressions \
that real Moroccans use in daily life on the street, at home, in cafes, etc.
- Use ROMANIZED Darija with Moroccan number-letter conventions:
  - 3 = ع (e.g., 3lach, 3afak, 3endi)
  - 7 = ح (e.g., 7lib, 7anut, la7besla)
  - 9 = ق (e.g., 9ra, 9hwa, 9alb)
  - 5 = خ (e.g., 5obz, 5dem)
  - 2 = ء/أ (e.g., 2ana, so2al)
  - 8 = ه (e.g., 8ad, 8adi)
- Keep the language natural, casual, and exactly how Moroccans speak in daily life.

## Conversation Rules
1. Stay in character for the scenario. Keep the conversation natural and on-topic.
2. Adapt to the student's CEFR level {level}:
   - a1: Very basic greetings, single words, short phrases
   - a2: Simple sentences, common everyday phrases
   - b1: Longer sentences, varied vocabulary, light idioms
   - b2: Complex sentences, idioms, slang, nuanced expressions
3. If the student makes a Darija mistake, gently correct it in the "correction" field. \
Explain what was wrong and show the correct form. If their Darija is correct, set "correction" to null.
4. If the student goes off-topic or writes in pure English, redirect them kindly back to the \
scenario and encourage them to try in Darija.
5. Provide 2 suggested responses the student could say next. Suggestions MUST also be in \
romanized Darija with number-letter conventions. When the conversation has reached \
a natural conclusion (e.g. goodbye), return an empty suggestions array.
6. Keep responses concise (1-3 sentences).

## Response Format
You MUST respond with valid JSON only, no other text:
{{
  "arabic": "your response in Arabic script",
  "latin": "your response in romanized Darija using 3,7,9,5,2,8 conventions",
  "english": "English translation of your response",
  "correction": "correction of the student's mistake with explanation, or null if correct",
  "suggestions": [
    {{"arabic": "suggested reply in Arabic", "latin": "in romanized Darija with 3,7,9 conventions", "english": "English meaning"}},
    {{"arabic": "another suggestion in Arabic", "latin": "in romanized Darija with 3,7,9 conventions", "english": "English meaning"}}
  ]
}}
"""


def _get_bedrock_client():
    """Create a Bedrock Runtime client for the configured AWS region."""
    return boto3.client("bedrock-runtime", region_name=settings.AWS_REGION)


def _build_system_prompt(level: str, scenario: Optional[Dict[str, Any]] = None) -> str:
    """Build a dynamic system prompt from scenario data."""
    context = "General Darija conversation practice."
    vocabulary = "common greetings, polite expressions"

    if scenario:
        context = scenario.get("scenario_prompt", scenario.get("context", context))
        vocab_list = scenario.get("target_vocabulary", [])
        if vocab_list:
            vocabulary = ", ".join(vocab_list)

    return BASE_SYSTEM_PROMPT.format(
        scenario_context=context, target_vocabulary=vocabulary, level=level
    )


async def generate_conversation_response(
    user_level: str,
    conversation_history: List[Dict[str, str]],
    user_message: str,
    scenario: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Send a conversation turn to Claude Haiku via AWS Bedrock.

    Parameters
    ----------
    user_level : str
        CEFR-style level code (a1, a2, b1, b2).
    conversation_history : list
        Previous turns as ``[{"role": "user"|"assistant", "content": "..."}]``.
    user_message : str
        The latest message from the learner.
    scenario : dict, optional
        Scenario data with context, target_vocabulary, scenario_prompt.

    Returns
    -------
    dict
        Structured response with arabic, latin, english, correction, suggestions.
    """
    system_prompt = _build_system_prompt(user_level, scenario)

    # Build the messages list
    messages: List[Dict[str, str]] = []
    for turn in conversation_history:
        messages.append({"role": turn["role"], "content": turn["content"]})
    messages.append({"role": "user", "content": user_message})

    body = json.dumps(
        {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 512,
            "system": system_prompt,
            "messages": messages,
        }
    )

    assistant_text = ""
    try:
        client = _get_bedrock_client()
        response = client.invoke_model(
            modelId=MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=body,
        )

        response_body = json.loads(response["body"].read())
        assistant_text = response_body["content"][0]["text"]

        # Strip markdown code fences if present (e.g. ```json ... ```)
        cleaned = assistant_text.strip()
        if cleaned.startswith("```"):
            # Remove opening fence (```json or ```)
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            # Remove closing fence
            if cleaned.rstrip().endswith("```"):
                cleaned = cleaned.rstrip()[:-3].rstrip()

        # Parse the structured JSON response from Claude
        parsed = json.loads(cleaned)

        return {
            "arabic": parsed.get("arabic", ""),
            "latin": parsed.get("latin", ""),
            "english": parsed.get("english", ""),
            "correction": parsed.get("correction"),
            "suggestions": parsed.get("suggestions", []),
            "error": None,
        }

    except json.JSONDecodeError:
        # Claude returned non-JSON — wrap it as a plain response
        return {
            "arabic": "",
            "latin": assistant_text,
            "english": "",
            "correction": None,
            "suggestions": [],
            "error": "Failed to parse AI response as JSON",
        }
    except ClientError as exc:
        error_code = exc.response["Error"]["Code"]
        error_msg = exc.response["Error"]["Message"]
        return {
            "arabic": "",
            "latin": "Smeh liya, kayn mouchkil tekni.",
            "english": "Sorry, there is a technical problem.",
            "correction": None,
            "suggestions": [],
            "error": f"Bedrock error ({error_code}): {error_msg}",
        }
    except Exception as exc:
        return {
            "arabic": "",
            "latin": "Smeh liya, kayn mouchkil.",
            "english": "Sorry, something went wrong.",
            "correction": None,
            "suggestions": [],
            "error": str(exc),
        }


# ---------------------------------------------------------------------------
# Open conversation (standalone page, not a game)
# ---------------------------------------------------------------------------

OPEN_CONVO_SYSTEM_PROMPT = """\
You are a friendly Moroccan person having a casual everyday conversation with someone \
who is learning Darija. You are role-playing an imagined real-life situation.

## Situation
{topic}

## CRITICAL LANGUAGE RULES
- You MUST reply EXCLUSIVELY in Moroccan Darija (the actual spoken dialect of Morocco).
- Do NOT use Modern Standard Arabic (Fusha) or formal Arabic.
- Use ROMANIZED Darija with Moroccan number-letter conventions:
  - 3 = ع (e.g., 3lach, 3afak, 3endi)
  - 7 = ح (e.g., 7lib, 7anut, la7besla)
  - 9 = ق (e.g., 9ra, 9hwa, 9alb)
  - 5 = خ (e.g., 5obz, 5dem)
  - 2 = ء/أ (e.g., 2ana, so2al)
  - 8 = ه (e.g., 8ad, 8adi)

## Conversation Style
1. Keep your replies VERY SHORT — 1 to 2 sentences max, like real everyday texting/talking.
2. Be natural, warm, and casual — like chatting with a friend or neighbor.
3. Stay in character for the situation. Carry the conversation forward naturally.
4. Adapt to the student's CEFR level {level}.
5. If the student makes a mistake, gently correct it in the "correction" field.
6. Provide 2 short suggested replies the student could say next.
7. NEVER discuss sensitive, political, religious, or inappropriate topics. \
If the student brings up such topics, kindly redirect to the scenario.

## Response Format
You MUST respond with valid JSON only, no other text:
{{
  "arabic": "your response in Arabic script",
  "latin": "your response in romanized Darija",
  "english": "English translation",
  "correction": "correction if student made a mistake, or null",
  "suggestions": [
    {{"arabic": "suggestion in Arabic", "latin": "in romanized Darija", "english": "English"}},
    {{"arabic": "another suggestion", "latin": "in romanized Darija", "english": "English"}}
  ]
}}
"""


async def generate_open_conversation(
    user_level: str,
    conversation_history: List[Dict[str, str]],
    user_message: str,
    topic: str,
) -> Dict[str, Any]:
    """Send an open conversation turn to Claude via AWS Bedrock.

    Similar to generate_conversation_response but uses a simpler prompt
    focused on casual everyday chat with no game mechanics.
    """
    system_prompt = OPEN_CONVO_SYSTEM_PROMPT.format(topic=topic, level=user_level)

    messages: List[Dict[str, str]] = []
    for turn in conversation_history:
        messages.append({"role": turn["role"], "content": turn["content"]})
    messages.append({"role": "user", "content": user_message})

    body = json.dumps(
        {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 300,
            "system": system_prompt,
            "messages": messages,
        }
    )

    assistant_text = ""
    try:
        client = _get_bedrock_client()
        response = client.invoke_model(
            modelId=MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=body,
        )

        response_body = json.loads(response["body"].read())
        assistant_text = response_body["content"][0]["text"]

        cleaned = assistant_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.rstrip().endswith("```"):
                cleaned = cleaned.rstrip()[:-3].rstrip()

        parsed = json.loads(cleaned)

        return {
            "arabic": parsed.get("arabic", ""),
            "latin": parsed.get("latin", ""),
            "english": parsed.get("english", ""),
            "correction": parsed.get("correction"),
            "suggestions": parsed.get("suggestions", []),
            "error": None,
        }

    except json.JSONDecodeError:
        return {
            "arabic": "",
            "latin": assistant_text,
            "english": "",
            "correction": None,
            "suggestions": [],
            "error": "Failed to parse AI response as JSON",
        }
    except ClientError as exc:
        error_code = exc.response["Error"]["Code"]
        error_msg = exc.response["Error"]["Message"]
        return {
            "arabic": "",
            "latin": "Smeh liya, kayn mouchkil tekni.",
            "english": "Sorry, there is a technical problem.",
            "correction": None,
            "suggestions": [],
            "error": f"Bedrock error ({error_code}): {error_msg}",
        }
    except Exception as exc:
        return {
            "arabic": "",
            "latin": "Smeh liya, kayn mouchkil.",
            "english": "Sorry, something went wrong.",
            "correction": None,
            "suggestions": [],
            "error": str(exc),
        }
