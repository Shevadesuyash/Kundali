"""
app/ashtakoot.py
-----------------
Module D: Ashtakoot Guna Milan (36-point compatibility scoring).

Implements all 8 kootas: Varna(1), Vashya(2), Tara(3), Yoni(4),
Graha Maitri(5), Gana(6), Bhakoot(7), Nadi(8).

Also implements Rajju Koota as a supplementary (non-scoring) check
per classical tradition.

ACCURACY NOTE
-------------
Classical Vedic texts (Muhurta Chintamani, BPHS, Vivah Patal) are the
primary references for every table and cancellation rule below.  Where
regional variations exist the mainstream / most-commonly-published
version is used and clearly documented.  For high-stakes marriage
decisions this output should be cross-checked by a professional
astrologer.

CHANGELOG (accuracy upgrade)
-----------------------------
- Bhakoot: removed 5/9 (Pancham-Navami) from dosha set — it is a
  trine (auspicious), NOT a Dosha per BPHS / Muhurta Chintamani.
- Bhakoot: added Parihara for same Rashi-lord or mutual-friend lords.
- Nadi: added Parihara for same Nakshatra+different Pada, and for
  same Moon Rashi (per Muhurta Chintamani Ch. 23).
- Gana: added Parihara when both partners share the same Moon Rashi.
- Yoni: added Mitra (friendly) pair tier — scores 3 pts, not 2.
- Tara: added named warnings for Janma(1), Vipat(3), Pratyak(5),
  Naidhana(7) Taras without altering the numeric score.
- Rajju Koota added as supplementary calc_rajju() method.
"""
from __future__ import annotations

from typing import Dict, List, Optional, Tuple

# ---------------------------------------------------------------------------
# 1. VARNA (1 point) – social/ego temperament, based on Moon Rashi
#    Brahmin(4) > Kshatriya(3) > Vaishya(2) > Shudra(1)
# ---------------------------------------------------------------------------
VARNA_MAP = {
    0: 3, 1: 2, 2: 1, 3: 4, 4: 3, 5: 2,     # Aries..Virgo
    6: 1, 7: 4, 8: 3, 9: 2, 10: 1, 11: 4,   # Libra..Pisces
}
VARNA_NAMES = {1: "Shudra", 2: "Vaishya", 3: "Kshatriya", 4: "Brahmin"}

# ---------------------------------------------------------------------------
# 2. VASHYA (2 points) – mutual attraction / control, based on Moon Rashi
#    grouped into 5 categories.
# ---------------------------------------------------------------------------
VASHYA_GROUP = {
    0: "Chatushpad", 1: "Chatushpad", 2: "Manav",      3: "Jalchar",
    4: "Vanchar",    5: "Manav",      6: "Manav",       7: "Keeda",
    8: "Manav",      9: "Chatushpad", 10: "Manav",      11: "Jalchar",
}

# ---------------------------------------------------------------------------
# 3. TARA (3 points) – health/well-being, based on nakshatra counting
#    9-Tara cycle: 1=Janma 2=Sampat 3=Vipat 4=Kshema 5=Pratyak
#                  6=Sadhana 7=Naidhana 8=Mitra 9=Parama-Mitra
# ---------------------------------------------------------------------------
GOOD_TARA_REMAINDERS = {2, 4, 6, 8, 9}   # Sampat, Kshema, Sadhana, Mitra, Parama-Mitra
TARA_NAMES = {
    1: "Janma",  2: "Sampat", 3: "Vipat",    4: "Kshema",
    5: "Pratyak", 6: "Sadhana", 7: "Naidhana", 8: "Mitra", 9: "Parama-Mitra",
}
# Taras that carry a classical warning
TARA_WARNINGS = {1: "Janma Tara", 3: "Vipat Tara", 5: "Pratyak Tara", 7: "Naidhana Tara"}

