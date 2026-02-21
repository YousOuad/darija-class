#!/usr/bin/env python3
"""Add conjugation tables to every lesson in the DarijaLingo curriculum.

Each lesson gets 2-3 contextually relevant verbs with full conjugation tables.
Tenses included depend on level:
  - A2: present + past
  - B1: present + past + future
  - B2: present + past + future + negative
"""

import json
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CURRICULUM_DIR = PROJECT_ROOT / "curriculum"

# =============================================================================
# Verb conjugation database
# Each verb has: root (romanized), arabic, english, type,
# and pre-built conjugation forms for present, past, future, negative.
# =============================================================================

PRONOUNS = ["ana", "nta", "nti", "huwa", "hiya", "hna", "ntuma", "huma"]


def _make_verb(root, arabic, english, present, past, future=None, negative=None):
    """Helper to build a verb entry with all tenses."""
    v = {
        "verb": root,
        "verb_arabic": arabic,
        "english": english,
        "present": dict(zip(PRONOUNS, present)),
        "past": dict(zip(PRONOUNS, past)),
    }
    if future:
        v["future"] = dict(zip(PRONOUNS, future))
    if negative:
        v["negative"] = dict(zip(PRONOUNS, negative))
    return v


VERBS = {}

# --- Common A2 verbs ---

VERBS["hdr"] = _make_verb(
    "hdr",
    "هضر",
    "to talk/speak",
    present=[
        "kanhdr",
        "kathdr",
        "kathdri",
        "kayhdr",
        "kathdr",
        "kanhdru",
        "kathdru",
        "kayhdru",
    ],
    past=["hdrt", "hdrti", "hdrti", "hdr", "hdrat", "hdrna", "hdrtu", "hdru"],
    future=[
        "ghadi nhdr",
        "ghadi thdr",
        "ghadi thdri",
        "ghadi yhdr",
        "ghadi thdr",
        "ghadi nhdru",
        "ghadi thdru",
        "ghadi yhdru",
    ],
    negative=[
        "ma kanhdrsh",
        "ma kathdrsh",
        "ma kathdirsh",
        "ma kayhdrsh",
        "ma kathdrsh",
        "ma kanhdresh",
        "ma kathdresh",
        "ma kayhdresh",
    ],
)

VERBS["3rf"] = _make_verb(
    "3rf",
    "عرف",
    "to know",
    present=[
        "kan3rf",
        "kat3rf",
        "kat3rfi",
        "kay3rf",
        "kat3rf",
        "kan3rfu",
        "kat3rfu",
        "kay3rfu",
    ],
    past=["3rft", "3rfti", "3rfti", "3rf", "3rfat", "3rfna", "3rftu", "3rfu"],
    future=[
        "ghadi n3rf",
        "ghadi t3rf",
        "ghadi t3rfi",
        "ghadi y3rf",
        "ghadi t3rf",
        "ghadi n3rfu",
        "ghadi t3rfu",
        "ghadi y3rfu",
    ],
    negative=[
        "ma kan3rfsh",
        "ma kat3rfsh",
        "ma kat3rfish",
        "ma kay3rfsh",
        "ma kat3rfsh",
        "ma kan3rfush",
        "ma kat3rfush",
        "ma kay3rfush",
    ],
)

VERBS["swl"] = _make_verb(
    "swl",
    "سول",
    "to ask",
    present=[
        "kanswl",
        "katswl",
        "katswli",
        "kayswl",
        "katswl",
        "kanswlu",
        "katswlu",
        "kayswlu",
    ],
    past=["swlt", "swlti", "swlti", "swl", "swlat", "swlna", "swltu", "swlu"],
    future=[
        "ghadi nswl",
        "ghadi tswl",
        "ghadi tswli",
        "ghadi yswl",
        "ghadi tswl",
        "ghadi nswlu",
        "ghadi tswlu",
        "ghadi yswlu",
    ],
    negative=[
        "ma kanswlsh",
        "ma katswlsh",
        "ma katswlish",
        "ma kayswlsh",
        "ma katswlsh",
        "ma kanswlush",
        "ma katswlush",
        "ma kayswlush",
    ],
)

VERBS["7sb"] = _make_verb(
    "7sb",
    "حسب",
    "to count",
    present=[
        "kan7sb",
        "kat7sb",
        "kat7sbi",
        "kay7sb",
        "kat7sb",
        "kan7sbu",
        "kat7sbu",
        "kay7sbu",
    ],
    past=["7sbt", "7sbti", "7sbti", "7sb", "7sbat", "7sbna", "7sbtu", "7sbu"],
    future=[
        "ghadi n7sb",
        "ghadi t7sb",
        "ghadi t7sbi",
        "ghadi y7sb",
        "ghadi t7sb",
        "ghadi n7sbu",
        "ghadi t7sbu",
        "ghadi y7sbu",
    ],
    negative=[
        "ma kan7sbsh",
        "ma kat7sbsh",
        "ma kat7sbish",
        "ma kay7sbsh",
        "ma kat7sbsh",
        "ma kan7sbush",
        "ma kat7sbush",
        "ma kay7sbush",
    ],
)

VERBS["shri"] = _make_verb(
    "shri",
    "شرى",
    "to buy",
    present=[
        "kanshri",
        "katshri",
        "katshri",
        "kayshri",
        "katshri",
        "kanshriw",
        "katshriw",
        "kayshriw",
    ],
    past=["shrit", "shriti", "shriti", "shra", "shrat", "shrina", "shritu", "shraw"],
    future=[
        "ghadi nshri",
        "ghadi tshri",
        "ghadi tshri",
        "ghadi yshri",
        "ghadi tshri",
        "ghadi nshriw",
        "ghadi tshriw",
        "ghadi yshriw",
    ],
    negative=[
        "ma kanshrish",
        "ma katshrish",
        "ma katshrish",
        "ma kayshrish",
        "ma katshrish",
        "ma kanshriwsh",
        "ma katshriwsh",
        "ma kayshriwsh",
    ],
)

VERBS["ba3"] = _make_verb(
    "ba3",
    "باع",
    "to sell",
    present=[
        "kanbi3",
        "katbi3",
        "katbi3i",
        "kaybi3",
        "katbi3",
        "kanbi3u",
        "katbi3u",
        "kaybi3u",
    ],
    past=["b3t", "b3ti", "b3ti", "ba3", "ba3at", "b3na", "b3tu", "ba3u"],
    future=[
        "ghadi nbi3",
        "ghadi tbi3",
        "ghadi tbi3i",
        "ghadi ybi3",
        "ghadi tbi3",
        "ghadi nbi3u",
        "ghadi tbi3u",
        "ghadi ybi3u",
    ],
    negative=[
        "ma kanbi3sh",
        "ma katbi3sh",
        "ma katbi3ish",
        "ma kaybi3sh",
        "ma katbi3sh",
        "ma kanbi3ush",
        "ma katbi3ush",
        "ma kaybi3ush",
    ],
)

