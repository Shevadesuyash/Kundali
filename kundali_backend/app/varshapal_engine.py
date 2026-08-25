"""
app/varshapal_engine.py
-----------------------
Tajika Annual Solar Return (Varshapal) Engine.
Calculates:
1. Exact Solar Return (Varsha Pravesh) time via Swiss Ephemeris binary search
2. Varsha Lagna (Annual Ascendant)
3. Muntha Sign Progression & Muntha Lord
4. Annual Mudda / Patyayini Dasha Periods
5. Annual Chart Planetary Positions
"""
from __future__ import annotations

import datetime
from typing import Any, Dict, List, Optional
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

# Mudda Dasha annual days allocation (Total = 360 days / 1 year)
MUDDA_DAYS = [
    ("Sun", 18),
    ("Moon", 30),
    ("Mars", 21),
    ("Rahu", 54),
    ("Jupiter", 48),
    ("Saturn", 57),
    ("Mercury", 51),
    ("Ketu", 21),
    ("Venus", 60),
]


class VarshapalEngine:
    """Computes Tajika Solar Return (Varshapal) for any given target year."""

    @classmethod
    def calculate_varshapal(
        cls,
        natal_year: int,
        natal_month: int,
        natal_day: int,
        natal_hour: int,
        natal_minute: int,
        lat: float,
        lon: float,
        target_year: int,
    ) -> Dict[str, Any]:
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        flags = swe.FLG_SIDEREAL | swe.FLG_SPEED

        # 1. Calculate Natal Sun Longitude
        natal_jd = swe.julday(
            natal_year, natal_month, natal_day,
            natal_hour + natal_minute / 60.0,
        )
        natal_sun_res, _ = swe.calc_ut(natal_jd, swe.SUN, flags)
        natal_sun_lon = natal_sun_res[0] % 360.0

        # Natal Lagna
        _, natal_ascmc = swe.houses_ex(natal_jd, lat, lon, b'W', flags)
        natal_lagna_lon = natal_ascmc[0] % 360.0
        natal_lagna_sign_idx = int(natal_lagna_lon // 30.0)

        # 2. Binary search for Solar Return JD in target year
        # Sidereal year ~ 365.256363 days
        age = target_year - natal_year
        approx_return_jd = natal_jd + (age * 365.256363004)

        # Search window: ±3 days around approximate return
        low_jd = approx_return_jd - 3.0
        high_jd = approx_return_jd + 3.0

        return_jd = approx_return_jd
        for _ in range(60):  # High precision binary refinement
            mid_jd = (low_jd + high_jd) / 2.0
            sun_res, _ = swe.calc_ut(mid_jd, swe.SUN, flags)
            curr_sun_lon = sun_res[0] % 360.0

            # Angular difference handling wrap-around
            diff = (curr_sun_lon - natal_sun_lon + 180.0) % 360.0 - 180.0

            if abs(diff) < 0.00001:  # Sub-arcsecond accuracy
                return_jd = mid_jd
                break
            elif diff < 0:
                low_jd = mid_jd
            else:
                high_jd = mid_jd
            return_jd = mid_jd

        # Convert return_jd to UTC and IST
        y, m, d, ut_hour = swe.revjul(return_jd)
        h = int(ut_hour)
        minute = int((ut_hour - h) * 60.0)
        sec = int((((ut_hour - h) * 60.0) - minute) * 60.0)

        utc_dt = datetime.datetime(y, m, d, h, minute, sec, tzinfo=datetime.timezone.utc)
        ist_tz = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
        ist_dt = utc_dt.astimezone(ist_tz)

        # 3. Varsha Lagna (Ascendant at Solar Return)
        _, varsha_ascmc = swe.houses_ex(return_jd, lat, lon, b'W', flags)
        varsha_lagna_lon = varsha_ascmc[0] % 360.0
        varsha_lagna_sign_idx = int(varsha_lagna_lon // 30.0)

        # 4. Muntha Progression
        # Muntha moves 1 sign per completed year of age from Natal Lagna
        muntha_sign_idx = (natal_lagna_sign_idx + age) % 12
        muntha_sign = SIGN_NAMES[muntha_sign_idx]
        muntha_lord = SIGN_LORDS[muntha_sign_idx]
        muntha_house = (muntha_sign_idx - varsha_lagna_sign_idx + 12) % 12 + 1

        is_muntha_auspicious = muntha_house in {1, 2, 3, 5, 9, 10, 11}
        muntha_verdict = (
            f"Muntha is placed in House {muntha_house} ({muntha_sign}) — "
            + ("Highly favorable for growth, recognition, and achievements." if is_muntha_auspicious else "Challenging placement; demands health care, patience, and risk mitigation.")
        )

        # 5. Planetary positions at Solar Return
        planets = []
        for p_name, p_id in PLANET_IDS.items():
            p_res, _ = swe.calc_ut(return_jd, p_id, flags)
            p_lon = p_res[0] % 360.0
            p_speed = p_res[3]
            s_idx = int(p_lon // 30.0)
            house = (s_idx - varsha_lagna_sign_idx + 12) % 12 + 1
            planets.append({
                "planet": p_name,
                "longitude": round(p_lon, 4),
                "sign": SIGN_NAMES[s_idx],
                "house": house,
                "retrograde": p_speed < 0,
            })

        # Ketu
        rahu = next(p for p in planets if p["planet"] == "Rahu")
        ketu_lon = (rahu["longitude"] + 180.0) % 360.0
        k_s_idx = int(ketu_lon // 30.0)
        planets.append({
            "planet": "Ketu",
            "longitude": round(ketu_lon, 4),
            "sign": SIGN_NAMES[k_s_idx],
            "house": (k_s_idx - varsha_lagna_sign_idx + 12) % 12 + 1,
            "retrograde": True,
        })

        # 6. Annual Mudda Dasha Periods (Sequential from return date)
        mudda_periods = []
        curr_dt = ist_dt
        for p_name, days in MUDDA_DAYS:
            end_dt = curr_dt + datetime.timedelta(days=days)
            mudda_periods.append({
                "planet": p_name,
                "duration_days": days,
                "start_date": curr_dt.strftime("%d %b %Y"),
                "end_date": end_dt.strftime("%d %b %Y"),
            })
            curr_dt = end_dt

        return {
            "target_year": target_year,
            "age": age,
            "varsha_pravesh_ist": ist_dt.strftime("%d %B %Y, %I:%M:%S %p IST"),
            "varsha_pravesh_utc": utc_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "varsha_lagna": {
                "sign": SIGN_NAMES[varsha_lagna_sign_idx],
                "sign_index": varsha_lagna_sign_idx,
                "sign_lord": SIGN_LORDS[varsha_lagna_sign_idx],
                "longitude": round(varsha_lagna_lon, 4),
            },
            "muntha": {
                "sign": muntha_sign,
                "sign_index": muntha_sign_idx,
                "lord": muntha_lord,
                "house": muntha_house,
                "is_auspicious": is_muntha_auspicious,
                "interpretation": muntha_verdict,
            },
            "planets": planets,
            "mudda_dasha": mudda_periods,
        }
