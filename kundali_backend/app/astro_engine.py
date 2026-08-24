"""
app/astro_engine.py
--------------------
Wraps the Swiss Ephemeris (pyswisseph) to produce sidereal (Lahiri)
planetary longitudes, the Ascendant, Rashi/Nakshatra/Pada, and house
placements. This is Module A + part of Module B from the architecture.

Notes on precision:
    pyswisseph falls back to the built-in Moshier semi-analytic theory
    when no ephemeris data files (.se1) are configured via
    swe.set_ephe_path(). Moshier is accurate to within a few arc-seconds
    for the Sun/Moon/planets across a wide date range, which is more
    than sufficient for Vedic Rashi/Nakshatra placement (each Nakshatra
    spans 13deg20'). If you have the official Swiss Ephemeris .se1 files,
    call swe.set_ephe_path('/path/to/ephe') before use for maximum
    accuracy near the exact degree/minute level.
"""
from __future__ import annotations

from typing import Dict, List, Tuple

import swisseph as swe

from app.models import Person

RASI_NAMES = [
    "Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karka)",
    "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrishchika)",
    "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)",
]

NAKSHATRA_NAMES = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

# Sign lordship: sign index (0=Aries) -> ruling planet name
SIGN_LORDS = [
    "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
    "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
]

PLANET_IDS = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mars": swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus": swe.VENUS,
    "Saturn": swe.SATURN,
    "Rahu": swe.TRUE_NODE,  # True lunar node
}

NAKSHATRA_SPAN = 360.0 / 27.0     # 13deg20'
PADA_SPAN = 360.0 / 108.0         # 3deg20'
NAVAMSA_SPAN = 30.0 / 9.0         # 3deg20' per navamsa within a 30deg sign

import os

MANGLIK_MODE = os.environ.get("MANGLIK_MODE", "STANDARD")
MANGLIK_HOUSES = {1, 2, 4, 7, 8, 12} if MANGLIK_MODE == "SOUTH" else {1, 4, 7, 8, 12}