VERBS["7bb"] = _make_verb(
    "7bb",
    "حب",
    "to love/like",
    present=[
        "kan7bb",
        "kat7bb",
        "kat7bbi",
        "kay7bb",
        "kat7bb",
        "kan7bbu",
        "kat7bbu",
        "kay7bbu",
    ],
    past=["7bbit", "7bbiti", "7bbiti", "7bb", "7bbat", "7bbina", "7bbitu", "7bbu"],
    future=[
        "ghadi n7bb",
        "ghadi t7bb",
        "ghadi t7bbi",
        "ghadi y7bb",
        "ghadi t7bb",
        "ghadi n7bbu",
        "ghadi t7bbu",
        "ghadi y7bbu",
    ],
    negative=[
        "ma kan7bbsh",
        "ma kat7bbsh",
        "ma kat7bbish",
        "ma kay7bbsh",
        "ma kat7bbsh",
        "ma kan7bbush",
        "ma kat7bbush",
        "ma kay7bbush",
    ],
)

VERBS["sken"] = _make_verb(
    "sken",
    "سكن",
    "to live (in)",
    present=[
        "kansken",
        "katsken",
        "katskni",
        "kaysken",
        "katsken",
        "kansknu",
        "katsknu",
        "kaysknu",
    ],
    past=["sknt", "sknti", "sknti", "sken", "sknat", "sknna", "skntu", "sknu"],
    future=[
        "ghadi nsken",
        "ghadi tsken",
        "ghadi tskni",
        "ghadi ysken",
        "ghadi tsken",
        "ghadi nsknu",
        "ghadi tsknu",
        "ghadi ysknu",
    ],
    negative=[
        "ma kanskensh",
        "ma katskensh",
        "ma katsknish",
        "ma kayskensh",
        "ma katskensh",
        "ma kansknush",
        "ma katsknush",
        "ma kaysknush",
    ],
)

VERBS["kla"] = _make_verb(
    "kla",
    "كلا",
    "to eat",
    present=[
        "kanakl",
        "katakl",
        "katakli",
        "kayakl",
        "katakl",
        "kanaklu",
        "kataklu",
        "kayaklu",
    ],
    past=["klit", "kliti", "kliti", "kla", "klat", "klina", "klitu", "klaw"],
    future=[
        "ghadi nakl",
        "ghadi takl",
        "ghadi takli",
        "ghadi yakl",
        "ghadi takl",
        "ghadi naklu",
        "ghadi taklu",
        "ghadi yaklu",
    ],
    negative=[
        "ma kanaklsh",
        "ma kataklsh",
        "ma kataklish",
        "ma kayaklsh",
        "ma kataklsh",
        "ma kanaklush",
        "ma kataklush",
        "ma kayaklush",
    ],
)

VERBS["shrb"] = _make_verb(
    "shrb",
    "شرب",
    "to drink",
    present=[
        "kanshrb",
        "katshrb",
        "katshrbi",
        "kayshrb",
        "katshrb",
        "kanshrbu",
        "katshrbu",
        "kayshrbu",
    ],
    past=["shrbt", "shrbti", "shrbti", "shrb", "shrbat", "shrbna", "shrbtu", "shrbu"],
    future=[
        "ghadi nshrb",
        "ghadi tshrb",
        "ghadi tshrbi",
        "ghadi yshrb",
        "ghadi tshrb",
        "ghadi nshrbu",
        "ghadi tshrbu",
        "ghadi yshrbu",
    ],
    negative=[
        "ma kanshrubsh",
        "ma katshrubsh",
        "ma katshrubish",
        "ma kayshrubsh",
        "ma katshrubsh",
        "ma kanshrubush",
        "ma katshrubush",
        "ma kayshrubush",
    ],
)

VERBS["tiyb"] = _make_verb(
    "tiyb",
    "طيب",
    "to cook",
    present=[
        "kantiyb",
        "kattiyb",
        "kattiybi",
        "kaytiyb",
        "kattiyb",
        "kantiybu",
        "kattiybu",
        "kaytiybu",
    ],
    past=["tiybt", "tiybti", "tiybti", "tiyb", "tiybat", "tiybna", "tiybtu", "tiybu"],
    future=[
        "ghadi ntiyb",
        "ghadi ttiyb",
        "ghadi ttiybi",
        "ghadi ytiyb",
        "ghadi ttiyb",
        "ghadi ntiybu",
        "ghadi ttiybu",
        "ghadi ytiybu",
    ],
    negative=[
        "ma kantiybsh",
        "ma kattiybsh",
        "ma kattiybish",
        "ma kaytiybsh",
        "ma kattiybsh",
        "ma kantiybush",
        "ma kattiybush",
        "ma kaytiybush",
    ],
)

VERBS["msha"] = _make_verb(
    "msha",
    "مشى",
    "to go",
    present=[
        "kanmshi",
        "katmshi",
        "katmshi",
        "kaymshi",
        "katmshi",
        "kanmshiw",
        "katmshiw",
        "kaymshiw",
    ],
    past=["mshit", "mshiti", "mshiti", "msha", "mshat", "mshina", "mshitu", "mshaw"],
    future=[
        "ghadi nmshi",
        "ghadi tmshi",
        "ghadi tmshi",
        "ghadi ymshi",
        "ghadi tmshi",
        "ghadi nmshiw",
        "ghadi tmshiw",
        "ghadi ymshiw",
    ],
    negative=[
        "ma kanmshish",
        "ma katmshish",
        "ma katmshish",
        "ma kaymshish",
        "ma katmshish",
        "ma kanmshiwsh",
        "ma katmshiwsh",
        "ma kaymshiwsh",
    ],
)

VERBS["wsl"] = _make_verb(
    "wsl",
    "وصل",
    "to arrive",
    present=[
        "kanwsl",
        "katwsl",
        "katwsli",
        "kaywsl",
        "katwsl",
        "kanwslu",
        "katwslu",
        "kaywslu",
    ],
    past=["wslt", "wslti", "wslti", "wsl", "wslat", "wslna", "wsltu", "wslu"],
    future=[
        "ghadi nwsl",
        "ghadi twsl",
        "ghadi twsli",
        "ghadi ywsl",
        "ghadi twsl",
        "ghadi nwslu",
        "ghadi twslu",
        "ghadi ywslu",
    ],
    negative=[
        "ma kanwslsh",
        "ma katwslsh",
        "ma katwslish",
        "ma kaywslsh",
        "ma katwslsh",
        "ma kanwslush",
        "ma katwslush",
        "ma kaywslush",
    ],
)

