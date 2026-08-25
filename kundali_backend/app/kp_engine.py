"""
app/kp_engine.py
----------------
Krishnamurti Paddhati (KP System) Astrological Engine.
Computes:
1. Placidus Unequal House Cusps (Bhavas)
2. Sign Lord (Rasi Lord), Star Lord (Nakshatra Lord), Sub Lord, and Sub-Sub Lord
   for all 12 House Cusps and all 9 Planets using Vimshottari proportions.
3. 4-Fold House Significators
4. Ruling Planets (RP) at Chart / Calculation Time
"""
from __future__ import annotations

from typing import Any, Dict, List, Tuple
import swisseph as swe

SIGN_NAMES = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

SIGN_LORDS = [
    "Mars", "Venus", "Mercury", "Moon",
    "Sun", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Saturn", "Jupiter",
]

NAKSHATRA_NAMES = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

# 27 Nakshatras Star Lords in Vimshottari order (repeats 3 times)
VIMSHOTTARI_PLANETS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
VIMSHOTTARI_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10,
    "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17,
}
TOTAL_VIMSHOTTARI_YEARS = 120.0
NAKSHATRA_SPAN_DEG = 360.0 / 27.0  # 13.333333333333334° (13°20')

STAR_LORDS = [VIMSHOTTARI_PLANETS[i % 9] for i in range(27)]

PLANET_IDS: Dict[str, int] = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mars": swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus": swe.VENUS,
    "Saturn": swe.SATURN,
    "Rahu": swe.TRUE_NODE,
}


def _deg_to_dms(deg_in_sign: float) -> str:
    d = int(deg_in_sign)
    m_f = (deg_in_sign - d) * 60.0
    m = int(m_f)
    s = int((m_f - m) * 60.0)
    return f"{d:02d}°{m:02d}'{s:02d}\""


