"""
app/transit_engine.py
---------------------
Real-time Gochara (planetary transit) engine for Sade Sati, Dhaiya,
and Jupiter transit analysis against a person's natal chart.

Sade Sati Phases (Saturn's 7.5-year transit relative to natal Moon):
  Phase 1 (Rising)  : Saturn in 12th from Moon  → (moon_idx - 1) % 12
  Phase 2 (Peak)    : Saturn in natal Moon sign  → moon_idx
  Phase 3 (Setting) : Saturn in  2nd from Moon   → (moon_idx + 1) % 12

Dhaiya (Small Panoti):
  Saturn transiting 4th or 8th house from natal Moon.

Jupiter Gochara (favorable houses from Moon): {2, 5, 7, 9, 11}
"""
from __future__ import annotations

import datetime
from typing import Any, Dict, List

import swisseph as swe

SIGN_NAMES = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

PLANET_IDS: Dict[str, int] = {
    "Sun":     swe.SUN,
    "Moon":    swe.MOON,
    "Mars":    swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus":   swe.VENUS,
    "Saturn":  swe.SATURN,
    "Rahu":    swe.TRUE_NODE,
}

# Ketu is always 180° from Rahu
JUPITER_FAVORABLE_HOUSES = {2, 5, 7, 9, 11}