VERBS["khrj"] = _make_verb(
    "khrj",
    "خرج",
    "to go out",
    present=[
        "kankhrj",
        "katkhrj",
        "katkhrji",
        "kaykhrj",
        "katkhrj",
        "kankhrju",
        "katkhrju",
        "kaykhrju",
    ],
    past=["khrjt", "khrjti", "khrjti", "khrj", "khrjat", "khrjna", "khrjtu", "khrju"],
    future=[
        "ghadi nkhrj",
        "ghadi tkhrj",
        "ghadi tkhrji",
        "ghadi ykhrj",
        "ghadi tkhrj",
        "ghadi nkhrju",
        "ghadi tkhrju",
        "ghadi ykhrju",
    ],
    negative=[
        "ma kankhrjsh",
        "ma katkhrjsh",
        "ma katkhrjish",
        "ma kaykhrjsh",
        "ma katkhrjsh",
        "ma kankhrjush",
        "ma katkhrjush",
        "ma kaykhrjush",
    ],
)

VERBS["khllss"] = _make_verb(
    "khllss",
    "خلص",
    "to pay",
    present=[
        "kankhllss",
        "katkhllss",
        "katkhllssi",
        "kaykhllss",
        "katkhllss",
        "kankhllssu",
        "katkhllssu",
        "kaykhllssu",
    ],
    past=[
        "khllsst",
        "khllssti",
        "khllssti",
        "khllss",
        "khllssat",
        "khllssna",
        "khllsstu",
        "khllssu",
    ],
    future=[
        "ghadi nkhllss",
        "ghadi tkhllss",
        "ghadi tkhllssi",
        "ghadi ykhllss",
        "ghadi tkhllss",
        "ghadi nkhllssu",
        "ghadi tkhllssu",
        "ghadi ykhllssu",
    ],
    negative=[
        "ma kankhllssh",
        "ma katkhllssh",
        "ma katkhllssish",
        "ma kaykhllssh",
        "ma katkhllssh",
        "ma kankhllssush",
        "ma katkhllssush",
        "ma kaykhllssush",
    ],
)

VERBS["fa9"] = _make_verb(
    "fa9",
    "فاق",
    "to wake up",
    present=[
        "kanfi9",
        "katfi9",
        "katfi9i",
        "kayfi9",
        "katfi9",
        "kanfi9u",
        "katfi9u",
        "kayfi9u",
    ],
    past=["f9t", "f9ti", "f9ti", "fa9", "fa9at", "f9na", "f9tu", "fa9u"],
    future=[
        "ghadi nfi9",
        "ghadi tfi9",
        "ghadi tfi9i",
        "ghadi yfi9",
        "ghadi tfi9",
        "ghadi nfi9u",
        "ghadi tfi9u",
        "ghadi yfi9u",
    ],
    negative=[
        "ma kanfi9sh",
        "ma katfi9sh",
        "ma katfi9ish",
        "ma kayfi9sh",
        "ma katfi9sh",
        "ma kanfi9ush",
        "ma katfi9ush",
        "ma kayfi9ush",
    ],
)

VERBS["n3s"] = _make_verb(
    "n3s",
    "نعس",
    "to sleep",
    present=[
        "kann3s",
        "katn3s",
        "katn3si",
        "kayn3s",
        "katn3s",
        "kann3su",
        "katn3su",
        "kayn3su",
    ],
    past=["n3st", "n3sti", "n3sti", "n3s", "n3sat", "n3sna", "n3stu", "n3su"],
    future=[
        "ghadi nn3s",
        "ghadi tn3s",
        "ghadi tn3si",
        "ghadi yn3s",
        "ghadi tn3s",
        "ghadi nn3su",
        "ghadi tn3su",
        "ghadi yn3su",
    ],
    negative=[
        "ma kann3ssh",
        "ma katn3ssh",
        "ma katn3sish",
        "ma kayn3ssh",
        "ma katn3ssh",
        "ma kann3sush",
        "ma katn3sush",
        "ma kayn3sush",
    ],
)

VERBS["khdm"] = _make_verb(
    "khdm",
    "خدم",
    "to work",
    present=[
        "kankhdm",
        "katkhdm",
        "katkhdmi",
        "kaykhdm",
        "katkhdm",
        "kankhdmu",
        "katkhdmu",
        "kaykhdmu",
    ],
    past=["khdmt", "khdmti", "khdmti", "khdm", "khdmat", "khdmna", "khdmtu", "khdmu"],
    future=[
        "ghadi nkhdm",
        "ghadi tkhdm",
        "ghadi tkhdmi",
        "ghadi ykhdm",
        "ghadi tkhdm",
        "ghadi nkhdmu",
        "ghadi tkhdmu",
        "ghadi ykhdmu",
    ],
    negative=[
        "ma kankhdmsh",
        "ma katkhdmsh",
        "ma katkhdmish",
        "ma kaykhdmsh",
        "ma katkhdmsh",
        "ma kankhdmush",
        "ma katkhdmush",
        "ma kaykhdmush",
    ],
)

VERBS["fhm"] = _make_verb(
    "fhm",
    "فهم",
    "to understand",
    present=[
        "kanfhm",
        "katfhm",
        "katfhmi",
        "kayfhm",
        "katfhm",
        "kanfhmu",
        "katfhmu",
        "kayfhmu",
    ],
    past=["fhmt", "fhmti", "fhmti", "fhm", "fhmat", "fhmna", "fhmtu", "fhmu"],
    future=[
        "ghadi nfhm",
        "ghadi tfhm",
        "ghadi tfhmi",
        "ghadi yfhm",
        "ghadi tfhm",
        "ghadi nfhmu",
        "ghadi tfhmu",
        "ghadi yfhmu",
    ],
    negative=[
        "ma kanfhmsh",
        "ma katfhmsh",
        "ma katfhmish",
        "ma kayfhmsh",
        "ma katfhmsh",
        "ma kanfhmush",
        "ma katfhmush",
        "ma kayfhmush",
    ],
)

VERBS["ja"] = _make_verb(
    "ja",
    "جا",
    "to come",
    present=["kanji", "katji", "katji", "kayji", "katji", "kanjiw", "katjiw", "kayjiw"],
    past=["jit", "jiti", "jiti", "ja", "jat", "jina", "jitu", "jaw"],
    future=[
        "ghadi nji",
        "ghadi tji",
        "ghadi tji",
        "ghadi yji",
        "ghadi tji",
        "ghadi njiw",
        "ghadi tjiw",
        "ghadi yjiw",
    ],
    negative=[
        "ma kanjish",
        "ma katjish",
        "ma katjish",
        "ma kayjish",
        "ma katjish",
        "ma kanjiwsh",
        "ma katjiwsh",
        "ma kayjiwsh",
    ],
)

VERBS["sir"] = _make_verb(
    "sir",
    "سير",
    "to go/walk",
    present=[
        "kansir",
        "katsir",
        "katsiri",
        "kaysir",
        "katsir",
        "kansiru",
        "katsiru",
        "kaysiru",
    ],
    past=["srt", "srti", "srti", "sar", "sarat", "srna", "srtu", "saru"],
    future=[
        "ghadi nsir",
        "ghadi tsir",
        "ghadi tsiri",
        "ghadi ysir",
        "ghadi tsir",
        "ghadi nsiru",
        "ghadi tsiru",
        "ghadi ysiru",
    ],
    negative=[
        "ma kansirsh",
        "ma katsirsh",
        "ma katsirish",
        "ma kaysirsh",
        "ma katsirsh",
        "ma kansirush",
        "ma katsirush",
        "ma kaysirush",
    ],
)

