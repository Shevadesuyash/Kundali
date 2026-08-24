"""
app/dasha.py
------------
Calculates Vimshottari Dasha (120-year planetary periods) and Antardasha (sub-periods)
based on the Moon's sidereal longitude and Nakshatra position at birth.
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

DASHA_YEARS_DICT = dict(DASHA_SEQUENCE)
NAKSHATRA_SPAN = 360.0 / 27.0  # 13.333333333333334 degrees (13°20')
DAYS_PER_YEAR = 365.2425


class VimshottariCalculator:
    """Calculates Vimshottari Mahadasha sequence and Antardasha date ranges."""

    @classmethod
    def _calculate_antardashas(
        cls,
        lord_name: str,
        maha_start: datetime.datetime,
        maha_end: datetime.datetime,
        maha_total_years: int,
        ref_dt: datetime.datetime,
        is_first_dasha: bool = False,
        elapsed_years_before_birth: float = 0.0,
    ) -> List[Dict]:
        """
        Calculates all 9 Antardashas (sub-periods) for a given Mahadasha.
        Formula: Antardasha duration = (Mahadasha_years * Antardasha_planet_years) / 120
        """
        # Find index of the Mahadasha lord in DASHA_SEQUENCE
        lord_names = [p[0] for p in DASHA_SEQUENCE]
        lord_idx = lord_names.index(lord_name)

        # Theoretical start if this is the first Mahadasha with elapsed portion before birth
        theoretical_start = (
            maha_start - datetime.timedelta(days=elapsed_years_before_birth * DAYS_PER_YEAR)
            if is_first_dasha
            else maha_start
        )

        antardashas: List[Dict] = []
        curr_sub_start = theoretical_start

        for j in range(9):
            sub_lord_idx = (lord_idx + j) % 9
            sub_lord_name, sub_lord_years = DASHA_SEQUENCE[sub_lord_idx]

            sub_duration_years = (maha_total_years * sub_lord_years) / 120.0
            sub_duration_days = sub_duration_years * DAYS_PER_YEAR
            curr_sub_end = curr_sub_start + datetime.timedelta(days=sub_duration_days)

            # If this is the first Mahadasha, only include/clamp antardashas that end after birth (maha_start)
            if is_first_dasha:
                if curr_sub_end <= maha_start:
                    # Completed prior to birth
                    curr_sub_start = curr_sub_end
                    continue
                effective_start = max(curr_sub_start, maha_start)
            else:
                effective_start = curr_sub_start

            effective_end = min(curr_sub_end, maha_end) if not is_first_dasha or j == 8 else curr_sub_end
            if effective_start >= maha_end:
                break

            is_current = effective_start <= ref_dt < effective_end

            antardashas.append(
                {
                    "planet": sub_lord_name,
                    "total_years": round(sub_duration_years, 4),
                    "start_date": effective_start.strftime("%Y-%m-%d"),
                    "end_date": effective_end.strftime("%Y-%m-%d"),
                    "start_iso": effective_start.isoformat(),
                    "end_iso": effective_end.isoformat(),
                    "is_current": is_current,
                }
            )

            curr_sub_start = curr_sub_end

        return antardashas

    @classmethod
    def calculate_dasha_periods(
        cls,
        birth_utc: datetime.datetime | str,
        moon_longitude: float,
        moon_nakshatra_index: int,
        ref_dt: datetime.datetime | None = None,
    ) -> List[Dict]:
        """
        Calculates all 9 Mahadashas starting from birth_utc, including their Antardashas.

        :param birth_utc: Birth datetime (datetime object or ISO string)
        :param moon_longitude: Moon's sidereal longitude (0 to 360)
        :param moon_nakshatra_index: Index of Moon's Nakshatra (0 to 26)
        :param ref_dt: Reference datetime for determining current Dasha (defaults to now UTC)
        :return: List of dicts describing each Mahadasha period and its Antardashas.
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
        elapsed_years_before_birth = (1.0 - fraction_remaining) * first_lord_total_years

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

            is_current = current_start <= ref_dt < current_end

            # Calculate Antardashas for this Mahadasha
            antardashas = cls._calculate_antardashas(
                lord_name=lord_name,
                maha_start=current_start,
                maha_end=current_end,
                maha_total_years=lord_total_years,
                ref_dt=ref_dt,
                is_first_dasha=(i == 0),
                elapsed_years_before_birth=elapsed_years_before_birth if i == 0 else 0.0,
            )

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
                    "antardashas": antardashas,
                }
            )

            current_start = current_end

        return periods
