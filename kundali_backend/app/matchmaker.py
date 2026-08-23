"""
app/matchmaker.py
------------------
Module C + D orchestration: given a Boy and Girl Person, produces the
individual Kundali reports plus the full Ashtakoot Guna Milan (36-point)
compatibility scorecard and a combined Manglik verdict.

CHANGELOG (accuracy upgrade)
-----------------------------
- boy_astro / girl_astro dicts now include nakshatra_pada so that
  calc_nadi() can apply the same-Nakshatra/different-Pada Parihara.
- guna_milan result now surfaces the rajju supplementary check.
- _combined_manglik_verdict() updated to use the new multi-chart
  severity field from check_manglik().
"""
from __future__ import annotations

from typing import Dict

from app.ashtakoot import AshtakootCalculator
from app.astro_engine import VedicAstrologyEngine
from app.kundali_analyzer import KundaliAnalyzer
from app.models import Person


class MatchMaker:
    """Contains the business logic for full marriage-compatibility matching."""

    def __init__(self):
        self.astro_engine    = VedicAstrologyEngine()
        self.kundali_analyzer = KundaliAnalyzer(self.astro_engine)
        self.ashtakoot        = AshtakootCalculator()

    # ------------------------------------------------------------------
    def _combined_manglik_verdict(self, boy_manglik: Dict, girl_manglik: Dict) -> str:
        """
        Produces a combined Mangal Dosha verdict for the couple.
        Uses the effective (post-cancellation) Manglik status from both partners.
        """
        b_active = boy_manglik["is_manglik"]  and not boy_manglik["is_cancelled"]
        g_active = girl_manglik["is_manglik"] and not girl_manglik["is_cancelled"]

        if b_active and g_active:
            return (
                "Both partners are Manglik — the Dosha is mutually neutralised "
                "per classical rules. Severity: "
                f"Boy={boy_manglik['severity']}, Girl={girl_manglik['severity']}."
            )
        if b_active:
            return (
                f"Boy is Manglik (severity: {boy_manglik['severity']}); Girl is not. "
                "Remedies such as Kumbh Vivah or Mangal mantra japa are traditionally "
                "recommended before proceeding."
            )
        if g_active:
            return (
                f"Girl is Manglik (severity: {girl_manglik['severity']}); Boy is not. "
                "Remedies such as Kumbh Vivah or Mangal mantra japa are traditionally "
                "recommended before proceeding."
            )
        return "Neither partner has an active Manglik Dosha."

    # ------------------------------------------------------------------
    def match_profiles(self, boy: Person, girl: Person, include_charts: bool = False) -> Dict:
        boy_report  = self.kundali_analyzer.build_report(boy,  include_charts=include_charts)
        girl_report = self.kundali_analyzer.build_report(girl, include_charts=include_charts)

        boy_tech  = boy_report.pop("_technical_profile")
        girl_tech = girl_report.pop("_technical_profile")

        # Build Ashtakoot input dicts — include nakshatra_pada for Nadi Parihara
        boy_astro = {
            "rashi_index":     boy_tech["moon_sign_index"],
            "nakshatra_index": boy_tech["moon_nakshatra_index"],
            "nakshatra_pada":  boy_tech["moon_pada"],          # NEW: Nadi Parihara
            "rashi_lord":      boy_report["classification"]["moon_sign_lord"],
        }
        girl_astro = {
            "rashi_index":     girl_tech["moon_sign_index"],
            "nakshatra_index": girl_tech["moon_nakshatra_index"],
            "nakshatra_pada":  girl_tech["moon_pada"],         # NEW: Nadi Parihara
            "rashi_lord":      girl_report["classification"]["moon_sign_lord"],
        }

        guna_milan = self.ashtakoot.calculate_guna_milan(boy_astro, girl_astro)

        manglik_summary = {
            "boy":              boy_report["manglik_dosha"],
            "girl":             girl_report["manglik_dosha"],
            "combined_verdict": self._combined_manglik_verdict(
                boy_report["manglik_dosha"],
                girl_report["manglik_dosha"],
            ),
        }

        return {
            "boy":              boy_report,
            "girl":             girl_report,
            "manglik_analysis": manglik_summary,
            "guna_milan":       guna_milan,   # already contains rajju key
        }