# --- B1 verbs ---

VERBS["dnn"] = _make_verb(
    "dnn",
    "ضن",
    "to think/believe",
    present=[
        "kandnn",
        "katdnn",
        "katdnni",
        "kaydnn",
        "katdnn",
        "kandnnu",
        "katdnnu",
        "kaydnnu",
    ],
    past=["dnnit", "dnniti", "dnniti", "dnn", "dnnat", "dnnina", "dnnitu", "dnnu"],
    future=[
        "ghadi ndnn",
        "ghadi tdnn",
        "ghadi tdnni",
        "ghadi ydnn",
        "ghadi tdnn",
        "ghadi ndnnu",
        "ghadi tdnnu",
        "ghadi ydnnu",
    ],
    negative=[
        "ma kandnnsh",
        "ma katdnnsh",
        "ma katdnnish",
        "ma kaydnnsh",
        "ma katdnnsh",
        "ma kandnnush",
        "ma katdnnush",
        "ma kaydnnush",
    ],
)

VERBS["fkkr"] = _make_verb(
    "fkkr",
    "فكر",
    "to think",
    present=[
        "kanfkkr",
        "katfkkr",
        "katfkkri",
        "kayfkkr",
        "katfkkr",
        "kanfkkru",
        "katfkkru",
        "kayfkkru",
    ],
    past=["fkkrt", "fkkrti", "fkkrti", "fkkr", "fkkrat", "fkkrna", "fkkrtu", "fkkru"],
    future=[
        "ghadi nfkkr",
        "ghadi tfkkr",
        "ghadi tfkkri",
        "ghadi yfkkr",
        "ghadi tfkkr",
        "ghadi nfkkru",
        "ghadi tfkkru",
        "ghadi yfkkru",
    ],
    negative=[
        "ma kanfkkrsh",
        "ma katfkkrsh",
        "ma katfkkrish",
        "ma kayfkkrsh",
        "ma katfkkrsh",
        "ma kanfkkrush",
        "ma katfkkrush",
        "ma kayfkkrush",
    ],
)

VERBS["9bl"] = _make_verb(
    "9bl",
    "قبل",
    "to accept",
    present=[
        "kan9bl",
        "kat9bl",
        "kat9bli",
        "kay9bl",
        "kat9bl",
        "kan9blu",
        "kat9blu",
        "kay9blu",
    ],
    past=["9blt", "9blti", "9blti", "9bl", "9blat", "9blna", "9bltu", "9blu"],
    future=[
        "ghadi n9bl",
        "ghadi t9bl",
        "ghadi t9bli",
        "ghadi y9bl",
        "ghadi t9bl",
        "ghadi n9blu",
        "ghadi t9blu",
        "ghadi y9blu",
    ],
    negative=[
        "ma kan9blsh",
        "ma kat9blsh",
        "ma kat9blish",
        "ma kay9blsh",
        "ma kat9blsh",
        "ma kan9blush",
        "ma kat9blush",
        "ma kay9blush",
    ],
)

VERBS["7ka"] = _make_verb(
    "7ka",
    "حكى",
    "to tell/narrate",
    present=[
        "kan7ki",
        "kat7ki",
        "kat7ki",
        "kay7ki",
        "kat7ki",
        "kan7kiw",
        "kat7kiw",
        "kay7kiw",
    ],
    past=["7kit", "7kiti", "7kiti", "7ka", "7kat", "7kina", "7kitu", "7kaw"],
    future=[
        "ghadi n7ki",
        "ghadi t7ki",
        "ghadi t7ki",
        "ghadi y7ki",
        "ghadi t7ki",
        "ghadi n7kiw",
        "ghadi t7kiw",
        "ghadi y7kiw",
    ],
    negative=[
        "ma kan7kish",
        "ma kat7kish",
        "ma kat7kish",
        "ma kay7kish",
        "ma kat7kish",
        "ma kan7kiwsh",
        "ma kat7kiwsh",
        "ma kay7kiwsh",
    ],
)

VERBS["w93"] = _make_verb(
    "w93",
    "وقع",
    "to happen",
    present=[
        "kanw93",
        "katw93",
        "katw93i",
        "kayw93",
        "katw93",
        "kanw93u",
        "katw93u",
        "kayw93u",
    ],
    past=["w93t", "w93ti", "w93ti", "w93", "w93at", "w93na", "w93tu", "w93u"],
    future=[
        "ghadi nw93",
        "ghadi tw93",
        "ghadi tw93i",
        "ghadi yw93",
        "ghadi tw93",
        "ghadi nw93u",
        "ghadi tw93u",
        "ghadi yw93u",
    ],
    negative=[
        "ma kanw93sh",
        "ma katw93sh",
        "ma katw93ish",
        "ma kayw93sh",
        "ma katw93sh",
        "ma kanw93ush",
        "ma katw93ush",
        "ma kayw93ush",
    ],
)

VERBS["t3llm"] = _make_verb(
    "t3llm",
    "تعلم",
    "to learn",
    present=[
        "kant3llm",
        "katt3llm",
        "katt3llmi",
        "kayt3llm",
        "katt3llm",
        "kant3llmu",
        "katt3llmu",
        "kayt3llmu",
    ],
    past=[
        "t3llmt",
        "t3llmti",
        "t3llmti",
        "t3llm",
        "t3llmat",
        "t3llmna",
        "t3llmtu",
        "t3llmu",
    ],
    future=[
        "ghadi nt3llm",
        "ghadi tt3llm",
        "ghadi tt3llmi",
        "ghadi yt3llm",
        "ghadi tt3llm",
        "ghadi nt3llmu",
        "ghadi tt3llmu",
        "ghadi yt3llmu",
    ],
    negative=[
        "ma kant3llmsh",
        "ma katt3llmsh",
        "ma katt3llmish",
        "ma kayt3llmsh",
        "ma katt3llmsh",
        "ma kant3llmush",
        "ma katt3llmush",
        "ma kayt3llmush",
    ],
)

VERBS["safr"] = _make_verb(
    "safr",
    "سافر",
    "to travel",
    present=[
        "kansafr",
        "katsafr",
        "katsafri",
        "kaysafr",
        "katsafr",
        "kansafru",
        "katsafru",
        "kaysafru",
    ],
    past=["safrt", "safrti", "safrti", "safr", "safrat", "safrna", "safrtu", "safru"],
    future=[
        "ghadi nsafr",
        "ghadi tsafr",
        "ghadi tsafri",
        "ghadi ysafr",
        "ghadi tsafr",
        "ghadi nsafru",
        "ghadi tsafru",
        "ghadi ysafru",
    ],
    negative=[
        "ma kansafrsh",
        "ma katsafrsh",
        "ma katsafrish",
        "ma kaysafrsh",
        "ma katsafrsh",
        "ma kansafrush",
        "ma katsafrush",
        "ma kaysafrush",
    ],
)

