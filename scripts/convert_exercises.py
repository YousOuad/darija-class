"""Convert curriculum exercises to only multiple_choice and translation types.

For each lesson:
- Keep existing multiple_choice exercises
- Keep existing translation exercises
- Convert fill_in_blank → translation
- Convert matching pairs → multiple multiple_choice questions
- Remove ordering, dialogue_completion
- Generate extra MC from vocabulary if total < 5
- Cap at 10 exercises
"""

import json
import random
import glob
import os

random.seed(42)  # Reproducible


def convert_fill_to_translation(ex):
    """Convert a fill_in_blank exercise to a translation exercise."""
    hint = ex.get("hint", "")
    correct = ex.get("correct_answer", "")
    romanized = ex.get("romanized_answer", "")

    # Build a translation question from the hint or context
    if hint:
        question = f"Translate to Darija: '{hint}'"
    else:
        question = f"Translate to Darija: '{correct}'"

    return {
        "type": "translation",
        "question": question,
        "correct_answer_arabic": correct,
        "correct_answer_romanized": romanized,
        "hint": "",
    }


def convert_matching_to_mc(pairs):
    """Convert matching pairs into multiple_choice questions."""
    questions = []
    for i, pair in enumerate(pairs):
        darija = pair.get("darija", "")
        english = pair.get("english", "")
        if not darija or not english:
            continue

        # Build distractors from other pairs
        other_english = [
            p["english"] for j, p in enumerate(pairs) if j != i and p.get("english")
        ]
        distractors = random.sample(other_english, min(3, len(other_english)))

        # If not enough distractors from pairs, skip
        if len(distractors) < 2:
            continue

        questions.append(
            {
                "type": "multiple_choice",
                "question": f"What does '{darija}' mean?",
                "correct_answer": english,
                "distractors": distractors[:3],
            }
        )

    return questions


def generate_mc_from_vocab(vocab, existing_count, target_min=5):
    """Generate MC questions from vocabulary to reach target_min."""
    needed = target_min - existing_count
    if needed <= 0 or len(vocab) < 4:
        return []

    questions = []
    all_english = [v.get("english", "") for v in vocab if v.get("english")]

    for item in vocab:
        if len(questions) >= needed:
            break

        arabic = item.get("arabic", "")
        romanized = item.get("romanized", "")
        english = item.get("english", "")
        if not english or not (arabic or romanized):
            continue

        # Use romanized if available, otherwise arabic
        word_display = romanized if romanized else arabic
        other_english = [e for e in all_english if e != english]
        if len(other_english) < 3:
            continue

        distractors = random.sample(other_english, 3)
        questions.append(
            {
                "type": "multiple_choice",
                "question": f"What does '{word_display}' mean?",
                "correct_answer": english,
                "distractors": distractors,
            }
        )

    return questions


def process_lesson(lesson_data):
    """Process a single lesson's exercises."""
    exercises = lesson_data.get("exercises", [])
    vocab = lesson_data.get("vocabulary", [])

    result = []

    for ex in exercises:
        ex_type = ex.get("type", "")

        if ex_type == "multiple_choice":
            result.append(ex)
        elif ex_type == "translation":
            result.append(ex)
        elif ex_type == "fill_in_blank":
            result.append(convert_fill_to_translation(ex))
        elif ex_type == "matching":
            mc_from_pairs = convert_matching_to_mc(ex.get("pairs", []))
            result.extend(mc_from_pairs)
        # Skip ordering, dialogue_completion, etc.

    # If not enough, generate from vocabulary
    if len(result) < 5:
        extra = generate_mc_from_vocab(vocab, len(result), target_min=5)
        result.extend(extra)

    # Cap at 10
    if len(result) > 10:
        result = result[:10]

    # Ensure at least 5 (if possible)
    lesson_data["exercises"] = result
    return lesson_data


def process_file(filepath):
    """Process a curriculum JSON file."""
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    lessons = data.get("lessons", [])
    for lesson in lessons:
        process_lesson(lesson)

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    return len(lessons)


def main():
    base = os.path.join(os.path.dirname(__file__), "..", "curriculum")
    files = sorted(glob.glob(os.path.join(base, "**", "module_*.json"), recursive=True))

    total_lessons = 0
    for fp in files:
        count = process_file(fp)
        rel = os.path.relpath(fp, base)
        print(f"  {rel}: {count} lessons processed")
        total_lessons += count

    print(f"\nDone. {total_lessons} lessons across {len(files)} files.")


if __name__ == "__main__":
    main()
