"""
app/yoga_engine.py
------------------
Classical Vedic Astrology Yoga & Dosha detection engine.
Analyzes planetary combinations, house lordships, kendra/trikona placements,
and aspects to identify both benefic yogas and malefic doshas.
"""
from __future__ import annotations

from typing import Any, Dict, List, Set

SIGN_LORDS = [
    "Mars",     # 0: Aries (Mesha)
    "Venus",    # 1: Taurus (Vrishabha)
    "Mercury",  # 2: Gemini (Mithuna)
    "Moon",     # 3: Cancer (Karka)
    "Sun",      # 4: Leo (Simha)
    "Mercury",  # 5: Virgo (Kanya)
    "Venus",    # 6: Libra (Tula)
    "Mars",     # 7: Scorpio (Vrishchika)
    "Jupiter",  # 8: Sagittarius (Dhanu)
    "Saturn",   # 9: Capricorn (Makara)
    "Saturn",   # 10: Aquarius (Kumbha)
    "Jupiter",  # 11: Pisces (Meena)
]

EXALTATION_SIGNS = {
    "Sun": 0,      # Aries
    "Moon": 1,     # Taurus
    "Mars": 9,     # Capricorn
    "Mercury": 5,  # Virgo
    "Jupiter": 3,  # Cancer
    "Venus": 11,   # Pisces
    "Saturn": 6,   # Libra
}

OWN_SIGNS = {
    "Sun": {4},
    "Moon": {3},
    "Mars": {0, 7},
    "Mercury": {2, 5},
    "Jupiter": {8, 11},
    "Venus": {1, 6},
    "Saturn": {9, 10},
}

KENDRA_HOUSES = {1, 4, 7, 10}
TRIKONA_HOUSES = {1, 5, 9}
UPACHAYA_HOUSES = {3, 6, 10, 11}
DUSTHANA_HOUSES = {6, 8, 12}
NATURAL_BENEFICS = {"Jupiter", "Venus", "Mercury", "Moon"}
NATURAL_MALEFICS = {"Saturn", "Mars", "Rahu", "Ketu", "Sun"}


