"""
app/ashtakvarga_engine.py
-------------------------
Classical Vedic Ashtakvarga computation system according to
Brihat Parashara Hora Shastra (BPHS).

Computes:
1. Bhinnashtakvarga (BAV): 8x12 Bindu points contribution matrix for each of the 7 planets.
2. Sarvashtakvarga (SAV): Aggregated 12-house and 12-sign benefic strength profile.
"""
from __future__ import annotations

from typing import Any, Dict, List

PLANETS_7 = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
REFERENCES_8 = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Lagna"]

SIGN_NAMES = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

# Classical BPHS Benefic House Placements (1-indexed house distances)
BPHS_BAV_RULES: Dict[str, Dict[str, List[int]]] = {
    "Sun": {
        "Sun":     [1, 2, 4, 7, 8, 9, 10, 11],
        "Moon":    [3, 6, 10, 11],
        "Mars":    [1, 2, 4, 7, 8, 9, 10, 11],
        "Mercury": [3, 5, 6, 9, 10, 11, 12],
        "Jupiter": [5, 6, 9, 11],
        "Venus":   [6, 7, 12],
        "Saturn":  [1, 2, 4, 7, 8, 9, 10, 11],
        "Lagna":   [3, 4, 6, 10, 11, 12],
    },
    "Moon": {
        "Sun":     [3, 6, 7, 8, 10, 11],
        "Moon":    [1, 3, 6, 7, 10, 11],
        "Mars":    [2, 3, 5, 6, 9, 10, 11],
        "Mercury": [1, 3, 4, 5, 7, 8, 10, 11],
        "Jupiter": [1, 2, 4, 7, 8, 10, 11],
        "Venus":   [3, 4, 5, 7, 9, 10, 11],
        "Saturn":  [3, 5, 6, 11],
        "Lagna":   [3, 6, 10, 11],
    },
    "Mars": {
        "Sun":     [3, 5, 6, 10, 11],
        "Moon":    [3, 6, 11],
        "Mars":    [1, 2, 4, 7, 8, 10, 11],
        "Mercury": [3, 5, 6, 11],
        "Jupiter": [6, 10, 11, 12],
        "Venus":   [6, 8, 11, 12],
        "Saturn":  [1, 4, 7, 8, 9, 10, 11],
        "Lagna":   [1, 3, 6, 10, 11],
    },
    "Mercury": {
        "Sun":     [5, 6, 9, 11, 12],
        "Moon":    [2, 4, 6, 8, 10, 11],
        "Mars":    [1, 2, 4, 7, 8, 9, 10, 11],
        "Mercury": [1, 3, 5, 6, 9, 10, 11, 12],
        "Jupiter": [6, 8, 11, 12],
        "Venus":   [1, 2, 3, 4, 5, 8, 9, 11],
        "Saturn":  [1, 2, 4, 7, 8, 9, 10, 11],
        "Lagna":   [1, 2, 4, 6, 8, 10, 11],
    },
    "Jupiter": {
        "Sun":     [1, 2, 3, 4, 7, 8, 9, 10, 11],
        "Moon":    [2, 5, 7, 9, 11],
        "Mars":    [1, 2, 4, 7, 8, 10, 11],
        "Mercury": [1, 2, 4, 5, 6, 9, 10, 11],
        "Jupiter": [1, 2, 3, 4, 7, 8, 10, 11],
        "Venus":   [2, 5, 6, 9, 10, 11],
        "Saturn":  [3, 5, 6, 12],
        "Lagna":   [1, 2, 4, 5, 6, 7, 9, 10, 11],
    },
    "Venus": {
        "Sun":     [8, 11, 12],
        "Moon":    [1, 2, 3, 4, 5, 8, 9, 11, 12],
        "Mars":    [3, 4, 6, 9, 11, 12],
        "Mercury": [3, 5, 6, 9, 11],
        "Jupiter": [5, 8, 9, 10, 11],
        "Venus":   [1, 2, 3, 4, 5, 8, 9, 10, 11],
        "Saturn":  [3, 4, 5, 8, 9, 10, 11],
        "Lagna":   [1, 2, 3, 4, 5, 8, 9, 11],
    },
    "Saturn": {
        "Sun":     [1, 2, 4, 7, 8, 10, 11],
        "Moon":    [3, 5, 6, 11],
        "Mars":    [3, 5, 6, 10, 11, 12],
        "Mercury": [6, 8, 9, 10, 11, 12],
        "Jupiter": [5, 6, 11, 12],
        "Venus":   [6, 11, 12],
        "Saturn":  [3, 5, 6, 11],
        "Lagna":   [1, 3, 4, 6, 10, 11],
    },
}


class AshtakvargaEngine:
    """Calculates Sarvashtakvarga (SAV) and Bhinnashtakvarga (BAV)."""

    @classmethod
    def calculate_full(cls, technical_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates all 7 Bhinnashtakvargas (BAVs) and the Sarvashtakvarga (SAV).
        """
        planets = technical_profile.get("planets", {})
        lagna_sign_idx = technical_profile.get("lagna_sign_index", 0)

        # Get the sign indices (0-11) for all 8 reference points
        ref_positions: Dict[str, int] = {
            p: planets[p]["sign_index"] for p in PLANETS_7 if p in planets
        }
        ref_positions["Lagna"] = lagna_sign_idx

        bav_result: Dict[str, Dict[str, Any]] = {}
        # sav_by_sign: array of 12 integers for signs 0 (Aries) to 11 (Pisces)
        sav_by_sign = [0] * 12

        for target_planet in PLANETS_7:
            rules = BPHS_BAV_RULES.get(target_planet, {})
            planet_matrix: Dict[str, List[int]] = {}
            planet_sign_totals = [0] * 12

            for ref_name in REFERENCES_8:
                ref_sign = ref_positions.get(ref_name, 0)
                benefic_houses = rules.get(ref_name, [])
                row = [0] * 12

                for house_dist in benefic_houses:
                    # target sign = (ref_sign + house_dist - 1) % 12
                    target_sign = (ref_sign + house_dist - 1) % 12
                    row[target_sign] = 1

                planet_matrix[ref_name] = row
                for s in range(12):
                    planet_sign_totals[s] += row[s]

            for s in range(12):
                sav_by_sign[s] += planet_sign_totals[s]

            bav_result[target_planet] = {
                "matrix": planet_matrix,
                "sign_totals": planet_sign_totals,
                "total_bindus": sum(planet_sign_totals),
            }

        # Calculate SAV by house (House 1 = Lagna sign, House 2 = Lagna+1, etc.)
        sav_by_house = [sav_by_sign[(lagna_sign_idx + h) % 12] for h in range(12)]

        return {
            "sav_by_sign": sav_by_sign,
            "sav_by_house": sav_by_house,
            "sav_total": sum(sav_by_sign),
            "bav": bav_result,
            "sign_names": SIGN_NAMES,
        }

    @classmethod
    def calculate_sav(cls, technical_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Lightweight SAV computation for the default Kundali report.
        """
        full_res = cls.calculate_full(technical_profile)
        return {
            "sav_by_sign": full_res["sav_by_sign"],
            "sav_by_house": full_res["sav_by_house"],
            "sav_total": full_res["sav_total"],
        }
