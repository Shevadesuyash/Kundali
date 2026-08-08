"""
app/kundali_analyzer.py
------------------------
Module B/C: Produces the complete individual Kundali JSON report -
birth profile, Rashi/Nakshatra/Pada, planetary table, D1/Rashi/D9
charts, and Manglik (Mangal) Dosha status.
"""
from __future__ import annotations

from typing import Dict

from app.ashtakoot import GANA_MAP, GANA_NAMES, NADI_MAP, NADI_NAMES, VARNA_MAP, VARNA_NAMES
from app.astro_engine import MANGLIK_HOUSES, SIGN_LORDS, VedicAstrologyEngine
from app.chart_engine import ChartEngine
from app.models import Person
from app.dasha import VimshottariCalculator


class KundaliAnalyzer:
    """Generates a complete individual Kundali report as a JSON-ready dict."""

    def __init__(self, engine: VedicAstrologyEngine):
        self.engine = engine
        self.chart_engine = ChartEngine(engine)

    def check_manglik(self, technical_profile: Dict) -> Dict:
        mars = technical_profile["planets"]["Mars"]
        house = mars["house_from_lagna"]
        sign_idx = mars["sign_index"]
        is_manglik = house in MANGLIK_HOUSES

        # Common cancellation rule: Mars in its own sign (Aries=0, Scorpio=7)
        # or exalted (Capricorn=9) reduces/cancels the dosha in many schools.
        is_cancelled = is_manglik and sign_idx in {0, 7, 9}

        if not is_manglik:
            severity = "None"
        elif is_cancelled:
            severity = "Cancelled (Mars in own/exalted sign)"
        elif house in {1, 7, 8}:
            severity = "High"
        else:
            severity = "Low"

        return {
            "is_manglik": is_manglik,
            "is_cancelled": is_cancelled,
            "severity": severity,
            "mars_house": house,
            "mars_sign": mars["sign"],
        }

    def build_report(self, person: Person, include_charts: bool = True) -> Dict:
        technical_profile = self.engine.get_technical_profile(person)

        moon_rashi_idx = technical_profile["moon_sign_index"]
        moon_nak_idx = technical_profile["moon_nakshatra_index"]

        classification = {
            "varna": VARNA_NAMES[VARNA_MAP[moon_rashi_idx]],
            "gana": GANA_NAMES[GANA_MAP[moon_nak_idx]],
            "nadi": NADI_NAMES[NADI_MAP[moon_nak_idx]],
            "moon_sign_lord": SIGN_LORDS[moon_rashi_idx],
        }

        report = {
            "profile": technical_profile["birth"] | {"name": technical_profile["name"]},
            "ascendant": technical_profile["ascendant"],
            "moon_sign": technical_profile["moon_sign"],
            "moon_nakshatra": technical_profile["moon_nakshatra"],
            "moon_pada": technical_profile["moon_pada"],
            "classification": classification,
            "planets": technical_profile["planets"],
            "manglik_dosha": self.check_manglik(technical_profile),
            "ayanamsha_used": "Lahiri",
            "dasha_periods": VimshottariCalculator.calculate_dashas(
                technical_profile["birth"]["utc"],
                technical_profile["planets"]["Moon"]["longitude"],
                technical_profile["moon_nakshatra_index"]
            )
        }

        if include_charts:
            report["charts"] = self.chart_engine.build_all_charts(technical_profile)

        # Keep the raw technical profile around for downstream consumers
        # (MatchMaker/Ashtakoot) without re-computing ephemeris calls.
        report["_technical_profile"] = technical_profile
        return report
