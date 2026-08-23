"""
app/dasha.py
------------
Calculates Vimshottari Dasha (120-year planetary periods) based on
the Moon's sidereal longitude and Nakshatra position at birth.
"""
from __future__ import annotations

import datetime
from typing import Dict, List, Tuple

# Standard Vimshottari Dasha order and durations (total 120 years)
DASHA_SEQUENCE: List[Tuple[str, int]] = [
    ("Ketu", 7),
    ("Venus", 20),
    ("Sun", 6),
    ("Moon", 10),
    ("Mars", 7),
    ("Rahu", 18),
    ("Jupiter", 16),
    ("Saturn", 19),
    ("Mercury", 17),
]

NAKSHATRA_SPAN = 360.0 / 27.0  # 13.333333333333334 degrees (13°20')
DAYS_PER_YEAR = 365.2425


class VimshottariCalculator:
    """Calculates Vimshottari Mahadasha sequence and date ranges."""

    @staticmethod
    def calculate_dasha_periods(
        birth_utc: datetime.datetime | str,
        moon_longitude: float,
        moon_nakshatra_index: int,
        ref_dt: datetime.datetime | None = None,
    ) -> List[Dict]:
        """
        Calculates all 9 Mahadashas starting from birth_utc.

        :param birth_utc: Birth datetime (datetime object or ISO string)
        :param moon_longitude: Moon's sidereal longitude (0 to 360)
        :param moon_nakshatra_index: Index of Moon's Nakshatra (0 to 26)
        :param ref_dt: Reference datetime for determining current Dasha (defaults to now UTC)
        :return: List of dicts describing each Mahadasha period.
        """
        if isinstance(birth_utc, str):
            birth_dt = datetime.datetime.fromisoformat(birth_utc)
        else:
            birth_dt = birth_utc

        if ref_dt is None:
            ref_dt = datetime.datetime.now(datetime.timezone.utc)
        elif ref_dt.tzinfo is None:
            ref_dt = ref_dt.replace(tzinfo=datetime.timezone.utc)

        if birth_dt.tzinfo is None:
            birth_dt = birth_dt.replace(tzinfo=datetime.timezone.utc)

        # 1. Determine starting planet index from Nakshatra index
        start_lord_idx = moon_nakshatra_index % 9

        # 2. Calculate remaining balance of the initial Mahadasha
        traversed_deg = moon_longitude % NAKSHATRA_SPAN
        fraction_remaining = max(0.0, min(1.0, 1.0 - (traversed_deg / NAKSHATRA_SPAN)))
        first_lord_name, first_lord_total_years = DASHA_SEQUENCE[start_lord_idx]
        first_dasha_balance_years = fraction_remaining * first_lord_total_years

        periods: List[Dict] = []
        current_start = birth_dt

        for i in range(9):
            lord_idx = (start_lord_idx + i) % 9
            lord_name, lord_total_years = DASHA_SEQUENCE[lord_idx]

            if i == 0:
                dasha_years = first_dasha_balance_years
            else:
                dasha_years = float(lord_total_years)

            duration_days = dasha_years * DAYS_PER_YEAR
            current_end = current_start + datetime.timedelta(days=duration_days)

            is_current = current_start <= ref_dt <= current_end

            periods.append(
                {
                    "planet": lord_name,
                    "total_years": lord_total_years,
                    "dasha_years": round(dasha_years, 2),
                    "start_date": current_start.strftime("%Y-%m-%d"),
                    "end_date": current_end.strftime("%Y-%m-%d"),
                    "start_iso": current_start.isoformat(),
                    "end_iso": current_end.isoformat(),
                    "is_current": is_current,
                }
            )

            current_start = current_end

        return periods
