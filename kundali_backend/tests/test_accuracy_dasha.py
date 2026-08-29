"""
tests/test_accuracy_dasha.py
----------------------------
P1 Accuracy Tests for Vimshottari Dasha Engine:
- Total duration invariant: sum of all 9 Mahadashas total_years must equal 120.
- Continuity invariant: each Mahadasha end_date equals next Mahadasha start_date.
- Antardasha sum invariant: sum of 9 Antardasha durations equals Mahadasha duration.
- Balance-at-birth known cases across nakshatra progress (0%, 50%, 99.99%).
"""
from __future__ import annotations
import pytest
from app.dasha import VimshottariCalculator, DASHA_SEQUENCE, NAKSHATRA_SPAN


def test_dasha_120_year_invariant_across_all_27_nakshatras():
    """
    For any starting Nakshatra (0 to 26), the complete 120-year cycle must sum to 120.0 years.
    """
    for nak_idx in range(27):
        moon_lon = nak_idx * NAKSHATRA_SPAN
        dashas = VimshottariCalculator.calculate_dasha_periods(
            "2000-01-01T12:00:00+00:00", moon_lon, nak_idx
        )
        total_years = sum(d["total_years"] for d in dashas)
        assert abs(total_years - 120.0) < 1e-5


def test_mahadasha_date_continuity():
    """
    Mahadashas must have continuous date projection: end_date of period i == start_date of period i+1.
    """
    for nak_idx in [0, 7, 13, 20, 26]:
        moon_lon = nak_idx * NAKSHATRA_SPAN + 3.0
        dashas = VimshottariCalculator.calculate_dasha_periods(
            "1995-06-15T08:30:00+00:00", moon_lon, nak_idx
        )
        for i in range(len(dashas) - 1):
            assert dashas[i]["end_date"] == dashas[i + 1]["start_date"]


def test_antardasha_durations_sum_to_mahadasha_duration():
    """
    For non-first Mahadashas, the 9 Antardashas must sum to the full Mahadasha years.
    """
    dashas = VimshottariCalculator.calculate_dasha_periods(
        "2000-01-01T12:00:00+00:00", 0.0, 0
    )
    for i, d in enumerate(dashas):
        if i == 0:
            continue  # First dasha is truncated to balance at birth
        antardashas = d.get("antardashas", [])
        assert len(antardashas) == 9
        total_ad_duration = sum(ad["total_years"] for ad in antardashas)
        assert abs(total_ad_duration - d["dasha_years"]) < 0.05


def test_balance_at_birth_proportions():
    """
    Balance at birth:
    - 0% elapsed: first dasha has 100% of its full years remaining.
    - 50% elapsed: first dasha has 50% of its full years remaining.
    - 99.99% elapsed: first dasha has ≈ 0% remaining.
    """
    # Nakshatra 0 lord is Ketu (7 years full)
    d_0 = VimshottariCalculator.calculate_dasha_periods("2000-01-01T12:00:00+00:00", 0.0, 0)
    assert abs(d_0[0]["dasha_years"] - 7.0) < 0.01

    d_50 = VimshottariCalculator.calculate_dasha_periods(
        "2000-01-01T12:00:00+00:00", NAKSHATRA_SPAN / 2.0, 0
    )
    assert abs(d_50[0]["dasha_years"] - 3.5) < 0.01

    d_99 = VimshottariCalculator.calculate_dasha_periods(
        "2000-01-01T12:00:00+00:00", NAKSHATRA_SPAN * 0.999, 0
    )
    assert d_99[0]["dasha_years"] < 0.05
