from __future__ import annotations

import datetime
from typing import Dict, List
from dateutil.relativedelta import relativedelta

# Vimshottari Dasha sequence of lords and their total duration in years.
# The index in this array is important for the cycle.
DASHA_LORDS = [
    {"planet": "Ketu", "years": 7},
    {"planet": "Venus", "years": 20},
    {"planet": "Sun", "years": 6},
    {"planet": "Moon", "years": 10},
    {"planet": "Mars", "years": 7},
    {"planet": "Rahu", "years": 18},
    {"planet": "Jupiter", "years": 16},
    {"planet": "Saturn", "years": 19},
    {"planet": "Mercury", "years": 17},
]

NAKSHATRA_SPAN = 360.0 / 27.0  # 13 degrees 20 minutes

class VimshottariCalculator:
    """
    Calculates the 120-year Vimshottari Dasha (planetary period) timeline
    based on the Moon's exact longitude at birth.
    """
    
    @staticmethod
    def calculate_dashas(utc_birth_time_str: str, moon_longitude: float, moon_nakshatra_index: int) -> List[Dict]:
        """
        Calculates all 9 Mahadashas.
        utc_birth_time_str: ISO formatted UTC birth time string (e.g. '1982-07-19T23:35:00+00:00')
        moon_longitude: Decimal degrees of the Moon's position.
        moon_nakshatra_index: 0 to 26.
        """
        try:
            birth_dt = datetime.datetime.fromisoformat(utc_birth_time_str)
        except ValueError:
            # Fallback if there's an issue with timezone offset strings
            birth_dt = datetime.datetime.fromisoformat(utc_birth_time_str.replace("Z", "+00:00"))

        # 1. Determine starting lord index
        start_lord_idx = moon_nakshatra_index % 9
        
        # 2. Calculate balance of the first dasha
        traversed_in_nakshatra = moon_longitude % NAKSHATRA_SPAN
        fraction_remaining = 1.0 - (traversed_in_nakshatra / NAKSHATRA_SPAN)
        
        # Clamp to 0.0 - 1.0 just in case of floating point inaccuracies
        fraction_remaining = max(0.0, min(1.0, fraction_remaining))
        
        start_lord = DASHA_LORDS[start_lord_idx]
        balance_years = fraction_remaining * start_lord["years"]
        
        dashas = []
        current_date = birth_dt
        
        # 3. Calculate the sequence
        for step in range(9):
            lord_idx = (start_lord_idx + step) % 9
            lord = DASHA_LORDS[lord_idx]
            
            # The first dasha uses the balance, the rest use the full years
            years_to_add = balance_years if step == 0 else lord["years"]
            
            # Use relativedelta to handle leap years accurately
            # We convert fractional years to exact days/months/years for relativedelta
            whole_years = int(years_to_add)
            remainder = years_to_add - whole_years
            
            # 1 year = 365.2425 days on average (Gregorian)
            days_to_add = remainder * 365.2425
            
            delta = relativedelta(years=whole_years, days=int(days_to_add))
            end_date = current_date + delta
            
            dashas.append({
                "planet": lord["planet"],
                "start_date": current_date.isoformat(),
                "end_date": end_date.isoformat(),
                "total_years": years_to_add,
            })
            
            current_date = end_date
            
        return dashas