VERBS["7jz"] = _make_verb(
    "7jz",
    "حجز",
    "to book/reserve",
    present=[
        "kan7jz",
        "kat7jz",
        "kat7jzi",
        "kay7jz",
        "kat7jz",
        "kan7jzu",
        "kat7jzu",
        "kay7jzu",
    ],
    past=["7jzt", "7jzti", "7jzti", "7jz", "7jzat", "7jzna", "7jztu", "7jzu"],
    future=[
        "ghadi n7jz",
        "ghadi t7jz",
        "ghadi t7jzi",
        "ghadi y7jz",
        "ghadi t7jz",
        "ghadi n7jzu",
        "ghadi t7jzu",
        "ghadi y7jzu",
    ],
    negative=[
        "ma kan7jzsh",
        "ma kat7jzsh",
        "ma kat7jzish",
        "ma kay7jzsh",
        "ma kat7jzsh",
        "ma kan7jzush",
        "ma kat7jzush",
        "ma kay7jzush",
    ],
)

VERBS["mrd"] = _make_verb(
    "mrd",
    "مرض",
    "to get sick",
    present=[
        "kanmrd",
        "katmrd",
        "katmrdi",
        "kaymrd",
        "katmrd",
        "kanmrdu",
        "katmrdu",
        "kaymrdu",
    ],
    past=["mrdt", "mrdti", "mrdti", "mrd", "mrdat", "mrdna", "mrdtu", "mrdu"],
    future=[
        "ghadi nmrd",
        "ghadi tmrd",
        "ghadi tmrdi",
        "ghadi ymrd",
        "ghadi tmrd",
        "ghadi nmrdu",
        "ghadi tmrdu",
        "ghadi ymrdu",
    ],
    negative=[
        "ma kanmrdsh",
        "ma katmrdsh",
        "ma katmrdish",
        "ma kaymrdsh",
        "ma katmrdsh",
        "ma kanmrdush",
        "ma katmrdush",
        "ma kaymrdush",
    ],
)

VERBS["rta7"] = _make_verb(
    "rta7",
    "رتاح",
    "to rest",
    present=[
        "kanrta7",
        "katrta7",
        "katrta7i",
        "kayrta7",
        "katrta7",
        "kanrta7u",
        "katrta7u",
        "kayrta7u",
    ],
    past=["rta7t", "rta7ti", "rta7ti", "rta7", "rta7at", "rta7na", "rta7tu", "rta7u"],
    future=[
        "ghadi nrta7",
        "ghadi trta7",
        "ghadi trta7i",
        "ghadi yrta7",
        "ghadi trta7",
        "ghadi nrta7u",
        "ghadi trta7u",
        "ghadi yrta7u",
    ],
    negative=[
        "ma kanrta7sh",
        "ma katrta7sh",
        "ma katrta7ish",
        "ma kayrta7sh",
        "ma katrta7sh",
        "ma kanrta7ush",
        "ma katrta7ush",
        "ma kayrta7ush",
    ],
)

VERBS["bra"] = _make_verb(
    "bra",
    "برا",
    "to heal/recover",
    present=[
        "kanbra",
        "katbra",
        "katbra",
        "kaybra",
        "katbra",
        "kanbraw",
        "katbraw",
        "kaybraw",
    ],
    past=["brit", "briti", "briti", "bra", "brat", "brina", "britu", "braw"],
    future=[
        "ghadi nbra",
        "ghadi tbra",
        "ghadi tbra",
        "ghadi ybra",
        "ghadi tbra",
        "ghadi nbraw",
        "ghadi tbraw",
        "ghadi ybraw",
    ],
    negative=[
        "ma kanbrash",
        "ma katbrash",
        "ma katbrash",
        "ma kaybrash",
        "ma katbrash",
        "ma kanbrawsh",
        "ma katbrawsh",
        "ma kaybrawsh",
    ],
)

VERBS["9ra"] = _make_verb(
    "9ra",
    "قرا",
    "to study/read",
    present=[
        "kan9ra",
        "kat9ra",
        "kat9ra",
        "kay9ra",
        "kat9ra",
        "kan9raw",
        "kat9raw",
        "kay9raw",
    ],
    past=["9rit", "9riti", "9riti", "9ra", "9rat", "9rina", "9ritu", "9raw"],
    future=[
        "ghadi n9ra",
        "ghadi t9ra",
        "ghadi t9ra",
        "ghadi y9ra",
        "ghadi t9ra",
        "ghadi n9raw",
        "ghadi t9raw",
        "ghadi y9raw",
    ],
    negative=[
        "ma kan9rash",
        "ma kat9rash",
        "ma kat9rash",
        "ma kay9rash",
        "ma kat9rash",
        "ma kan9rawsh",
        "ma kat9rawsh",
        "ma kay9rawsh",
    ],
)

VERBS["nj7"] = _make_verb(
    "nj7",
    "نجح",
    "to succeed",
    present=[
        "kannj7",
        "katnj7",
        "katnj7i",
        "kaynj7",
        "katnj7",
        "kannj7u",
        "katnj7u",
        "kaynj7u",
    ],
    past=["nj7t", "nj7ti", "nj7ti", "nj7", "nj7at", "nj7na", "nj7tu", "nj7u"],
    future=[
        "ghadi nnj7",
        "ghadi tnj7",
        "ghadi tnj7i",
        "ghadi ynj7",
        "ghadi tnj7",
        "ghadi nnj7u",
        "ghadi tnj7u",
        "ghadi ynj7u",
    ],
    negative=[
        "ma kannj7sh",
        "ma katnj7sh",
        "ma katnj7ish",
        "ma kaynj7sh",
        "ma katnj7sh",
        "ma kannj7ush",
        "ma katnj7ush",
        "ma kaynj7ush",
    ],
)

VERBS["zar"] = _make_verb(
    "zar",
    "زار",
    "to visit",
    present=[
        "kanzur",
        "katzur",
        "katzuri",
        "kayzur",
        "katzur",
        "kanzuru",
        "katzuru",
        "kayzuru",
    ],
    past=["zrt", "zrti", "zrti", "zar", "zarat", "zrna", "zrtu", "zaru"],
    future=[
        "ghadi nzur",
        "ghadi tzur",
        "ghadi tzuri",
        "ghadi yzur",
        "ghadi tzur",
        "ghadi nzuru",
        "ghadi tzuru",
        "ghadi yzuru",
    ],
    negative=[
        "ma kanzursh",
        "ma katzursh",
        "ma katzurish",
        "ma kayzursh",
        "ma katzursh",
        "ma kanzurush",
        "ma katzurush",
        "ma kayzurush",
    ],
)

