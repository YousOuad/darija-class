"""Deterministic Arabic-to-Latin transliteration for Moroccan Darija.

This module provides a character-level mapping from Arabic script to a
romanised form commonly used in informal Darija writing (e.g. SMS, chat).
"""

from typing import Dict

# ---------------------------------------------------------------------------
# Character map: Arabic -> Latin (Darija-specific conventions)
# ---------------------------------------------------------------------------

ARABIC_TO_LATIN: Dict[str, str] = {
    # Basic letters
    "\u0627": "a",  # alef
    "\u0628": "b",  # ba
    "\u062a": "t",  # ta
    "\u062b": "th",  # tha
    "\u062c": "j",  # jim
    "\u062d": "7",  # ha  (Darija: 7)
    "\u062e": "kh",  # kha
    "\u062f": "d",  # dal
    "\u0630": "dh",  # dhal
    "\u0631": "r",  # ra
    "\u0632": "z",  # zay
    "\u0633": "s",  # sin
    "\u0634": "ch",  # shin (Darija uses "ch" instead of "sh")
    "\u0635": "s",  # sad
    "\u0636": "d",  # dad
    "\u0637": "t",  # ta (emphatic)
    "\u0638": "dh",  # dha (emphatic)
    "\u0639": "3",  # ain  (Darija: 3)
    "\u063a": "gh",  # ghain
    "\u0641": "f",  # fa
    "\u0642": "9",  # qaf  (Darija: 9)
    "\u0643": "k",  # kaf
    "\u0644": "l",  # lam
    "\u0645": "m",  # mim
    "\u0646": "n",  # nun
    "\u0647": "h",  # ha
    "\u0648": "w",  # waw
    "\u064a": "y",  # ya
    # Darija-specific / Maghrebi
    "\u06af": "g",  # gaf (used in Darija for /g/)
    "\u06a4": "v",  # ve  (loanwords)
    "\u067e": "p",  # pe  (loanwords)
    # Hamza forms
    "\u0621": "'",  # hamza
    "\u0623": "a",  # alef with hamza above
    "\u0625": "i",  # alef with hamza below
    "\u0624": "ou",  # waw with hamza
    "\u0626": "i",  # ya with hamza
    # Ta marbuta & alef maqsura
    "\u0629": "a",  # ta marbuta
    "\u0649": "a",  # alef maqsura
    # Lam-alef ligatures
    "\ufefb": "la",  # lam-alef
    "\ufefc": "la",  # lam-alef (final form)
    # Vowel marks (diacritics)
    "\u064e": "a",  # fatha
    "\u064f": "ou",  # damma
    "\u0650": "i",  # kasra
    "\u0651": "",  # shadda (double the preceding consonant -- handled below)
    "\u0652": "",  # sukun  (no vowel)
    "\u064b": "an",  # tanwin fatha
    "\u064c": "oun",  # tanwin damma
    "\u064d": "in",  # tanwin kasra
    # Common Darija digraphs expressed as single Unicode points are rare;
    # the mapping above covers them via multi-char values (ch, gh, kh, etc.)
}

# Characters to strip entirely (zero-width joiners, tatweel, etc.)
STRIP_CHARS = {
    "\u200c",  # ZWNJ
    "\u200d",  # ZWJ
    "\u0640",  # tatweel (kashida)
    "\u00a0",  # non-breaking space
}


def arabic_to_latin(text: str) -> str:
    """Convert Arabic-script Darija text to a romanised Latin form.

    Parameters
    ----------
    text : str
        Input text in Arabic script.

    Returns
    -------
    str
        Romanised transliteration using Darija chat conventions
        (3 for ain, 7 for ha, 9 for qaf, ch for shin, etc.).
    """
    result: list[str] = []
    prev_mapped = ""

    for char in text:
        if char in STRIP_CHARS:
            continue

        mapped = ARABIC_TO_LATIN.get(char)

        if mapped is not None:
            # Handle shadda: double the previous consonant
            if char == "\u0651" and prev_mapped:
                result.append(prev_mapped)
            else:
                result.append(mapped)
                prev_mapped = mapped
        else:
            # Pass through spaces, punctuation, digits, and Latin chars unchanged
            result.append(char)
            prev_mapped = ""

    return "".join(result)