class KPEngine:
    """Computes KP Placidus cusps, Sub Lords, and Significators."""

    @classmethod
    def get_sub_lord(cls, longitude: float) -> Tuple[str, str, str, str]:
        """
        Calculates (Sign Lord, Star Lord, Sub Lord, Sub-Sub Lord) for any sidereal longitude.
        """
        lon = longitude % 360.0
        sign_idx = int(lon // 30.0)
        sign_lord = SIGN_LORDS[sign_idx]

        nak_idx = int(lon // NAKSHATRA_SPAN_DEG)
        star_lord = STAR_LORDS[nak_idx]
        deg_in_nak = lon % NAKSHATRA_SPAN_DEG  # 0 to 13.3333333°

        # Sub Lord calculation
        # Sub divisions start with the Star Lord of the Nakshatra
        start_planet_idx = VIMSHOTTARI_PLANETS.index(star_lord)
        accum_span = 0.0
        sub_lord = star_lord
        sub_span = 0.0
        sub_start = 0.0

        for i in range(9):
            p = VIMSHOTTARI_PLANETS[(start_planet_idx + i) % 9]
            span = (VIMSHOTTARI_YEARS[p] / TOTAL_VIMSHOTTARI_YEARS) * NAKSHATRA_SPAN_DEG
            if accum_span + span >= deg_in_nak or i == 8:
                sub_lord = p
                sub_span = span
                sub_start = accum_span
                break
            accum_span += span

        # Sub-Sub Lord calculation within sub span
        deg_in_sub = deg_in_nak - sub_start
        sub_start_planet_idx = VIMSHOTTARI_PLANETS.index(sub_lord)
        accum_sub_sub = 0.0
        sub_sub_lord = sub_lord

        for j in range(9):
            p_ss = VIMSHOTTARI_PLANETS[(sub_start_planet_idx + j) % 9]
            span_ss = (VIMSHOTTARI_YEARS[p_ss] / TOTAL_VIMSHOTTARI_YEARS) * sub_span
            if accum_sub_sub + span_ss >= deg_in_sub or j == 8:
                sub_sub_lord = p_ss
                break
            accum_sub_sub += span_ss

        return sign_lord, star_lord, sub_lord, sub_sub_lord

    @classmethod
    def calculate_kp(
        cls,
        jd: float,
        lat: float,
        lon: float,
    ) -> Dict[str, Any]:
        """
        Computes complete KP System data:
        - 12 Placidus Cusps with Sign, Sign Lord, Star Lord, Sub Lord, Sub-Sub Lord
        - 9 Planets with KP Lordship and Placidus House Occupancy
        - 4-Fold Significators
        - Ruling Planets
        """
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        flags = swe.FLG_SIDEREAL | swe.FLG_SPEED

        # 1. Placidus Cusps (using swe.houses_ex with 'P' for Placidus)
        # cusps is a 12-element tuple corresponding to houses 1..12
        cusps, ascmc = swe.houses_ex(jd, lat, lon, b'P', flags)
        cusp_longitudes = [c % 360.0 for c in cusps]

        cusp_rows = []
        for i, c_lon in enumerate(cusp_longitudes):
            house_num = i + 1
            sign_idx = int(c_lon // 30.0)
            sign_lord, star_lord, sub_lord, sub_sub_lord = cls.get_sub_lord(c_lon)
            nak_idx = int(c_lon // NAKSHATRA_SPAN_DEG)

            cusp_rows.append({
                "house": house_num,
                "longitude": round(c_lon, 4),
                "degree_str": _deg_to_dms(c_lon % 30.0),
                "sign": SIGN_NAMES[sign_idx],
                "sign_index": sign_idx,
                "sign_lord": sign_lord,
                "nakshatra": NAKSHATRA_NAMES[nak_idx],
                "star_lord": star_lord,
                "sub_lord": sub_lord,
                "sub_sub_lord": sub_sub_lord,
            })

        # 2. Planetary Placements
        planet_rows = []
        planet_house_map: Dict[str, int] = {}

        for p_name, p_id in PLANET_IDS.items():
            res, _ = swe.calc_ut(jd, p_id, flags)
            p_lon = res[0] % 360.0
            p_speed = res[3]
            sign_idx = int(p_lon // 30.0)
            nak_idx = int(p_lon // NAKSHATRA_SPAN_DEG)
            sign_lord, star_lord, sub_lord, sub_sub_lord = cls.get_sub_lord(p_lon)

            # Determine Placidus house occupancy
            # In KP, a planet is in House H if it lies between Cusp H and Cusp H+1
            assigned_house = 1
            for h_idx in range(12):
                c_start = cusp_longitudes[h_idx]
                c_end = cusp_longitudes[(h_idx + 1) % 12]
                # Circular arc check from c_start to c_end
                span = (c_end - c_start + 360.0) % 360.0
                rel_pos = (p_lon - c_start + 360.0) % 360.0
                if 0.0 <= rel_pos < span:
                    assigned_house = h_idx + 1
                    break

            planet_house_map[p_name] = assigned_house

            planet_rows.append({
                "planet": p_name,
                "longitude": round(p_lon, 4),
                "degree_str": _deg_to_dms(p_lon % 30.0),
                "sign": SIGN_NAMES[sign_idx],
                "sign_lord": sign_lord,
                "nakshatra": NAKSHATRA_NAMES[nak_idx],
                "star_lord": star_lord,
                "sub_lord": sub_lord,
                "sub_sub_lord": sub_sub_lord,
                "house": assigned_house,
                "is_retrograde": p_speed < 0,
            })

        # Ketu (opposite Rahu)
        rahu_row = next(p for p in planet_rows if p["planet"] == "Rahu")
        ketu_lon = (rahu_row["longitude"] + 180.0) % 360.0
        ketu_sign_idx = int(ketu_lon // 30.0)
        k_sl, k_stl, k_sub, k_subsub = cls.get_sub_lord(ketu_lon)
        k_nak_idx = int(ketu_lon // NAKSHATRA_SPAN_DEG)

        k_house = 1
        for h_idx in range(12):
            c_start = cusp_longitudes[h_idx]
            c_end = cusp_longitudes[(h_idx + 1) % 12]
            span = (c_end - c_start + 360.0) % 360.0
            rel_pos = (ketu_lon - c_start + 360.0) % 360.0
            if 0.0 <= rel_pos < span:
                k_house = h_idx + 1
                break

        planet_house_map["Ketu"] = k_house
        planet_rows.append({
            "planet": "Ketu",
            "longitude": round(ketu_lon, 4),
            "degree_str": _deg_to_dms(ketu_lon % 30.0),
            "sign": SIGN_NAMES[ketu_sign_idx],
            "sign_lord": k_sl,
            "nakshatra": NAKSHATRA_NAMES[k_nak_idx],
            "star_lord": k_stl,
            "sub_lord": k_sub,
            "sub_sub_lord": k_subsub,
            "house": k_house,
            "is_retrograde": True,
        })

        # 3. Ruling Planets (RP)
        # Moon and Ascendant
        asc_lon = cusp_longitudes[0]
        moon_row = next(p for p in planet_rows if p["planet"] == "Moon")
        moon_lon = moon_row["longitude"]

        asc_sign_lord, asc_star_lord, asc_sub_lord, _ = cls.get_sub_lord(asc_lon)
        moon_sign_lord, moon_star_lord, moon_sub_lord, _ = cls.get_sub_lord(moon_lon)

        ruling_planets = {
            "lagna_sign_lord": asc_sign_lord,
            "lagna_star_lord": asc_star_lord,
            "lagna_sub_lord": asc_sub_lord,
            "moon_sign_lord": moon_sign_lord,
            "moon_star_lord": moon_star_lord,
            "moon_sub_lord": moon_sub_lord,
        }

        # 4. 4-Fold House Significators
        # Level 1 (Strongest): Planet in the Star of a Planet occupying the house
        # Level 2: Planet occupying the house itself
        # Level 3: Planet in the Star of the Lord of the house
        # Level 4: Lord of the house
        significators = []
        for h in range(1, 13):
            house_row = cusp_rows[h - 1]
            h_lord = house_row["sign_lord"]
            occupants = [p["planet"] for p in planet_rows if p["house"] == h]

            # Level 1: Planets in the star of occupants
            lvl1 = [p["planet"] for p in planet_rows if p["star_lord"] in occupants]
            # Level 2: Occupants
            lvl2 = occupants
            # Level 3: Planets in the star of house lord
            lvl3 = [p["planet"] for p in planet_rows if p["star_lord"] == h_lord]
            # Level 4: House Lord
            lvl4 = [h_lord]

            significators.append({
                "house": h,
                "level_1_star_of_occupant": list(set(lvl1)),
                "level_2_occupant": list(set(lvl2)),
                "level_3_star_of_lord": list(set(lvl3)),
                "level_4_lord": list(set(lvl4)),
            })

        return {
            "cusps": cusp_rows,
            "planets": planet_rows,
            "ruling_planets": ruling_planets,
            "significators": significators,
        }