VERBS["fddl"] = _make_verb(
    "fddl",
    "فضل",
    "to prefer",
    present=[
        "kanfddl",
        "katfddl",
        "katfddli",
        "kayfddl",
        "katfddl",
        "kanfddlu",
        "katfddlu",
        "kayfddlu",
    ],
    past=["fddlt", "fddlti", "fddlti", "fddl", "fddlat", "fddlna", "fddltu", "fddlu"],
    future=[
        "ghadi nfddl",
        "ghadi tfddl",
        "ghadi tfddli",
        "ghadi yfddl",
        "ghadi tfddl",
        "ghadi nfddlu",
        "ghadi tfddlu",
        "ghadi yfddlu",
    ],
    negative=[
        "ma kanfddlsh",
        "ma katfddlsh",
        "ma katfddlish",
        "ma kayfddlsh",
        "ma katfddlsh",
        "ma kanfddlush",
        "ma katfddlush",
        "ma kayfddlush",
    ],
)

VERBS["khtar"] = _make_verb(
    "khtar",
    "ختار",
    "to choose",
    present=[
        "kankhtar",
        "katkhtar",
        "katkhtari",
        "kaykhtar",
        "katkhtar",
        "kankhtaru",
        "katkhtaru",
        "kaykhtaru",
    ],
    past=[
        "khtart",
        "khtarti",
        "khtarti",
        "khtar",
        "khtarat",
        "khtarna",
        "khtartu",
        "khtaru",
    ],
    future=[
        "ghadi nkhtar",
        "ghadi tkhtar",
        "ghadi tkhtari",
        "ghadi ykhtar",
        "ghadi tkhtar",
        "ghadi nkhtaru",
        "ghadi tkhtaru",
        "ghadi ykhtaru",
    ],
    negative=[
        "ma kankhtarsh",
        "ma katkhtarsh",
        "ma katkhtarish",
        "ma kaykhtarsh",
        "ma katkhtarsh",
        "ma kankhtarush",
        "ma katkhtarush",
        "ma kaykhtarush",
    ],
)

VERBS["bgha"] = _make_verb(
    "bgha",
    "بغى",
    "to want",
    present=[
        "kanbghi",
        "katbghi",
        "katbghi",
        "kaybghi",
        "katbghi",
        "kanbghiw",
        "katbghiw",
        "kaybghiw",
    ],
    past=["bghit", "bghiti", "bghiti", "bgha", "bghat", "bghina", "bghitu", "bghaw"],
    future=[
        "ghadi nbghi",
        "ghadi tbghi",
        "ghadi tbghi",
        "ghadi ybghi",
        "ghadi tbghi",
        "ghadi nbghiw",
        "ghadi tbghiw",
        "ghadi ybghiw",
    ],
    negative=[
        "ma kanbghish",
        "ma katbghish",
        "ma katbghish",
        "ma kaybghish",
        "ma katbghish",
        "ma kanbghiwsh",
        "ma katbghiwsh",
        "ma kaybghiwsh",
    ],
)

VERBS["tmna"] = _make_verb(
    "tmna",
    "تمنى",
    "to wish/hope",
    present=[
        "kantmna",
        "kattmna",
        "kattmna",
        "kaytmna",
        "kattmna",
        "kantmnaw",
        "kattmnaw",
        "kaytmnaw",
    ],
    past=["tmnit", "tmniti", "tmniti", "tmna", "tmnat", "tmnina", "tmnitu", "tmnaw"],
    future=[
        "ghadi ntmna",
        "ghadi ttmna",
        "ghadi ttmna",
        "ghadi ytmna",
        "ghadi ttmna",
        "ghadi ntmnaw",
        "ghadi ttmnaw",
        "ghadi ytmnaw",
    ],
    negative=[
        "ma kantmnash",
        "ma kattmnash",
        "ma kattmnash",
        "ma kaytmnash",
        "ma kattmnash",
        "ma kantmnawsh",
        "ma kattmnawsh",
        "ma kaytmnawsh",
    ],
)

VERBS["bda"] = _make_verb(
    "bda",
    "بدا",
    "to start/begin",
    present=[
        "kanbda",
        "katbda",
        "katbda",
        "kaybda",
        "katbda",
        "kanbdaw",
        "katbdaw",
        "kaybdaw",
    ],
    past=["bdit", "bditi", "bditi", "bda", "bdat", "bdina", "bditu", "bdaw"],
    future=[
        "ghadi nbda",
        "ghadi tbda",
        "ghadi tbda",
        "ghadi ybda",
        "ghadi tbda",
        "ghadi nbdaw",
        "ghadi tbdaw",
        "ghadi ybdaw",
    ],
    negative=[
        "ma kanbdash",
        "ma katbdash",
        "ma katbdash",
        "ma kaybdash",
        "ma katbdash",
        "ma kanbdawsh",
        "ma katbdawsh",
        "ma kaybdawsh",
    ],
)

VERBS["kml"] = _make_verb(
    "kml",
    "كمل",
    "to finish",
    present=[
        "kankml",
        "katkml",
        "katkml",
        "kaykml",
        "katkml",
        "kankmlu",
        "katkmlu",
        "kaykmlu",
    ],
    past=["kmlt", "kmlti", "kmlti", "kml", "kmlat", "kmlna", "kmltu", "kmlu"],
    future=[
        "ghadi nkml",
        "ghadi tkml",
        "ghadi tkml",
        "ghadi ykml",
        "ghadi tkml",
        "ghadi nkmlu",
        "ghadi tkmlu",
        "ghadi ykmlu",
    ],
    negative=[
        "ma kankmlsh",
        "ma katkmlsh",
        "ma katkmlsh",
        "ma kaykmlsh",
        "ma katkmlsh",
        "ma kankmlush",
        "ma katkmlush",
        "ma kaykmlush",
    ],
)

# --- B2 verbs ---

VERBS["9rrr"] = _make_verb(
    "9rrr",
    "قرر",
    "to decide",
    present=[
        "kan9rrr",
        "kat9rrr",
        "kat9rrri",
        "kay9rrr",
        "kat9rrr",
        "kan9rrru",
        "kat9rrru",
        "kay9rrru",
    ],
    past=["9rrrt", "9rrriti", "9rrriti", "9rrr", "9rrrat", "9rrrna", "9rrrtu", "9rrru"],
    future=[
        "ghadi n9rrr",
        "ghadi t9rrr",
        "ghadi t9rrri",
        "ghadi y9rrr",
        "ghadi t9rrr",
        "ghadi n9rrru",
        "ghadi t9rrru",
        "ghadi y9rrru",
    ],
    negative=[
        "ma kan9rrrsh",
        "ma kat9rrrsh",
        "ma kat9rrrish",
        "ma kay9rrrsh",
        "ma kat9rrrsh",
        "ma kan9rrrush",
        "ma kat9rrrush",
        "ma kay9rrrush",
    ],
)