# ---------------------------------------------------------------------------
# 4. YONI (4 points) – biological/temperamental compatibility
#    27 nakshatras -> (animal, gender M/F)
# ---------------------------------------------------------------------------
YONI_MAP: List[Tuple[str, str]] = [
    ("Horse",    "M"), ("Elephant", "M"), ("Sheep",    "F"), ("Serpent",  "M"),
    ("Serpent",  "F"), ("Dog",      "F"), ("Cat",      "F"), ("Sheep",    "M"),
    ("Cat",      "M"), ("Rat",      "M"), ("Rat",      "F"), ("Cow",      "M"),
    ("Buffalo",  "F"), ("Tiger",    "F"), ("Buffalo",  "M"), ("Tiger",    "M"),
    ("Deer",     "F"), ("Deer",     "M"), ("Dog",      "M"), ("Monkey",   "F"),
    ("Mongoose", "M"), ("Monkey",   "M"), ("Lion",     "F"), ("Horse",    "F"),
    ("Lion",     "M"), ("Cow",      "F"), ("Elephant", "F"),
]

# Classical "Shatru" (enemy) Yoni pairs — score 0
YONI_ENEMY_PAIRS = {
    frozenset({"Cow",      "Tiger"}),
    frozenset({"Horse",    "Buffalo"}),
    frozenset({"Dog",      "Deer"}),
    frozenset({"Serpent",  "Mongoose"}),
    frozenset({"Rat",      "Cat"}),
    frozenset({"Sheep",    "Monkey"}),
    frozenset({"Elephant", "Lion"}),
}

# Classical "Mitra" (friendly) Yoni pairs — score 3 (same as same-animal/opp-gender)
# Per Vivah Patal and multiple Muhurta references
YONI_MITRA_PAIRS = {
    frozenset({"Horse",   "Deer"}),
    frozenset({"Elephant","Cow"}),
    frozenset({"Dog",     "Lion"}),
    frozenset({"Buffalo", "Tiger"}),   # contextual friendship in several texts
    frozenset({"Cat",     "Rat"}),     # context-dependent; listed as Mitra in Vivah Patal
}

# ---------------------------------------------------------------------------
# 5. GRAHA MAITRI (5 points) – friendship between the planetary lords
#    of the two Moon signs (Naisargika / natural friendship table)
# ---------------------------------------------------------------------------
FRIENDSHIP_TABLE = {
    "Sun":     {"friends": {"Moon", "Mars", "Jupiter"}, "enemies": {"Venus", "Saturn"}},
    "Moon":    {"friends": {"Sun", "Mercury"},           "enemies": set()},
    "Mars":    {"friends": {"Sun", "Moon", "Jupiter"},   "enemies": {"Mercury"}},
    "Mercury": {"friends": {"Sun", "Venus"},             "enemies": {"Moon"}},
    "Jupiter": {"friends": {"Sun", "Moon", "Mars"},      "enemies": {"Mercury", "Venus"}},
    "Venus":   {"friends": {"Mercury", "Saturn"},        "enemies": {"Sun", "Moon"}},
    "Saturn":  {"friends": {"Mercury", "Venus"},         "enemies": {"Sun", "Moon", "Mars"}},
}

# ---------------------------------------------------------------------------
# 6. GANA (6 points) – temperament, based on nakshatra
#    Deva(0)=divine, Manushya(1)=human, Rakshasa(2)=demonic
# ---------------------------------------------------------------------------
GANA_MAP = [
    0, 2, 1, 0, 1, 2, 0, 0, 2, 2, 1, 1,
    1, 1, 0, 2, 0, 2, 2, 1, 0, 0, 2, 2, 0, 1, 0,
]
GANA_NAMES = {0: "Deva", 1: "Manushya", 2: "Rakshasa"}

# ---------------------------------------------------------------------------
# 7. BHAKOOT (7 points) – Moon-sign distance
#    True Doshas (per BPHS & Muhurta Chintamani):
#      6/8 = Shadashtak, 2/12 = Dwiteeya-Dwadasha
#    NOTE: 5/9 (Pancham-Navami) is a TRINE, NOT a Dosha — removed.
# ---------------------------------------------------------------------------
BHAKOOT_DOSHA_COUNTS = {2, 12, 6, 8}   # Only the classical two pairs

