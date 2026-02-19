"""Claude Haiku proxy for Darija conversation practice via AWS Bedrock."""

import json
from typing import Any, Dict, List, Optional

import boto3
from botocore.exceptions import ClientError

from app.core.config import settings

MODEL_ID = "arn:aws:bedrock:eu-west-3:557720455286:inference-profile/eu.anthropic.claude-haiku-4-5-20251001-v1:0"

BASE_SYSTEM_PROMPT = """\
You are a friendly Darija (Moroccan Arabic) conversation partner helping a language learner practice.

## Scenario
{scenario_context}

## Target Vocabulary
The student should practice these words/phrases: {target_vocabulary}

## Rules
1. Stay in character for the scenario. Keep the conversation natural and on-topic.
2. Respond in Darija at CEFR level {level}:
   - a1: Very basic greetings, single words, short phrases
   - a2: Simple sentences, common everyday phrases
   - b1: Longer sentences, varied vocabulary, light idioms
   - b2: Complex sentences, idioms, slang, nuanced expressions
3. If the student makes a Darija mistake, gently correct it in the "correction" field. \
Explain what was wrong and show the correct form. If their Darija is correct, set "correction" to null.
4. If the student goes off-topic or writes in pure English, redirect them kindly back to the \
scenario and encourage them to try in Darija.
5. Provide 2 suggested responses the student could say next. When the conversation has reached \
a natural conclusion (e.g. goodbye), return an empty suggestions array.
6. Keep responses concise (1-3 sentences).

## Response Format
You MUST respond with valid JSON only, no other text:
{{
  "arabic": "your response in Arabic script",
  "latin": "your response in Latin transliteration",
  "english": "English translation of your response",
  "correction": "correction of the student's mistake with explanation, or null if correct",
  "suggestions": [
    {{"arabic": "suggested reply in Arabic", "latin": "in Latin transliteration", "english": "English meaning"}},
    {{"arabic": "another suggestion in Arabic", "latin": "in Latin", "english": "English meaning"}}
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

        # Parse the structured JSON response from Claude
        parsed = json.loads(assistant_text)

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