VERBS["gal"] = _make_verb(
    "gal",
    "قال",
    "to say",
    present=[
        "kangul",
        "katgul",
        "katguli",
        "kaygul",
        "katgul",
        "kangulu",
        "katgulu",
        "kaygulu",
    ],
    past=["glt", "glti", "glti", "gal", "galat", "glna", "gltu", "galu"],
    future=[
        "ghadi ngul",
        "ghadi tgul",
        "ghadi tguli",
        "ghadi ygul",
        "ghadi tgul",
        "ghadi ngulu",
        "ghadi tgulu",
        "ghadi ygulu",
    ],
    negative=[
        "ma kangulsh",
        "ma katgulsh",
        "ma katgulish",
        "ma kaygulsh",
        "ma katgulsh",
        "ma kangulush",
        "ma katgulush",
        "ma kaygulush",
    ],
)

VERBS["ktb"] = _make_verb(
    "ktb",
    "كتب",
    "to write",
    present=[
        "kanktb",
        "katktb",
        "katktbi",
        "kayktb",
        "katktb",
        "kanktbu",
        "katktbu",
        "kayktbu",
    ],
    past=["ktbt", "ktbti", "ktbti", "ktb", "ktbat", "ktbna", "ktbtu", "ktbu"],
    future=[
        "ghadi nktb",
        "ghadi tktb",
        "ghadi tktbi",
        "ghadi yktb",
        "ghadi tktb",
        "ghadi nktbu",
        "ghadi tktbu",
        "ghadi yktbu",
    ],
    negative=[
        "ma kanktbsh",
        "ma katktbsh",
        "ma katktbish",
        "ma kayktbsh",
        "ma katktbsh",
        "ma kanktbush",
        "ma katktbush",
        "ma kayktbush",
    ],
)

VERBS["d7k"] = _make_verb(
    "d7k",
    "ضحك",
    "to laugh",
    present=[
        "kand7k",
        "katd7k",
        "katd7ki",
        "kayd7k",
        "katd7k",
        "kand7ku",
        "katd7ku",
        "kayd7ku",
    ],
    past=["d7kt", "d7kti", "d7kti", "d7k", "d7kat", "d7kna", "d7ktu", "d7ku"],
    future=[
        "ghadi nd7k",
        "ghadi td7k",
        "ghadi td7ki",
        "ghadi yd7k",
        "ghadi td7k",
        "ghadi nd7ku",
        "ghadi td7ku",
        "ghadi yd7ku",
    ],
    negative=[
        "ma kand7ksh",
        "ma katd7ksh",
        "ma katd7kish",
        "ma kayd7ksh",
        "ma katd7ksh",
        "ma kand7kush",
        "ma katd7kush",
        "ma kayd7kush",
    ],
)

VERBS["shaf"] = _make_verb(
    "shaf",
    "شاف",
    "to see",
    present=[
        "kanshuf",
        "katshuf",
        "katshufi",
        "kayshuf",
        "katshuf",
        "kanshufu",
        "katshufu",
        "kayshufu",
    ],
    past=["shft", "shfti", "shfti", "shaf", "shafat", "shfna", "shftu", "shafu"],
    future=[
        "ghadi nshuf",
        "ghadi tshuf",
        "ghadi tshufi",
        "ghadi yshuf",
        "ghadi tshuf",
        "ghadi nshufu",
        "ghadi tshufu",
        "ghadi yshufu",
    ],
    negative=[
        "ma kanshufsh",
        "ma katshufsh",
        "ma katshufish",
        "ma kayshufsh",
        "ma katshufsh",
        "ma kanshufush",
        "ma katshufush",
        "ma kayshufush",
    ],
)

VERBS["tb3"] = _make_verb(
    "tb3",
    "تبع",
    "to follow",
    present=[
        "kantb3",
        "kattb3",
        "kattb3i",
        "kaytb3",
        "kattb3",
        "kantb3u",
        "kattb3u",
        "kaytb3u",
    ],
    past=["tb3t", "tb3ti", "tb3ti", "tb3", "tb3at", "tb3na", "tb3tu", "tb3u"],
    future=[
        "ghadi ntb3",
        "ghadi ttb3",
        "ghadi ttb3i",
        "ghadi ytb3",
        "ghadi ttb3",
        "ghadi ntb3u",
        "ghadi ttb3u",
        "ghadi ytb3u",
    ],
    negative=[
        "ma kantb3sh",
        "ma kattb3sh",
        "ma kattb3ish",
        "ma kaytb3sh",
        "ma kattb3sh",
        "ma kantb3ush",
        "ma kattb3ush",
        "ma kaytb3ush",
    ],
)

VERBS["dar"] = _make_verb(
    "dar",
    "دار",
    "to do/make",
    present=[
        "kandir",
        "katdir",
        "katdiri",
        "kaydir",
        "katdir",
        "kandiru",
        "katdiru",
        "kaydiru",
    ],
    past=["drt", "drti", "drti", "dar", "darat", "drna", "drtu", "daru"],
    future=[
        "ghadi ndir",
        "ghadi tdir",
        "ghadi tdiri",
        "ghadi ydir",
        "ghadi tdir",
        "ghadi ndiru",
        "ghadi tdiru",
        "ghadi ydiru",
    ],
    negative=[
        "ma kandirsh",
        "ma katdirsh",
        "ma katdirish",
        "ma kaydirsh",
        "ma katdirsh",
        "ma kandirush",
        "ma katdirush",
        "ma kaydirush",
    ],
)

VERBS["wajh"] = _make_verb(
    "wajh",
    "واجه",
    "to face/confront",
    present=[
        "kanwajh",
        "katwajh",
        "katwajhi",
        "kaywajh",
        "katwajh",
        "kanwajhu",
        "katwajhu",
        "kaywajhu",
    ],
    past=["wajht", "wajhti", "wajhti", "wajh", "wajhat", "wajhna", "wajhtu", "wajhu"],
    future=[
        "ghadi nwajh",
        "ghadi twajh",
        "ghadi twajhi",
        "ghadi ywajh",
        "ghadi twajh",
        "ghadi nwajhu",
        "ghadi twajhu",
        "ghadi ywajhu",
    ],
    negative=[
        "ma kanwajhsh",
        "ma katwajhsh",
        "ma katwajhish",
        "ma kaywajhsh",
        "ma katwajhsh",
        "ma kanwajhush",
        "ma katwajhush",
        "ma kaywajhush",
    ],
)

# =============================================================================
# Lesson → verb mapping
# Each entry: (module_file, lesson_index) → list of verb keys
# =============================================================================

