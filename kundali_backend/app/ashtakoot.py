"""
app/ashtakoot.py
-----------------
Module D: Ashtakoot Guna Milan (36-point compatibility scoring).

Implements all 8 kootas: Varna(1), Vashya(2), Tara(3), Yoni(4),
Graha Maitri(5), Gana(6), Bhakoot(7), Nadi(8).

IMPORTANT ACCURACY NOTE
------------------------
Classical Vedic texts (Muhurta Chintamani, etc.) have some regional
variation for Vashya and Yoni sub-rules (e.g. mid-sign splits for
Sagittarius/Capricorn in Vashya, and the full Mitra/friend matrix for
Yoni). This implementation uses the single most commonly published
version of each table (the version used by most mainstream Kundali
software) and documents every table inline. For high-stakes marriage
decisions this output should be cross-checked by a professional
astrologer, and the code should be treated as a strong reference
implementation rather than an infallible source of classical truth.
"""
from __future__ import annotations

from typing import Dict, List, Tuple

# ---------------------------------------------------------------------------
# 1. VARNA (1 point) - social/ego temperament, based on Moon Rashi
#    Brahmin(4) > Kshatriya(3) > Vaishya(2) > Shudra(1)
# ---------------------------------------------------------------------------
VARNA_MAP = {
    0: 3, 1: 2, 2: 1, 3: 4, 4: 3, 5: 2,     # Aries..Virgo
    6: 1, 7: 4, 8: 3, 9: 2, 10: 1, 11: 4,   # Libra..Pisces
}
VARNA_NAMES = {1: "Shudra", 2: "Vaishya", 3: "Kshatriya", 4: "Brahmin"}

# ---------------------------------------------------------------------------
# 2. VASHYA (2 points) - mutual attraction / control, based on Moon Rashi
#    grouped into 5 categories.
# ---------------------------------------------------------------------------
VASHYA_GROUP = {
    0: "Chatushpad", 1: "Chatushpad", 2: "Manav", 3: "Jalchar", 4: "Vanchar",
    5: "Manav", 6: "Manav", 7: "Keeda", 8: "Manav", 9: "Chatushpad",
    10: "Manav", 11: "Jalchar",
}

# ---------------------------------------------------------------------------
# 3. TARA (3 points) - health/well-being, based on nakshatra counting
# ---------------------------------------------------------------------------
GOOD_TARA_REMAINDERS = {2, 4, 6, 8, 9}  # Sampat, Kshema, Sadhana, Mitra, Parama-Mitra

# ---------------------------------------------------------------------------
# 4. YONI (4 points) - biological/temperamental compatibility
#    27 nakshatras -> (animal, gender M/F)
# ---------------------------------------------------------------------------
YONI_MAP: List[Tuple[str, str]] = [
    ("Horse", "M"), ("Elephant", "M"), ("Sheep", "F"), ("Serpent", "M"),
    ("Serpent", "F"), ("Dog", "F"), ("Cat", "F"), ("Sheep", "M"),
    ("Cat", "M"), ("Rat", "M"), ("Rat", "F"), ("Cow", "M"),
    ("Buffalo", "F"), ("Tiger", "F"), ("Buffalo", "M"), ("Tiger", "M"),
    ("Deer", "F"), ("Deer", "M"), ("Dog", "M"), ("Monkey", "F"),
    ("Mongoose", "M"), ("Monkey", "M"), ("Lion", "F"), ("Horse", "F"),
    ("Lion", "M"), ("Cow", "F"), ("Elephant", "F"),
]

# Classical "Shatru" (enemy) yoni pairs (symmetric)
YONI_ENEMY_PAIRS = {
    frozenset({"Cow", "Tiger"}),
    frozenset({"Horse", "Buffalo"}),
    frozenset({"Dog", "Deer"}),
    frozenset({"Serpent", "Mongoose"}),
    frozenset({"Rat", "Cat"}),
    frozenset({"Sheep", "Monkey"}),
    frozenset({"Elephant", "Lion"}),
}

# ---------------------------------------------------------------------------
# 5. GRAHA MAITRI (5 points) - friendship between the planetary lords
#    of the two Moon signs (Naisargika/natural friendship table)
# ---------------------------------------------------------------------------
FRIENDSHIP_TABLE = {
    "Sun":     {"friends": {"Moon", "Mars", "Jupiter"}, "enemies": {"Venus", "Saturn"}},
    "Moon":    {"friends": {"Sun", "Mercury"}, "enemies": set()},
    "Mars":    {"friends": {"Sun", "Moon", "Jupiter"}, "enemies": {"Mercury"}},
    "Mercury": {"friends": {"Sun", "Venus"}, "enemies": {"Moon"}},
    "Jupiter": {"friends": {"Sun", "Moon", "Mars"}, "enemies": {"Mercury", "Venus"}},
    "Venus":   {"friends": {"Mercury", "Saturn"}, "enemies": {"Sun", "Moon"}},
    "Saturn":  {"friends": {"Mercury", "Venus"}, "enemies": {"Sun", "Moon", "Mars"}},
}