# ---------------------------------------------------------------------------
# 8. NADI (8 points) – genetic/health compatibility, based on nakshatra
#    Aadi(0)/Vata, Madhya(1)/Pitta, Antya(2)/Kapha
# ---------------------------------------------------------------------------
NADI_MAP = [
    0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0,
    0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2,
]
NADI_NAMES = {0: "Aadi (Vata)", 1: "Madhya (Pitta)", 2: "Antya (Kapha)"}

# ---------------------------------------------------------------------------
# RAJJU KOOTA (supplementary, non-scoring) – per Muhurta Chintamani
#    If both partners share the same Rajju, it is inauspicious.
#    5 Rajju categories + Mishra (mixed) for unassigned Nakshatras:
#      Siro(head), Kantha(neck), Udara(stomach), Kati(waist), Pada(feet)
# ---------------------------------------------------------------------------
# Index = Nakshatra index 0..26 -> Rajju name
RAJJU_MAP: List[str] = [
    "Pada",    # 0  Ashwini
    "Kati",    # 1  Bharani
    "Udara",   # 2  Krittika
    "Kantha",  # 3  Rohini
    "Siro",    # 4  Mrigashira
    "Kati",    # 5  Ardra
    "Kati",    # 6  Punarvasu
    "Kantha",  # 7  Pushya
    "Siro",    # 8  Ashlesha
    "Pada",    # 9  Magha
    "Udara",   # 10 Purva Phalguni
    "Udara",   # 11 Uttara Phalguni
    "Kantha",  # 12 Hasta
    "Siro",    # 13 Chitra
    "Kati",    # 14 Swati
    "Udara",   # 15 Vishakha
    "Kantha",  # 16 Anuradha
    "Siro",    # 17 Jyeshtha
    "Pada",    # 18 Mula
    "Kati",    # 19 Purva Ashadha
    "Udara",   # 20 Uttara Ashadha
    "Kantha",  # 21 Shravana
    "Siro",    # 22 Dhanishtha
    "Pada",    # 23 Shatabhisha
    "Kati",    # 24 Purva Bhadrapada
    "Kati",    # 25 Uttara Bhadrapada
    "Pada",    # 26 Revati
]

# ---------------------------------------------------------------------------
# Internal helper
# ---------------------------------------------------------------------------
def _planet_relation(from_planet: str, to_planet: str) -> str:
    """Return 'friends', 'enemies', or 'neutral' per the Naisargika table."""
    if to_planet in FRIENDSHIP_TABLE[from_planet]["friends"]:
        return "friends"
    if to_planet in FRIENDSHIP_TABLE[from_planet]["enemies"]:
        return "enemies"
    return "neutral"