LESSON_VERBS = {
    # A2 modules
    "a2/module_01_greetings.json": [
        ["hdr", "3rf"],  # L1: Basic Greetings
        ["swl", "ja"],  # L2: Introductions
        ["hdr", "fhm"],  # L3: Polite Expressions
    ],
    "a2/module_02_numbers.json": [
        ["7sb", "shri"],  # L1: Numbers 1-10
        ["ba3", "khllss"],  # L2: Numbers 11-100
        ["shri", "7sb"],  # L3: Using Numbers
    ],
    "a2/module_03_family.json": [
        ["7bb", "sken"],  # L1: Immediate Family
        ["3rf", "hdr"],  # L2: Extended Family
        ["dar", "7bb"],  # L3: Family Activities
    ],
    "a2/module_04_food.json": [
        ["kla", "shrb"],  # L1: Basic Foods
        ["tiyb", "shri"],  # L2: Cooking & Meals
        ["bgha", "kla"],  # L3: Ordering Food
    ],
    "a2/module_05_directions.json": [
        ["msha", "wsl"],  # L1: Basic Directions
        ["sir", "khrj"],  # L2: Getting Around
        ["msha", "shaf"],  # L3: Asking for Directions
    ],
    "a2/module_06_shopping.json": [
        ["shri", "ba3"],  # L1: At the Market
        ["khllss", "bgha"],  # L2: Prices & Bargaining
        ["shri", "dar"],  # L3: Shopping Dialogue
    ],
    "a2/module_07_daily.json": [
        ["fa9", "n3s"],  # L1: Morning Routine
        ["khdm", "kla"],  # L2: Afternoon Activities
        ["msha", "rta7"],  # L3: Evening & Weekends
    ],
    "a2/module_08_conversation.json": [
        ["hdr", "fhm"],  # L1: Starting Conversations
        ["swl", "ja"],  # L2: Making Plans
        ["3rf", "bgha"],  # L3: Expressing Preferences
    ],
    # B1 modules
    "b1/module_01_opinions.json": [
        ["dnn", "fkkr"],  # L1: Expressing Opinions
        ["9bl", "fhm"],  # L2: Agreeing & Disagreeing
        ["bgha", "fddl"],  # L3: Debating
    ],
    "b1/module_02_storytelling.json": [
        ["7ka", "w93"],  # L1: Telling Stories
        ["t3llm", "shaf"],  # L2: Past Events
        ["dar", "ja"],  # L3: Narrating Experiences
    ],
    "b1/module_03_travel.json": [
        ["safr", "7jz"],  # L1: Planning a Trip
        ["wsl", "msha"],  # L2: At the Airport
        ["zar", "shaf"],  # L3: Exploring a City
    ],
    "b1/module_04_health.json": [
        ["mrd", "rta7"],  # L1: Feeling Unwell
        ["bra", "msha"],  # L2: At the Doctor
        ["kla", "shrb"],  # L3: Healthy Habits
    ],
    "b1/module_05_work.json": [
        ["khdm", "9ra"],  # L1: Jobs & Careers
        ["nj7", "bda"],  # L2: Work Life
        ["dar", "kml"],  # L3: Professional Skills
    ],
    "b1/module_06_culture.json": [
        ["3rf", "t3llm"],  # L1: Moroccan Traditions
        ["zar", "shaf"],  # L2: Festivals & Events
        ["dar", "hdr"],  # L3: Cultural Exchange
    ],
    "b1/module_07_comparisons.json": [
        ["fddl", "khtar"],  # L1: Making Comparisons
        ["bgha", "shaf"],  # L2: Preferences
        ["fkkr", "9bl"],  # L3: Evaluating Options
    ],
    "b1/module_08_future.json": [
        ["tmna", "bda"],  # L1: Talking About the Future
        ["kml", "nj7"],  # L2: Goals & Plans
        ["bgha", "dar"],  # L3: Dreams & Aspirations
    ],
    # B2 modules
    "b2/module_01_abstract.json": [
        ["fkkr", "9rrr", "wajh"],  # L1: Abstract Concepts
        ["gal", "fhm", "dnn"],  # L2: Debating Ideas
        ["dar", "t3llm", "3rf"],  # L3: Complex Arguments
    ],
    "b2/module_02_idioms.json": [
        ["gal", "3rf", "dar"],  # L1: Common Idioms
        ["fhm", "shaf", "hdr"],  # L2: Proverbs
        ["dar", "bgha", "9bl"],  # L3: Idiomatic Expressions
    ],
    "b2/module_03_register.json": [
        ["hdr", "ktb", "9ra"],  # L1: Formal vs Informal
        ["gal", "fhm", "3rf"],  # L2: Professional Register
        ["hdr", "dar", "swl"],  # L3: Code Switching
    ],
    "b2/module_04_humor.json": [
        ["d7k", "fhm", "gal"],  # L1: Moroccan Humor
        ["shaf", "hdr", "dar"],  # L2: Jokes & Wordplay
        ["3rf", "bgha", "d7k"],  # L3: Sarcasm & Wit
    ],
    "b2/module_05_media.json": [
        ["tb3", "ktb", "9ra"],  # L1: News & Media
        ["shaf", "fhm", "hdr"],  # L2: Social Media
        ["dar", "gal", "3rf"],  # L3: Media Analysis
    ],
    "b2/module_06_advanced_convo.json": [
        ["hdr", "fhm", "gal"],  # L1: Advanced Discussion
        ["dar", "fkkr", "9rrr"],  # L2: Nuanced Expression
        ["3rf", "t3llm", "bgha"],  # L3: Mastery Conversation
    ],
}


def get_verb_for_lesson(verb_key, level):
    """Get a verb entry with tenses appropriate for the level."""
    verb = VERBS[verb_key].copy()

    if level == "a2":
        # Only present + past
        verb.pop("future", None)
        verb.pop("negative", None)
    elif level == "b1":
        # Present + past + future
        verb.pop("negative", None)
    # b2 gets all tenses

    return verb


def process_module(module_path, verb_lists):
    """Add conjugation data to each lesson in a module JSON file."""
    with open(module_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    level = data.get("level", "a2")
    lessons = data.get("lessons", [])

    for i, lesson in enumerate(lessons):
        if i >= len(verb_lists):
            break

        verb_keys = verb_lists[i]
        conjugation = []
        for vk in verb_keys:
            if vk in VERBS:
                conjugation.append(get_verb_for_lesson(vk, level))
            else:
                print(f"  WARNING: verb '{vk}' not found in database")

        lesson["conjugation"] = conjugation

    with open(module_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return len(lessons)


def main():
    total_lessons = 0
    total_modules = 0

    for rel_path, verb_lists in LESSON_VERBS.items():
        module_path = CURRICULUM_DIR / rel_path
        if not module_path.exists():
            print(f"SKIP: {rel_path} (file not found)")
            continue

        print(f"Processing {rel_path}...")
        n = process_module(module_path, verb_lists)
        total_lessons += n
        total_modules += 1
        print(f"  Added conjugation to {n} lessons")

    print(f"\nDone! Processed {total_modules} modules, {total_lessons} lessons.")


if __name__ == "__main__":
    main()