class YogaEngine:
    """Detects classical benefic and malefic Yogas from a technical profile."""

    @classmethod
    def detect_yogas(cls, technical_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        planets = technical_profile.get("planets", {})
        if not planets or "Moon" not in planets or "Sun" not in planets:
            return []

        lagna_sign_idx = technical_profile.get("lagna_sign_index", 0)
        moon_sign_idx = planets["Moon"]["sign_index"]
        moon_house = planets["Moon"].get("house_from_lagna", 1)

        # Precompute lordships: house_lords[house_num] = planet_name
        house_lords = {
            h: SIGN_LORDS[(lagna_sign_idx + h - 1) % 12] for h in range(1, 13)
        }

        detected: List[Dict[str, Any]] = []

        # ------------------------------------------------------------------
        # 1. Gaja Kesari Yoga (Benefic)
        # Jupiter in Kendra (1, 4, 7, 10) from Moon
        # ------------------------------------------------------------------
        jup_sign = planets.get("Jupiter", {}).get("sign_index", 0)
        house_from_moon = ((jup_sign - moon_sign_idx) % 12) + 1
        if house_from_moon in KENDRA_HOUSES:
            detected.append({
                "name": "Gaja Kesari Yoga",
                "type": "benefic",
                "category": "Rajayoga",
                "planets_involved": ["Jupiter", "Moon"],
                "description": (
                    f"Jupiter is placed in House {house_from_moon} (Kendra) from the Moon. "
                    "Bestows wisdom, noble character, lasting reputation, and protective fortune."
                ),
                "is_present": True,
            })

        # ------------------------------------------------------------------
        # 2. Budhaditya Yoga (Benefic)
        # Sun and Mercury conjunct in the same sign
        # ------------------------------------------------------------------
        sun_sign = planets.get("Sun", {}).get("sign_index")
        merc_sign = planets.get("Mercury", {}).get("sign_index")
        if sun_sign is not None and merc_sign is not None and sun_sign == merc_sign:
            merc_house = planets["Mercury"].get("house_from_lagna", 1)
            detected.append({
                "name": "Budhaditya Yoga",
                "type": "benefic",
                "category": "Dhi/Intellect",
                "planets_involved": ["Sun", "Mercury"],
                "description": (
                    f"Sun and Mercury are conjunct in House {merc_house} ({planets['Sun']['sign'].split(' ')[0]}). "
                    "Bestows keen intelligence, analytical prowess, administrative capability, and eloquence."
                ),
                "is_present": True,
            })

        # ------------------------------------------------------------------
        # 3. Pancha Mahapurusha Yogas (Mars, Mercury, Jupiter, Venus, Saturn)
        # Exalted or Own Sign in a Kendra from Lagna
        # ------------------------------------------------------------------
        mahapurusha_defs = [
            ("Mars", "Ruchaka Yoga", "courage, commanding leadership, physical strength, and strategic acumen"),
            ("Mercury", "Bhadra Yoga", "exceptional intellect, scholarly achievement, commerce mastery, and wit"),
            ("Jupiter", "Hamsa Yoga", "spiritual wisdom, righteous conduct, benevolence, and widespread respect"),
            ("Venus", "Malavya Yoga", "artistic refinement, marital harmony, luxurious comforts, and charisma"),
            ("Saturn", "Shasha Yoga", "endurance, deep authority, mass appeal, organizational genius, and longevity"),
        ]

        for p_name, yoga_name, meaning in mahapurusha_defs:
            p_data = planets.get(p_name)
            if not p_data:
                continue
            p_sign = p_data.get("sign_index", 0)
            p_house = p_data.get("house_from_lagna", 0)

            is_exalted = p_sign == EXALTATION_SIGNS.get(p_name)
            is_own = p_sign in OWN_SIGNS.get(p_name, set())

            if (is_exalted or is_own) and p_house in KENDRA_HOUSES:
                status_str = "exalted" if is_exalted else "in its own sign"
                detected.append({
                    "name": yoga_name,
                    "type": "benefic",
                    "category": "Pancha Mahapurusha",
                    "planets_involved": [p_name],
                    "description": (
                        f"{p_name} is {status_str} in House {p_house} (Kendra). "
                        f"One of the five great royal combinations conferring {meaning}."
                    ),
                    "is_present": True,
                })

        # ------------------------------------------------------------------
        # 4. Chandra-Mangala Yoga (Benefic)
        # Moon and Mars conjunct
        # ------------------------------------------------------------------
        mars_sign = planets.get("Mars", {}).get("sign_index")
        if mars_sign is not None and mars_sign == moon_sign_idx:
            detected.append({
                "name": "Chandra-Mangala Yoga",
                "type": "benefic",
                "category": "Dhana",
                "planets_involved": ["Moon", "Mars"],
                "description": (
                    f"Moon and Mars are conjunct in House {moon_house}. "
                    "Empowers financial enterprise, resourcefulness, bold initiative, and commercial success."
                ),
                "is_present": True,
            })

        # ------------------------------------------------------------------
        # 5. Amala Yoga (Benefic)
        # Natural benefic in 10th house from Lagna or Moon
        # ------------------------------------------------------------------
        tenth_from_lagna_planets = [
            p for p in ["Jupiter", "Venus", "Mercury"]
            if planets.get(p, {}).get("house_from_lagna") == 10
        ]
        tenth_from_moon_planets = [
            p for p in ["Jupiter", "Venus", "Mercury"]
            if ((planets.get(p, {}).get("sign_index", 0) - moon_sign_idx) % 12) + 1 == 10
        ]
        if tenth_from_lagna_planets or tenth_from_moon_planets:
            benefics_found = list(set(tenth_from_lagna_planets + tenth_from_moon_planets))
            detected.append({
                "name": "Amala Yoga",
                "type": "benefic",
                "category": "Karma/Career",
                "planets_involved": benefics_found,
                "description": (
                    f"Natural benefic ({', '.join(benefics_found)}) occupies the 10th house of career/action. "
                    "Fosters spotless reputation, professional integrity, prosperity, and philanthropic deeds."
                ),
                "is_present": True,
            })

        # ------------------------------------------------------------------
        # 6. Kendra-Trikona Rajayoga (Benefic)
        # Conjunction of a Kendra lord (4, 7, 10) with a Trikona lord (5, 9)
        # ------------------------------------------------------------------
        kendra_lords = {house_lords[4], house_lords[7], house_lords[10]}
        trikona_lords = {house_lords[5], house_lords[9]}
        # Check pairs
        for kl in kendra_lords:
            for tl in trikona_lords:
                if kl != tl and kl in planets and tl in planets:
                    if planets[kl]["sign_index"] == planets[tl]["sign_index"]:
                        detected.append({
                            "name": f"Kendra-Trikona Raja Yoga ({kl}-{tl})",
                            "type": "benefic",
                            "category": "Rajayoga",
                            "planets_involved": [kl, tl],
                            "description": (
                                f"Lords of Kendra ({kl}) and Trikona ({tl}) are conjunct in House {planets[kl]['house_from_lagna']}. "
                                "Generates high authority, leadership opportunities, and socio-economic elevation."
                            ),
                            "is_present": True,
                        })
                        break

        # ------------------------------------------------------------------
        # 7. Kemadruma Yoga (Malefic)
        # No planets (excl. Sun, Rahu, Ketu) in 2nd or 12th from Moon
        # ------------------------------------------------------------------
        classical_planets = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
        h2_moon_has_planet = any(
            ((planets[p]["sign_index"] - moon_sign_idx) % 12) + 1 == 2
            for p in classical_planets if p in planets
        )
        h12_moon_has_planet = any(
            ((planets[p]["sign_index"] - moon_sign_idx) % 12) + 1 == 12
            for p in classical_planets if p in planets
        )
        if not h2_moon_has_planet and not h12_moon_has_planet:
            # Check for cancellation: planets in Kendra from Lagna or Moon
            kendra_planets = [
                p for p in ["Jupiter", "Venus", "Mercury"]
                if planets.get(p, {}).get("house_from_lagna") in KENDRA_HOUSES
            ]
            is_cancelled = len(kendra_planets) > 0
            detected.append({
                "name": "Kemadruma Yoga",
                "type": "malefic",
                "category": "Chandra",
                "planets_involved": ["Moon"],
                "description": (
                    "No physical planets occupy the 2nd or 12th houses from Moon. "
                    + (
                        f"However, presence of {', '.join(kendra_planets)} in Kendra provides significant cancellation (Kemadruma Bhanga)."
                        if is_cancelled
                        else "Indicates periods of emotional solitude and the necessity of building self-reliant financial buffers."
                    )
                ),
                "is_present": True,
                "is_cancelled": is_cancelled,
            })

        # ------------------------------------------------------------------
        # 8. Kaal Sarp Yoga (Malefic)
        # All 7 classical planets between Rahu and Ketu
        # ------------------------------------------------------------------
        if "Rahu" in planets and "Ketu" in planets:
            seven_planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
            rahu_lon = planets["Rahu"]["longitude"]
            ketu_lon = planets["Ketu"]["longitude"]

            def in_arc(lon: float, f: float, t: float) -> bool:
                norm = ((lon - f) + 360.0) % 360.0
                span = ((t - f) + 360.0) % 360.0
                return 0.0 < norm < span

            all_fwd = all(in_arc(planets[p]["longitude"], rahu_lon, ketu_lon) for p in seven_planets if p in planets)
            all_bwd = all(in_arc(planets[p]["longitude"], ketu_lon, rahu_lon) for p in seven_planets if p in planets)

            if all_fwd or all_bwd:
                rahu_house = planets["Rahu"].get("house_from_lagna", 1)
                ketu_house = planets["Ketu"].get("house_from_lagna", 7)
                detected.append({
                    "name": "Kaal Sarp Yoga",
                    "type": "malefic",
                    "category": "Karmic Axis",
                    "planets_involved": ["Rahu", "Ketu"],
                    "description": (
                        f"All classical planets are encompassed within the Rahu (H{rahu_house}) – Ketu (H{ketu_house}) axis. "
                        "Creates intense karmic cycles with early struggles leading to substantial perseverance and eventual breakthroughs."
                    ),
                    "is_present": True,
                })

        # ------------------------------------------------------------------
        # 9. Guru Chandal Yoga (Malefic)
        # Jupiter conjunct Rahu or Ketu
        # ------------------------------------------------------------------
        if "Jupiter" in planets:
            rahu_sign = planets.get("Rahu", {}).get("sign_index")
            ketu_sign = planets.get("Ketu", {}).get("sign_index")
            if jup_sign == rahu_sign:
                detected.append({
                    "name": "Guru Chandal Yoga (Rahu)",
                    "type": "malefic",
                    "category": "Graha Dosha",
                    "planets_involved": ["Jupiter", "Rahu"],
                    "description": (
                        f"Jupiter and Rahu are conjunct in House {planets['Jupiter']['house_from_lagna']}. "
                        "Encourages unconventional thinking, questioning of dogmas, and the need for ethical vigilance in career choices."
                    ),
                    "is_present": True,
                })
            elif jup_sign == ketu_sign:
                detected.append({
                    "name": "Guru Chandal Yoga (Ketu)",
                    "type": "malefic",
                    "category": "Graha Dosha",
                    "planets_involved": ["Jupiter", "Ketu"],
                    "description": (
                        f"Jupiter and Ketu are conjunct in House {planets['Jupiter']['house_from_lagna']}. "
                        "Deepens philosophical and mystical interests, though it may bring occasional disillusionment with conventional orthodoxy."
                    ),
                    "is_present": True,
                })

        # ------------------------------------------------------------------
        # 10. Pitra Dosha / Surya Grahan (Malefic)
        # Sun conjunct Rahu or Ketu or Sun in 9th house with malefics
        # ------------------------------------------------------------------
        if "Sun" in planets:
            rahu_sign = planets.get("Rahu", {}).get("sign_index")
            ketu_sign = planets.get("Ketu", {}).get("sign_index")
            sun_house = planets["Sun"].get("house_from_lagna", 1)

            if sun_sign == rahu_sign or sun_sign == ketu_sign:
                node = "Rahu" if sun_sign == rahu_sign else "Ketu"
                detected.append({
                    "name": f"Surya Grahan / Pitra Dosha ({node})",
                    "type": "malefic",
                    "category": "Graha Dosha",
                    "planets_involved": ["Sun", node],
                    "description": (
                        f"Sun and {node} are conjunct in House {sun_house}. "
                        "Indicates soul-level karmic lessons related to authority, father figures, and self-confidence."
                    ),
                    "is_present": True,
                })
            elif sun_house == 9 and any(planets.get(m, {}).get("house_from_lagna") == 9 for m in ["Saturn", "Mars"]):
                detected.append({
                    "name": "Pitra Dosha (9th House Affliction)",
                    "type": "malefic",
                    "category": "Graha Dosha",
                    "planets_involved": ["Sun", "9th House"],
                    "description": (
                        "Sun and malefic influences occupy the 9th house of Dharma and ancestors. "
                        "Suggests honoring ancestral lineage and cultivating righteous mentorship."
                    ),
                    "is_present": True,
                })

        return detected