class TransitEngine:
    """Computes current planetary transits and Sade Sati status."""

    @classmethod
    def get_current_transits(
        cls,
        natal_moon_sign_index: int,
        natal_lagna_sign_index: int,
    ) -> Dict[str, Any]:
        """
        Calculate live transit positions relative to a person's natal chart.

        Args:
            natal_moon_sign_index:  0-11 (Aries=0 … Pisces=11)
            natal_lagna_sign_index: 0-11

        Returns:
            dict with keys: transits, sade_sati, dhaiya, jupiter_gochara, as_of
        """
        # Current UTC Julian Day
        now_utc = datetime.datetime.utcnow()
        jd_now = swe.julday(
            now_utc.year, now_utc.month, now_utc.day,
            now_utc.hour + now_utc.minute / 60.0 + now_utc.second / 3600.0,
        )

        # Lahiri ayanamsha
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        flags = swe.FLG_SIDEREAL | swe.FLG_SPEED

        transits: List[Dict[str, Any]] = []
        saturn_data: Dict[str, Any] = {}
        jupiter_data: Dict[str, Any] = {}

        for planet_name, planet_id in PLANET_IDS.items():
            result, _ = swe.calc_ut(jd_now, planet_id, flags)
            lon = result[0] % 360.0
            speed = result[3]
            sign_idx = int(lon // 30) % 12
            degree_in_sign = lon % 30

            house_from_moon   = (sign_idx - natal_moon_sign_index) % 12 + 1
            house_from_lagna  = (sign_idx - natal_lagna_sign_index) % 12 + 1

            entry = {
                "planet":            planet_name,
                "longitude":         round(lon, 4),
                "sign_index":        sign_idx,
                "sign":              SIGN_NAMES[sign_idx],
                "degree_in_sign":    round(degree_in_sign, 2),
                "house_from_moon":   house_from_moon,
                "house_from_lagna":  house_from_lagna,
                "retrograde":        speed < 0,
            }
            transits.append(entry)

            if planet_name == "Saturn":
                saturn_data = entry
            elif planet_name == "Jupiter":
                jupiter_data = entry

        # Ketu (always 180° from Rahu)
        rahu_entry = next(t for t in transits if t["planet"] == "Rahu")
        ketu_lon = (rahu_entry["longitude"] + 180.0) % 360.0
        ketu_sign_idx = int(ketu_lon // 30) % 12
        transits.append({
            "planet":           "Ketu",
            "longitude":        round(ketu_lon, 4),
            "sign_index":       ketu_sign_idx,
            "sign":             SIGN_NAMES[ketu_sign_idx],
            "degree_in_sign":   round(ketu_lon % 30, 2),
            "house_from_moon":  (ketu_sign_idx - natal_moon_sign_index) % 12 + 1,
            "house_from_lagna": (ketu_sign_idx - natal_lagna_sign_index) % 12 + 1,
            "retrograde":       True,  # Ketu is always retrograde by convention
        })

        # Sade Sati & Dhaiya
        sade_sati = cls._sade_sati_status(saturn_data["sign_index"], natal_moon_sign_index)
        dhaiya    = cls._dhaiya_status(saturn_data["house_from_moon"])
        jupiter_g = cls._jupiter_gochara(jupiter_data["house_from_moon"])

        # Readable IST timestamp
        ist_offset = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
        as_of_ist = now_utc.replace(tzinfo=datetime.timezone.utc).astimezone(ist_offset)

        return {
            "transits":        transits,
            "sade_sati":       sade_sati,
            "dhaiya":          dhaiya,
            "jupiter_gochara": jupiter_g,
            "as_of_utc":       now_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "as_of_ist":       as_of_ist.strftime("%d %b %Y, %I:%M %p IST"),
        }

    # ------------------------------------------------------------------
    @classmethod
    def _sade_sati_status(cls, saturn_sign_idx: int, moon_sign_idx: int) -> Dict[str, Any]:
        prev = (moon_sign_idx - 1) % 12  # 12th from Moon
        nxt  = (moon_sign_idx + 1) % 12  # 2nd from Moon

        if saturn_sign_idx == moon_sign_idx:
            return {
                "active":      True,
                "phase":       2,
                "phase_label": "Peak Phase",
                "saturn_sign": SIGN_NAMES[saturn_sign_idx],
                "description": (
                    "Saturn is transiting your natal Moon sign — the most intense phase "
                    "of Sade Sati. This 2.5-year window calls for patience, discipline, "
                    "and inner resilience."
                ),
            }
        elif saturn_sign_idx == prev:
            return {
                "active":      True,
                "phase":       1,
                "phase_label": "Rising Phase",
                "saturn_sign": SIGN_NAMES[saturn_sign_idx],
                "description": (
                    "Saturn is in the 12th from your Moon — Sade Sati is approaching. "
                    "Expenses, isolation, or hidden challenges may surface. "
                    "Spiritual practices are strengthened during this phase."
                ),
            }
        elif saturn_sign_idx == nxt:
            return {
                "active":      True,
                "phase":       3,
                "phase_label": "Setting Phase",
                "saturn_sign": SIGN_NAMES[saturn_sign_idx],
                "description": (
                    "Saturn is in the 2nd from your Moon — Sade Sati is winding down. "
                    "Finances and family speech may require extra care. "
                    "The most intense pressures are easing."
                ),
            }
        else:
            return {
                "active":      False,
                "phase":       0,
                "phase_label": "Not Active",
                "saturn_sign": SIGN_NAMES[saturn_sign_idx],
                "description": "Sade Sati is not active. Saturn is not transiting the 12th, 1st, or 2nd from your Moon.",
            }

    @classmethod
    def _dhaiya_status(cls, saturn_house_from_moon: int) -> Dict[str, Any]:
        if saturn_house_from_moon == 4:
            return {
                "active":      True,
                "house":       4,
                "description": "Small Panoti (Dhaiya) — Saturn in 4th from Moon. Domestic life, property, and mother's health may need attention.",
            }
        elif saturn_house_from_moon == 8:
            return {
                "active":      True,
                "house":       8,
                "description": "Small Panoti (Dhaiya) — Saturn in 8th from Moon. Health, longevity matters, and sudden changes may be tested. Introspection recommended.",
            }
        return {
            "active":      False,
            "house":       saturn_house_from_moon,
            "description": "Dhaiya (Small Panoti) is not active.",
        }

    @classmethod
    def _jupiter_gochara(cls, jupiter_house_from_moon: int) -> Dict[str, Any]:
        favorable = jupiter_house_from_moon in JUPITER_FAVORABLE_HOUSES
        descriptions = {
            2:  "Jupiter in 2nd from Moon — favors wealth accumulation, family harmony, and eloquence.",
            5:  "Jupiter in 5th from Moon — excellent for education, children, creativity, and spiritual merit.",
            7:  "Jupiter in 7th from Moon — supports relationships, partnerships, and marriage prospects.",
            9:  "Jupiter in 9th from Moon — bestows blessings from guru, dharma, and higher learning. Highly auspicious.",
            11: "Jupiter in 11th from Moon — period of gains, fulfillment of wishes, and social expansion.",
        }
        return {
            "favorable":          favorable,
            "house_from_moon":    jupiter_house_from_moon,
            "description":        descriptions.get(
                jupiter_house_from_moon,
                f"Jupiter in {jupiter_house_from_moon}th from Moon — neutral or mildly challenging for growth.",
            ),
        }