class AshtakootCalculator:
    """Computes the 8-koota, 36-point Guna Milan compatibility score."""

    # ---- 1. Varna --------------------------------------------------------
    def calc_varna(self, boy_rashi: int, girl_rashi: int) -> Dict:
        b, g = VARNA_MAP[boy_rashi], VARNA_MAP[girl_rashi]
        score = 1.0 if b >= g else 0.0
        return {
            "koota": "Varna", "max": 1.0, "score": score,
            "detail": f"Boy: {VARNA_NAMES[b]}, Girl: {VARNA_NAMES[g]}",
            "parihara": None,
        }

    # ---- 2. Vashya -------------------------------------------------------
    def calc_vashya(self, boy_rashi: int, girl_rashi: int) -> Dict:
        bg, gg = VASHYA_GROUP[boy_rashi], VASHYA_GROUP[girl_rashi]
        if bg == gg:
            score = 2.0
        elif "Vanchar" in (bg, gg) and bg != gg:
            score = 0.0
        else:
            one_pt_pairs = {
                frozenset({"Chatushpad", "Manav"}),
                frozenset({"Jalchar",    "Chatushpad"}),
                frozenset({"Vanchar",    "Manav"}),
            }
            score = 1.0 if frozenset({bg, gg}) in one_pt_pairs else 0.5
        return {
            "koota": "Vashya", "max": 2.0, "score": score,
            "detail": f"Boy: {bg}, Girl: {gg}",
            "parihara": None,
        }

    # ---- 3. Tara ---------------------------------------------------------
    def calc_tara(self, boy_nak: int, girl_nak: int) -> Dict:
        warnings: List[str] = []

        def _tara_remainder(src: int, dst: int) -> int:
            count = ((dst - src) % 27) + 1
            return count % 9 or 9

        def _tara_half_score(src: int, dst: int) -> float:
            rem = _tara_remainder(src, dst)
            if rem in TARA_WARNINGS:
                warnings.append(
                    f"{'Boy->Girl' if src == boy_nak else 'Girl->Boy'}: "
                    f"{TARA_WARNINGS[rem]} (position {rem})"
                )
            return 1.5 if rem in GOOD_TARA_REMAINDERS else 0.0

        score = _tara_half_score(boy_nak, girl_nak) + _tara_half_score(girl_nak, boy_nak)
        return {
            "koota": "Tara", "max": 3.0, "score": score,
            "detail": "Bidirectional nakshatra counting (Boy->Girl, Girl->Boy)",
            "tara_warnings": warnings if warnings else None,
            "parihara": None,
        }

    # ---- 4. Yoni ---------------------------------------------------------
    def calc_yoni(self, boy_nak: int, girl_nak: int) -> Dict:
        b_animal, b_gender = YONI_MAP[boy_nak]
        g_animal, g_gender = YONI_MAP[girl_nak]
        pair = frozenset({b_animal, g_animal})

        if b_animal == g_animal and b_gender == g_gender:
            score = 4.0          # Sama Yoni — identical
        elif b_animal == g_animal:
            score = 3.0          # Sama Yoni — opposite gender
        elif pair in YONI_ENEMY_PAIRS:
            score = 0.0          # Shatru Yoni
        elif pair in YONI_MITRA_PAIRS:
            score = 3.0          # Mitra Yoni — friendly pair (Vivah Patal)
        else:
            score = 2.0          # Neutral

        return {
            "koota": "Yoni", "max": 4.0, "score": score,
            "detail": f"Boy: {b_animal}({b_gender}), Girl: {g_animal}({g_gender})",
            "parihara": None,
        }

    # ---- 5. Graha Maitri -------------------------------------------------
    def calc_graha_maitri(self, boy_lord: str, girl_lord: str) -> Dict:
        if boy_lord == girl_lord:
            score = 5.0
        else:
            b_rel = _planet_relation(boy_lord, girl_lord)
            g_rel = _planet_relation(girl_lord, boy_lord)
            matrix = {
                frozenset({"friends"}):            5.0,
                frozenset({"friends", "neutral"}): 4.0,
                frozenset({"neutral"}):            3.0,
                frozenset({"friends", "enemies"}): 1.0,
                frozenset({"neutral", "enemies"}): 0.5,
                frozenset({"enemies"}):            0.0,
            }
            score = matrix[frozenset({b_rel, g_rel})]
        return {
            "koota": "Graha Maitri", "max": 5.0, "score": score,
            "detail": f"Boy Moon lord: {boy_lord}, Girl Moon lord: {girl_lord}",
            "parihara": None,
        }

    # ---- 6. Gana ---------------------------------------------------------
    def calc_gana(
        self,
        boy_nak: int,
        girl_nak: int,
        boy_rashi: Optional[int] = None,
        girl_rashi: Optional[int] = None,
    ) -> Dict:
        b, g = GANA_MAP[boy_nak], GANA_MAP[girl_nak]
        parihara: Optional[str] = None

        if b == g:
            score = 6.0
        elif {b, g} == {0, 1}:      # Deva–Manushya
            score = 6.0 if b == 0 else 5.0
        elif {b, g} == {0, 2}:      # Deva–Rakshasa
            score = 1.0
        elif {b, g} == {1, 2}:      # Manushya–Rakshasa (Gana Dosha)
            # Parihara: same Moon Rashi cancels the Dosha (Muhurta Chintamani)
            if boy_rashi is not None and girl_rashi is not None and boy_rashi == girl_rashi:
                score = 6.0
                parihara = "Gana Dosha cancelled: both partners share the same Moon Rashi"
            else:
                score = 0.0
        else:
            score = 0.0

        return {
            "koota": "Gana", "max": 6.0, "score": score,
            "detail": f"Boy: {GANA_NAMES[b]}, Girl: {GANA_NAMES[g]}",
            "parihara": parihara,
        }

    # ---- 7. Bhakoot ------------------------------------------------------
    def calc_bhakoot(
        self,
        boy_rashi: int,
        girl_rashi: int,
        boy_lord: Optional[str] = None,
        girl_lord: Optional[str] = None,
    ) -> Dict:
        count_bg = ((girl_rashi - boy_rashi) % 12) + 1
        count_gb = ((boy_rashi - girl_rashi) % 12) + 1
        has_dosha = count_bg in BHAKOOT_DOSHA_COUNTS or count_gb in BHAKOOT_DOSHA_COUNTS

        parihara: Optional[str] = None
        if has_dosha and boy_lord and girl_lord:
            # Cancellation 1: same Rashi lord (e.g., Aries + Scorpio, both Mars)
            if boy_lord == girl_lord:
                has_dosha = False
                parihara = (
                    f"Bhakoot Dosha cancelled: both Moon signs share the same "
                    f"planetary lord ({boy_lord})"
                )
            else:
                # Cancellation 2: mutual friends
                b_rel = _planet_relation(boy_lord, girl_lord)
                g_rel = _planet_relation(girl_lord, boy_lord)
                if b_rel == "friends" and g_rel == "friends":
                    has_dosha = False
                    parihara = (
                        f"Bhakoot Dosha cancelled: Rashi lords {boy_lord} and "
                        f"{girl_lord} are mutual friends"
                    )

        score = 0.0 if has_dosha else 7.0
        detail = (
            f"Rashi distance Boy->Girl: {count_bg}, Girl->Boy: {count_gb}"
            + (" (Dosha present)" if has_dosha else "")
        )
        return {
            "koota": "Bhakoot", "max": 7.0, "score": score,
            "detail": detail,
            "parihara": parihara,
        }

    # ---- 8. Nadi ---------------------------------------------------------
    def calc_nadi(
        self,
        boy_nak: int,
        girl_nak: int,
        boy_pada: Optional[int] = None,
        girl_pada: Optional[int] = None,
        boy_rashi: Optional[int] = None,
        girl_rashi: Optional[int] = None,
    ) -> Dict:
        b, g = NADI_MAP[boy_nak], NADI_MAP[girl_nak]
        has_dosha = b == g
        parihara: Optional[str] = None

        if has_dosha:
            # Parihara 1: same Nakshatra but different Pada
            # (Muhurta Chintamani: same Nakshatra = same birth star; diff Pada negates)
            if boy_pada is not None and girl_pada is not None:
                if boy_nak == girl_nak and boy_pada != girl_pada:
                    has_dosha = False
                    parihara = (
                        f"Nadi Dosha cancelled: both born in the same Nakshatra "
                        f"but different Padas (Boy Pada {boy_pada}, Girl Pada {girl_pada})"
                    )

            # Parihara 2: same Moon Rashi (even with different Nakshatras)
            if has_dosha and boy_rashi is not None and girl_rashi is not None:
                if boy_rashi == girl_rashi:
                    has_dosha = False
                    parihara = (
                        "Nadi Dosha cancelled: both partners share the same Moon Rashi "
                        "(per Muhurta Chintamani)"
                    )

        score = 0.0 if has_dosha else 8.0
        detail = (
            f"Boy: {NADI_NAMES[b]}, Girl: {NADI_NAMES[g]}"
            + (" (Nadi Dosha present)" if (b == g and has_dosha) else "")
        )
        return {
            "koota": "Nadi", "max": 8.0, "score": score,
            "detail": detail,
            "parihara": parihara,
        }

    # ---- Supplementary: Rajju Koota --------------------------------------
    def calc_rajju(self, boy_nak: int, girl_nak: int) -> Dict:
        """
        Rajju Koota — supplementary check, NOT part of the 36-point score.
        Per Muhurta Chintamani: if both partners fall in the same Rajju,
        the match is inauspicious for the husband's longevity.
        """
        b_rajju = RAJJU_MAP[boy_nak]
        g_rajju = RAJJU_MAP[girl_nak]
        dosha = b_rajju == g_rajju
        return {
            "koota": "Rajju",
            "boy_rajju": b_rajju,
            "girl_rajju": g_rajju,
            "rajju_dosha": dosha,
            "detail": (
                f"Boy: {b_rajju}, Girl: {g_rajju}"
                + (" — Rajju Dosha present (same Rajju; inauspicious per Muhurta Chintamani)"
                   if dosha else " — Compatible (different Rajju)")
            ),
            "note": (
                "Rajju is a supplementary check outside the 36-point system. "
                "Many traditionalists reject a match on Rajju Dosha alone regardless "
                "of the Guna score."
            ),
        }

    # ---- Main aggregator -------------------------------------------------
    def calculate_guna_milan(self, boy_astro: Dict, girl_astro: Dict) -> Dict:
        """
        boy_astro / girl_astro expected keys:
            rashi_index       : int  (0-11)
            nakshatra_index   : int  (0-26)
            rashi_lord        : str  (planet name)
            nakshatra_pada    : int  (1-4)   — optional but required for full Nadi Parihara
        """
        b_rashi  = boy_astro["rashi_index"]
        g_rashi  = girl_astro["rashi_index"]
        b_nak    = boy_astro["nakshatra_index"]
        g_nak    = girl_astro["nakshatra_index"]
        b_lord   = boy_astro["rashi_lord"]
        g_lord   = girl_astro["rashi_lord"]
        b_pada   = boy_astro.get("nakshatra_pada")
        g_pada   = girl_astro.get("nakshatra_pada")

        kootas = [
            self.calc_varna(b_rashi, g_rashi),
            self.calc_vashya(b_rashi, g_rashi),
            self.calc_tara(b_nak, g_nak),
            self.calc_yoni(b_nak, g_nak),
            self.calc_graha_maitri(b_lord, g_lord),
            self.calc_gana(b_nak, g_nak, b_rashi, g_rashi),
            self.calc_bhakoot(b_rashi, g_rashi, b_lord, g_lord),
            self.calc_nadi(b_nak, g_nak, b_pada, g_pada, b_rashi, g_rashi),
        ]

        total_score = round(sum(k["score"] for k in kootas), 1)
        total_max   = sum(k["max"] for k in kootas)   # always 36

        if total_score >= 28:
            verdict = "Excellent Match"
        elif total_score >= 21:
            verdict = "Good / Compatible Match"
        elif total_score >= 18:
            verdict = "Average Match - Proceed with Caution"
        else:
            verdict = "Not Recommended - Low Compatibility"

        nadi_koota    = kootas[7]
        bhakoot_koota = kootas[6]
        nadi_dosha    = nadi_koota["score"] == 0.0 and nadi_koota["parihara"] is None
        bhakoot_dosha = bhakoot_koota["score"] == 0.0

        if nadi_dosha:
            verdict += " (Nadi Dosha present — consult an astrologer for Parihara)"

        rajju = self.calc_rajju(b_nak, g_nak)

        return {
            "kootas":        kootas,
            "total_score":   total_score,
            "total_max":     total_max,
            "verdict":       verdict,
            "nadi_dosha":    nadi_dosha,
            "bhakoot_dosha": bhakoot_dosha,
            "rajju":         rajju,
        }
