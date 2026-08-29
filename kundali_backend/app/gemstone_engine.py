"""
app/gemstone_engine.py
----------------------
Classical Vedic Astrology Gemstone & Rudraksha Recommendation Engine.
Analyzes functional benefic house lords (Lagna, 5th, 9th, 10th), evaluates
afflictions and Dusthana (6th, 8th, 12th) lordships, and generates personalized
gemstone recommendations with metal, finger, weight, and safety contraindications.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

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

GEMSTONE_CATALOG: Dict[str, Dict[str, Any]] = {
    "Sun": {
        "primary": "Ruby (Manik)",
        "substitute": "Red Spinel / Garnet",
        "color": "Deep Pinkish Red",
        "finger": "Ring finger",
        "hand": "Right hand (dominant)",
        "metal": "Gold or Copper",
        "carats": "3 - 5 Carats",
        "day": "Sunday morning during Shukla Paksha",
        "mantra": "Om Hram Hrim Hraum Sah Suryaya Namah (ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः)",
        "rudraksha": "1 Mukhi (Ek Mukhi) or 12 Mukhi Rudraksha",
    },
    "Moon": {
        "primary": "Pearl (Moti)",
        "substitute": "Moonstone",
        "color": "Milky White",
        "finger": "Little finger (or Ring finger)",
        "hand": "Right hand (dominant)",
        "metal": "Silver",
        "carats": "4 - 7 Carats",
        "day": "Monday evening or morning",
        "mantra": "Om Shram Shrim Shraum Sah Chandraya Namah (ॐ श्रां श्रीं श्रौं सः चन्द्राय नमः)",
        "rudraksha": "2 Mukhi (Do Mukhi) Rudraksha",
    },
    "Mars": {
        "primary": "Red Coral (Moonga)",
        "substitute": "Carnelian / Red Jasper",
        "color": "Bright Vermilion Orange-Red",
        "finger": "Ring finger",
        "hand": "Right hand (dominant)",
        "metal": "Gold, Copper, or Silver-Copper alloy",
        "carats": "6 - 9 Carats",
        "day": "Tuesday morning (Sunrise hour)",
        "mantra": "Om Kram Krim Kraum Sah Bhaumaya Namah (ॐ क्रां क्रीं क्रौं सः भौमाय नमः)",
        "rudraksha": "3 Mukhi (Teen Mukhi) Rudraksha",
    },
    "Mercury": {
        "primary": "Emerald (Panna)",
        "substitute": "Green Tourmaline / Peridot",
        "color": "Vibrant Grass Green",
        "finger": "Little finger",
        "hand": "Right hand (dominant)",
        "metal": "Gold, Silver, or Bronze",
        "carats": "3 - 6 Carats",
        "day": "Wednesday morning during waxing moon",
        "mantra": "Om Bram Brim Braum Sah Budhaya Namah (ॐ ब्रां ब्रीं प्रौं सः बुधाय नमः)",
        "rudraksha": "4 Mukhi (Char Mukhi) Rudraksha",
    },
    "Jupiter": {
        "primary": "Yellow Sapphire (Pukhraj)",
        "substitute": "Yellow Topaz / Heliodor / Citrine",
        "color": "Bright Lemon or Golden Yellow",
        "finger": "Index finger (Tarjani)",
        "hand": "Right hand (dominant)",
        "metal": "Yellow Gold or Brass",
        "carats": "3.5 - 5 Carats",
        "day": "Thursday morning during Brahma Muhurta",
        "mantra": "Om Gram Grim Graum Sah Gurave Namah (ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः)",
        "rudraksha": "5 Mukhi (Panch Mukhi) Rudraksha",
    },
    "Venus": {
        "primary": "Diamond (Heera)",
        "substitute": "White Zircon / White Sapphire / Opal",
        "color": "Colorless Transparent Sparkling",
        "finger": "Middle finger or Little finger",
        "hand": "Right hand (dominant)",
        "metal": "Platinum, White Gold, or Silver",
        "carats": "0.5 - 1.5 Carats (Diamond) / 4 - 6 Carats (White Sapphire/Opal)",
        "day": "Friday morning during Shukla Paksha",
        "mantra": "Om Dram Drim Draum Sah Shukraya Namah (ॐ द्रां द्रीं द्रौं सः शुक्राय नमः)",
        "rudraksha": "6 Mukhi (Chha Mukhi) Rudraksha",
    },
    "Saturn": {
        "primary": "Blue Sapphire (Neelam)",
        "substitute": "Amethyst / Iolite (Kaka Neeli)",
        "color": "Deep Royal Blue / Cornflower Blue",
        "finger": "Middle finger (Madhyama)",
        "hand": "Right hand (dominant)",
        "metal": "Panchdhatu, White Gold, or Silver",
        "carats": "4 - 7 Carats",
        "day": "Saturday evening (Sunset hour)",
        "mantra": "Om Pram Prim Praum Sah Shanaishcharaya Namah (ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः)",
        "rudraksha": "7 Mukhi (Saat Mukhi) or 14 Mukhi Rudraksha",
    },
    "Rahu": {
        "primary": "Hessonite Garnet (Gomed)",
        "substitute": "Orange Zircon",
        "color": "Honey-colored / Cinnamon Red",
        "finger": "Middle finger",
        "hand": "Right hand (dominant)",
        "metal": "Silver or Ashtadhatu",
        "carats": "5 - 8 Carats",
        "day": "Saturday night or Wednesday night",
        "mantra": "Om Bhram Bhrim Bhraum Sah Rahave Namah (ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः)",
        "rudraksha": "8 Mukhi (Aath Mukhi) Rudraksha",
    },
    "Ketu": {
        "primary": "Cat's Eye (Lehsunia / Vaidurya)",
        "substitute": "Tiger's Eye / Chrysoberyl",
        "color": "Yellowish-Green with Silver Silk Chatoyancy",
        "finger": "Little finger or Middle finger",
        "hand": "Right hand (dominant)",
        "metal": "Silver or Panchdhatu",
        "carats": "4 - 7 Carats",
        "day": "Tuesday or Thursday night",
        "mantra": "Om Stram Strim Straum Sah Ketave Namah (ॐ स्रां स्रीं स्रौं सः केतवे नमः)",
        "rudraksha": "9 Mukhi (Nau Mukhi) Rudraksha",
    },
}

# Incompatible planetary gemstone pairs per classical texts
INCOMPATIBLE_PAIRS = [
    ({"Sun", "Mars", "Jupiter", "Moon"}, {"Venus", "Saturn", "Rahu", "Ketu"}),
]


class GemstoneEngine:
    """Computes personalized Gemstone & Rudraksha recommendations."""

    @classmethod
    def recommend(cls, technical_profile: Dict[str, Any]) -> Dict[str, Any]:
        lagna_sign_idx = technical_profile.get("lagna_sign_index", 0)
        planets = technical_profile.get("planets", {})

        # Compute house lords from Lagna (1-indexed house 1 to 12)
        house_lords = {
            h: SIGN_LORDS[(lagna_sign_idx + h - 1) % 12] for h in range(1, 13)
        }

        # Find dusthana (6, 8, 12) lords
        dusthana_lords = {house_lords[6], house_lords[8], house_lords[12]}
        lagna_lord = house_lords[1]

        # Key functional benefic roles
        roles = [
            {
                "category": "Life Stone (Lagna Ratna)",
                "purpose": "Health, Immunity, Vitality, Charisma & Self-Confidence",
                "house": 1,
                "planet": lagna_lord,
                "importance": "High (Primary Core Stone)",
            },
            {
                "category": "Fortune Stone (Bhagya Ratna)",
                "purpose": "Destiny Support, Divine Grace, Dharma & Prosperity",
                "house": 9,
                "planet": house_lords[9],
                "importance": "High (Auspicious Trikona Lord)",
            },
            {
                "category": "Intellect Stone (Vidya Ratna)",
                "purpose": "Intellect, Focus, Creative Expression & Academic Success",
                "house": 5,
                "planet": house_lords[5],
                "importance": "Medium-High (5th Trikona Lord)",
            },
            {
                "category": "Career Stone (Karma Ratna)",
                "purpose": "Professional Status, Career Elevation & Societal Leadership",
                "house": 10,
                "planet": house_lords[10],
                "importance": "Medium (10th Kendra Lord)",
            },
        ]

        recommendations = []
        for role in roles:
            planet = role["planet"]
            gem_info = GEMSTONE_CATALOG.get(planet, {})
            if not gem_info:
                continue

            planet_placement = planets.get(planet, {})
            planet_house = planet_placement.get("house_from_lagna", 1)
            planet_dignity = planet_placement.get("dignity", "Neutral")
            is_retrograde = planet_placement.get("retrograde", False)

            # Safety evaluation
            contraindications: List[str] = []
            is_safe = True

            # Lagna lord is always safe, but others lord of 6/8/12 need caution
            if planet != lagna_lord and planet in dusthana_lords:
                contraindications.append(
                    f"{planet} also rules a Dusthana house (House 6, 8, or 12). Wear only after expert consultation."
                )
                is_safe = False

            if planet_dignity == "Debilitated":
                contraindications.append(
                    f"{planet} is debilitated (Neecha). A substitute gemstone or Rudraksha is recommended over primary stone."
                )

            recommendations.append({
                "category": role["category"],
                "purpose": role["purpose"],
                "house": role["house"],
                "importance": role["importance"],
                "ruling_planet": planet,
                "planet_placement": f"House {planet_house} ({planet_dignity}{', Retrograde ℞' if is_retrograde else ''})",
                "primary_gemstone": gem_info["primary"],
                "substitute_gemstone": gem_info["substitute"],
                "color": gem_info["color"],
                "finger": gem_info["finger"],
                "metal": gem_info["metal"],
                "carats": gem_info["carats"],
                "day_time": gem_info["day"],
                "mantra": gem_info["mantra"],
                "rudraksha": gem_info["rudraksha"],
                "is_safe": is_safe,
                "contraindications": contraindications,
            })

        # General safety guidelines
        general_safety = [
            "Never wear Pearl/Ruby together with Blue Sapphire or Diamond without astrological neutralization.",
            "Always test sensitive stones like Blue Sapphire (Neelam) or Hessonite (Gomed) for 3 days under pillow before permanent mounting.",
            "Ensure gemstones have direct skin contact on the inner side of the ring or pendant.",
            "Cleanse and energize (Prana Pratishtha) with milk, Ganga jal, and the planetary mantra before initial wearing.",
        ]

        return {
            "lagna_lord": lagna_lord,
            "recommendations": recommendations,
            "general_safety": general_safety,
        }