class VedicAstrologyEngine:
    """
    Handles astronomical calculations using Swiss Ephemeris in Sidereal
    (Lahiri Ayanamsha) mode, matching mainstream Vedic (Nirayana) usage.
    """

    def __init__(self):
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        self.rasi_names = RASI_NAMES
        self.nakshatra_names = NAKSHATRA_NAMES

    # ---------------------------------------------------------- utilities
    def get_julian_day(self, person: Person) -> float:
        return swe.julday(
            person.utc_dt.year,
            person.utc_dt.month,
            person.utc_dt.day,
            person.utc_dt.hour + (person.utc_dt.minute / 60.0),
        )

    def get_ayanamsha(self, jd: float) -> float:
        return swe.get_ayanamsa_ut(jd)

    @staticmethod
    def _deg_to_dms(degree_in_sign: float) -> str:
        d = int(degree_in_sign)
        m_float = (degree_in_sign - d) * 60
        m = int(m_float)
        s = int((m_float - m) * 60)
        return f"{d}\u00b0{m:02d}'{s:02d}\""

    def rashi_index(self, longitude: float) -> int:
        return int(longitude % 360 / 30)

    def nakshatra_pada(self, longitude: float) -> Tuple[int, int]:
        longitude = longitude % 360
        nak_idx = int(longitude / NAKSHATRA_SPAN)
        pada = int((longitude % NAKSHATRA_SPAN) / PADA_SPAN) + 1
        return nak_idx, pada

    def navamsa_sign_index(self, sign_idx: int, degree_in_sign: float) -> int:
        """
        D9 (Navamsha) sign for a given rashi + degree-within-sign (0-30).
        Movable signs (0,3,6,9) start counting from themselves.
        Fixed signs (1,4,7,10) start from the 9th sign from it.
        Dual signs (2,5,8,11) start from the 5th sign from it.
        """
        pada = int(degree_in_sign / NAVAMSA_SPAN)  # 0-8
        modality = sign_idx % 3
        if modality == 0:      # Movable
            start_sign = sign_idx
        elif modality == 1:    # Fixed
            start_sign = (sign_idx + 8) % 12
        else:                  # Dual
            start_sign = (sign_idx + 4) % 12
        return (start_sign + pada) % 12

    # ------------------------------------------------------ core queries
    def get_ascendant(self, jd: float, person: Person) -> Dict:
        houses, ascmc = swe.houses_ex(
            jd, person.lat, person.lon, b"W", flags=swe.FLG_SIDEREAL
        )
        asc_deg = ascmc[0] % 360
        sign_idx = self.rashi_index(asc_deg)
        nak_idx, pada = self.nakshatra_pada(asc_deg)
        return {
            "longitude": asc_deg,
            "sign_index": sign_idx,
            "sign": self.rasi_names[sign_idx],
            "degree_in_sign": asc_deg % 30,
            "degree_str": self._deg_to_dms(asc_deg % 30),
            "nakshatra_index": nak_idx,
            "nakshatra": self.nakshatra_names[nak_idx],
            "pada": pada,
        }

    def get_all_planet_positions(self, jd: float) -> Dict[str, Dict]:
        """Returns sidereal longitude + sign/nakshatra data for all 9 grahas
        (7 classical planets + Rahu, with Ketu derived as Rahu + 180deg)."""
        result: Dict[str, Dict] = {}
        for name, pid in PLANET_IDS.items():
            data, _flag = swe.calc_ut(jd, pid, swe.FLG_SIDEREAL)
            lon = data[0] % 360
            speed = data[3] if len(data) > 3 else None
            sign_idx = self.rashi_index(lon)
            nak_idx, pada = self.nakshatra_pada(lon)
            result[name] = {
                "longitude": lon,
                "sign_index": sign_idx,
                "sign": self.rasi_names[sign_idx],
                "degree_in_sign": lon % 30,
                "degree_str": self._deg_to_dms(lon % 30),
                "nakshatra_index": nak_idx,
                "nakshatra": self.nakshatra_names[nak_idx],
                "pada": pada,
                "retrograde": bool(speed is not None and speed < 0),
            }

        # Ketu = Rahu + 180 degrees (shadow point, always opposite Rahu)
        rahu_lon = result["Rahu"]["longitude"]
        ketu_lon = (rahu_lon + 180) % 360
        sign_idx = self.rashi_index(ketu_lon)
        nak_idx, pada = self.nakshatra_pada(ketu_lon)
        result["Ketu"] = {
            "longitude": ketu_lon,
            "sign_index": sign_idx,
            "sign": self.rasi_names[sign_idx],
            "degree_in_sign": ketu_lon % 30,
            "degree_str": self._deg_to_dms(ketu_lon % 30),
            "nakshatra_index": nak_idx,
            "nakshatra": self.nakshatra_names[nak_idx],
            "pada": pada,
            "retrograde": True,  # Nodes are always retrograde by convention
        }
        return result

    def house_of_planet(self, asc_sign_idx: int, planet_sign_idx: int) -> int:
        """Whole-sign house system: house = (planet_sign - asc_sign) mod 12 + 1."""
        return ((planet_sign_idx - asc_sign_idx) % 12) + 1

    def get_technical_profile(self, person: Person) -> Dict:
        """
        One-stop call that returns everything needed downstream:
        Ascendant, all planetary positions, houses (whole-sign from Lagna),
        and Manglik house flags. This is the canonical data structure
        consumed by KundaliAnalyzer, ChartEngine, MatchMaker and Ashtakoot.
        """
        jd = self.get_julian_day(person)
        ascendant = self.get_ascendant(jd, person)
        planets = self.get_all_planet_positions(jd)

        for name, p in planets.items():
            p["house_from_lagna"] = self.house_of_planet(
                ascendant["sign_index"], p["sign_index"]
            )
            p["sign_lord"] = SIGN_LORDS[p["sign_index"]]

        moon = planets["Moon"]
        mars_house = planets["Mars"]["house_from_lagna"]

        return {
            "name": person.name,
            "birth": {
                "local": f"{person.day:02d}-{person.month:02d}-{person.year} "
                         f"{person.hour:02d}:{person.minute:02d} {person.timezone_str}",
                "utc": person.utc_dt.isoformat(),
                "lat": person.lat,
                "lon": person.lon,
            },
            "julian_day": jd,
            "ayanamsha": self.get_ayanamsha(jd),
            "ascendant": ascendant,
            "planets": planets,
            "moon_sign_index": moon["sign_index"],
            "moon_sign": moon["sign"],
            "moon_nakshatra_index": moon["nakshatra_index"],
            "moon_nakshatra": moon["nakshatra"],
            "moon_pada": moon["pada"],
            "mars_house": mars_house,
            "mars_sign_index": planets["Mars"]["sign_index"],
        }