# ---------------------------------------------------------------------------
# 6. GANA (6 points) - temperament, based on nakshatra
#    Deva(0)=divine, Manushya(1)=human, Rakshasa(2)=demonic
# ---------------------------------------------------------------------------
GANA_MAP = [
    0, 2, 1, 0, 1, 2, 0, 0, 2, 2, 1, 1,
    1, 1, 0, 2, 0, 2, 2, 1, 0, 0, 2, 2, 0, 1, 0,
]
GANA_NAMES = {0: "Deva", 1: "Manushya", 2: "Rakshasa"}

# ---------------------------------------------------------------------------
# 8. NADI (8 points) - genetic/health compatibility, based on nakshatra
#    Aadi(0)/Vata, Madhya(1)/Pitta, Antya(2)/Kapha
# ---------------------------------------------------------------------------
NADI_MAP = [
    0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0,
    0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2,
]
NADI_NAMES = {0: "Aadi (Vata)", 1: "Madhya (Pitta)", 2: "Antya (Kapha)"}


class AshtakootCalculator:
    """Computes the 8-koota, 36-point Guna Milan compatibility score."""

    # ---- 1. Varna --------------------------------------------------------
    def calc_varna(self, boy_rashi: int, girl_rashi: int) -> Dict:
        b, g = VARNA_MAP[boy_rashi], VARNA_MAP[girl_rashi]
        score = 1.0 if b >= g else 0.0
        return {"koota": "Varna", "max": 1.0, "score": score,
                "detail": f"Boy: {VARNA_NAMES[b]}, Girl: {VARNA_NAMES[g]}"}

    # ---- 2. Vashya ---------------------------------------------------------
    def calc_vashya(self, boy_rashi: int, girl_rashi: int) -> Dict:
        bg, gg = VASHYA_GROUP[boy_rashi], VASHYA_GROUP[girl_rashi]
        if bg == gg:
            score = 2.0
        elif "Vanchar" in (bg, gg) and bg != gg:
            score = 0.0
        else:
            one_pt_pairs = {
                frozenset({"Chatushpad", "Manav"}),
                frozenset({"Jalchar", "Chatushpad"}),
                frozenset({"Vanchar", "Manav"}),
            }
            score = 1.0 if frozenset({bg, gg}) in one_pt_pairs else 0.5
        return {"koota": "Vashya", "max": 2.0, "score": score,
                "detail": f"Boy: {bg}, Girl: {gg}"}

    # ---- 3. Tara -----------------------------------------------------------
    def calc_tara(self, boy_nak: int, girl_nak: int) -> Dict:
        def tara_score(src: int, dst: int) -> float:
            count = ((dst - src) % 27) + 1
            remainder = count % 9 or 9
            return 1.5 if remainder in GOOD_TARA_REMAINDERS else 0.0

        score = tara_score(boy_nak, girl_nak) + tara_score(girl_nak, boy_nak)
        return {"koota": "Tara", "max": 3.0, "score": score,
                "detail": "Bidirectional nakshatra counting (Boy->Girl, Girl->Boy)"}

    # ---- 4. Yoni -----------------------------------------------------------
    def calc_yoni(self, boy_nak: int, girl_nak: int) -> Dict:
        b_animal, b_gender = YONI_MAP[boy_nak]
        g_animal, g_gender = YONI_MAP[girl_nak]
        if b_animal == g_animal and b_gender == g_gender:
            score = 4.0
        elif b_animal == g_animal:
            score = 3.0
        elif frozenset({b_animal, g_animal}) in YONI_ENEMY_PAIRS:
            score = 0.0
        else:
            score = 2.0
        return {"koota": "Yoni", "max": 4.0, "score": score,
                "detail": f"Boy: {b_animal}({b_gender}), Girl: {g_animal}({g_gender})"}

    # ---- 5. Graha Maitri -----------------------------------------------------
    def calc_graha_maitri(self, boy_lord: str, girl_lord: str) -> Dict:
        if boy_lord == girl_lord:
            score = 5.0
        else:
            b_rel = ("friends" if girl_lord in FRIENDSHIP_TABLE[boy_lord]["friends"]
                      else "enemies" if girl_lord in FRIENDSHIP_TABLE[boy_lord]["enemies"]
                      else "neutral")
            g_rel = ("friends" if boy_lord in FRIENDSHIP_TABLE[girl_lord]["friends"]
                      else "enemies" if boy_lord in FRIENDSHIP_TABLE[girl_lord]["enemies"]
                      else "neutral")
            matrix = {
                frozenset({"friends"}): 5.0,
                frozenset({"friends", "neutral"}): 4.0,
                frozenset({"neutral"}): 3.0,
                frozenset({"friends", "enemies"}): 1.0,
                frozenset({"neutral", "enemies"}): 0.5,
                frozenset({"enemies"}): 0.0,
            }
            score = matrix[frozenset({b_rel, g_rel})]
        return {"koota": "Graha Maitri", "max": 5.0, "score": score,
                "detail": f"Boy Moon lord: {boy_lord}, Girl Moon lord: {girl_lord}"}

    # ---- 6. Gana -----------------------------------------------------------
    def calc_gana(self, boy_nak: int, girl_nak: int) -> Dict:
        b, g = GANA_MAP[boy_nak], GANA_MAP[girl_nak]
        if b == g:
            score = 6.0
        elif {b, g} == {0, 1}:      # Deva-Manushya
            score = 6.0 if b == 0 else 5.0
        elif {b, g} == {0, 2}:      # Deva-Rakshasa
            score = 1.0
        elif {b, g} == {1, 2}:      # Manushya-Rakshasa
            score = 0.0
        else:
            score = 0.0
        return {"koota": "Gana", "max": 6.0, "score": score,
                "detail": f"Boy: {GANA_NAMES[b]}, Girl: {GANA_NAMES[g]}"}

    # ---- 7. Bhakoot --------------------------------------------------------
    def calc_bhakoot(self, boy_rashi: int, girl_rashi: int) -> Dict:
        count_bg = ((girl_rashi - boy_rashi) % 12) + 1
        count_gb = ((boy_rashi - girl_rashi) % 12) + 1
        dosha_counts = {2, 12, 5, 9, 6, 8}
        has_dosha = count_bg in dosha_counts or count_gb in dosha_counts
        score = 0.0 if has_dosha else 7.0
        return {"koota": "Bhakoot", "max": 7.0, "score": score,
                "detail": f"Rashi distance Boy->Girl: {count_bg}, Girl->Boy: {count_gb}"
                          + (" (Dosha present)" if has_dosha else "")}

    # ---- 8. Nadi -----------------------------------------------------------
    def calc_nadi(self, boy_nak: int, girl_nak: int) -> Dict:
        b, g = NADI_MAP[boy_nak], NADI_MAP[girl_nak]
        score = 8.0 if b != g else 0.0
        return {"koota": "Nadi", "max": 8.0, "score": score,
                "detail": f"Boy: {NADI_NAMES[b]}, Girl: {NADI_NAMES[g]}"
                          + (" (Nadi Dosha present)" if score == 0.0 else "")}

    # -------------------------------------------------------------------
    def calculate_guna_milan(self, boy_astro: Dict, girl_astro: Dict) -> Dict:
        """
        boy_astro / girl_astro expected keys:
            rashi_index, nakshatra_index, rashi_lord
        """
        b_rashi, g_rashi = boy_astro["rashi_index"], girl_astro["rashi_index"]
        b_nak, g_nak = boy_astro["nakshatra_index"], girl_astro["nakshatra_index"]
        b_lord, g_lord = boy_astro["rashi_lord"], girl_astro["rashi_lord"]

        kootas = [
            self.calc_varna(b_rashi, g_rashi),
            self.calc_vashya(b_rashi, g_rashi),
            self.calc_tara(b_nak, g_nak),
            self.calc_yoni(b_nak, g_nak),
            self.calc_graha_maitri(b_lord, g_lord),
            self.calc_gana(b_nak, g_nak),
            self.calc_bhakoot(b_rashi, g_rashi),
            self.calc_nadi(b_nak, g_nak),
        ]
        total_score = round(sum(k["score"] for k in kootas), 1)
        total_max = sum(k["max"] for k in kootas)  # always 36

        if total_score >= 28:
            verdict = "Excellent Match"
        elif total_score >= 21:
            verdict = "Good / Compatible Match"
        elif total_score >= 18:
            verdict = "Average Match - Proceed with Caution"
        else:
            verdict = "Not Recommended - Low Compatibility"

        nadi_dosha = kootas[7]["score"] == 0.0
        bhakoot_dosha = kootas[6]["score"] == 0.0

        if nadi_dosha:
            verdict += " (Nadi Dosha present - consult an astrologer for cancellation rules)"

        return {
            "kootas": kootas,
            "total_score": total_score,
            "total_max": total_max,
            "verdict": verdict,
            "nadi_dosha": nadi_dosha,
            "bhakoot_dosha": bhakoot_dosha,
        }
