"""
app/kundali_analyzer.py
------------------------
Module B/C: Produces the complete individual Kundali JSON report -
birth profile, Rashi/Nakshatra/Pada, planetary table, D1/Rashi/D9
charts, and Manglik (Mangal) Dosha status.

CHANGELOG (accuracy upgrade)
-----------------------------
- check_manglik(): now evaluates Mars from Lagna, Moon, and Venus charts
  (three-chart method per classical south-Indian and north-Indian schools).
- Added Jupiter aspect cancellation (Muhurta Chintamani).
- Added Mars debilitation in Cancer as a cancellation condition.
- Added ketu_manglik as a supplementary indicator.
- Severity levels now reflect multi-chart analysis.
"""
from __future__ import annotations

from typing import Dict, List, Optional

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

    # ------------------------------------------------------------------
    def check_manglik(self, technical_profile: Dict) -> Dict:
        """
        Full classical Mangal Dosha check.

        Checks Mars from three reference points:
          1. Lagna (Ascendant) — mandatory baseline
          2. Moon chart          — per south-Indian and mixed-school tradition
          3. Venus chart         — Venus represents marriage; widely used

        Cancellation rules applied (per Muhurta Chintamani & BPHS):
          a. Mars in own sign      : Aries (0) or Scorpio (7)
          b. Mars exalted          : Capricorn (9)
          c. Jupiter aspects Mars  : Jupiter's 4th, 7th, or 9th aspect on Mars's sign

        NOTE on debilitation (Cancer=3):
          Debilitation weakens Mars's positive significations but does NOT cancel
          Mangal Dosha per Muhurta Chintamani. The classical text lists only
          own-sign, exaltation, and Jupiter aspect as true cancellations.
          Debilitation is surfaced in the severity string as a mitigating note
          without setting is_cancelled = True.

        Ketu is also checked from Lagna as a supplementary indicator
        (many schools treat Ketu identically to Mars for Mangal Dosha).
        """
        planets   = technical_profile["planets"]
        mars      = planets["Mars"]
        ketu      = planets["Ketu"]
        jupiter   = planets["Jupiter"]
        asc_idx   = technical_profile["ascendant"]["sign_index"]
        moon_idx  = technical_profile["moon_sign_index"]
        venus_idx = planets["Venus"]["sign_index"]
        mars_idx  = mars["sign_index"]

        # ---- 1. House positions of Mars from three charts ----------------
        house_from_lagna  = self.engine.house_of_planet(asc_idx,   mars_idx)
        house_from_moon   = self.engine.house_of_planet(moon_idx,  mars_idx)
        house_from_venus  = self.engine.house_of_planet(venus_idx, mars_idx)

        manglik_from_lagna  = house_from_lagna  in MANGLIK_HOUSES
        manglik_from_moon   = house_from_moon   in MANGLIK_HOUSES
        manglik_from_venus  = house_from_venus  in MANGLIK_HOUSES

        # Overall Manglik flag: True if Manglik from ANY chart
        is_manglik = manglik_from_lagna or manglik_from_moon or manglik_from_venus

        # ---- 2. Cancellation checks (Muhurta Chintamani) ----------------
        cancellation_reason: Optional[str] = None

        # Debilitation flag — severity note only, NOT a cancellation
        mars_debilitated = (mars_idx == 3)   # Cancer = Neecha for Mars

        # (a/b) Mars sign-based cancellations
        if is_manglik:
            if mars_idx in {0, 7}:      # Own sign: Aries or Scorpio
                cancellation_reason = "Mars in own sign (Aries/Scorpio) — Dosha cancelled"
            elif mars_idx == 9:         # Exaltation: Capricorn
                cancellation_reason = "Mars exalted in Capricorn — Dosha cancelled"

        # (c) Jupiter aspect on Mars (4th, 7th, 9th special aspects of Jupiter)
        if is_manglik and cancellation_reason is None:
            jupiter_idx  = jupiter["sign_index"]
            aspect_dist  = (mars_idx - jupiter_idx) % 12 + 1   # 1-12
            if aspect_dist in {4, 7, 9}:
                cancellation_reason = (
                    f"Jupiter aspects Mars from {jupiter['sign']} "
                    f"({aspect_dist}th aspect) — Dosha cancelled per Muhurta Chintamani"
                )

        is_cancelled = is_manglik and (cancellation_reason is not None)

        # ---- 3. Severity -------------------------------------------------
        debilitated_note = " [Mars debilitated in Cancer — strength reduced]" if mars_debilitated else ""

        if not is_manglik:
            severity = "None"
        elif is_cancelled:
            severity = f"Cancelled ({cancellation_reason})"
        else:
            # Count how many charts show Manglik
            chart_count = sum([manglik_from_lagna, manglik_from_moon, manglik_from_venus])
            if chart_count == 3:
                severity = f"Severe (Manglik in all three charts){debilitated_note}"
            elif chart_count == 2:
                severity = f"High (Manglik in two of three charts){debilitated_note}"
            elif house_from_lagna in {1, 7, 8}:
                severity = f"High (Mars in critical house from Lagna){debilitated_note}"
            else:
                severity = "Low (Manglik from one secondary chart only)"

        # ---- 4. Ketu supplementary check --------------------------------
        ketu_house_lagna = self.engine.house_of_planet(asc_idx, ketu["sign_index"])
        ketu_manglik = {
            "is_manglik":   ketu_house_lagna in MANGLIK_HOUSES,
            "ketu_house":   ketu_house_lagna,
            "ketu_sign":    ketu["sign"],
            "note": (
                "Ketu in a Manglik house is treated as a Mangal equivalent by many "
                "schools; verify with a practitioner for your tradition."
            ),
        }

        return {
            "is_manglik":           is_manglik,
            "is_cancelled":         is_cancelled,
            "cancellation_reason":  cancellation_reason,
            "severity":             severity,
            # Per-chart detail
            "manglik_from_lagna":   manglik_from_lagna,
            "manglik_from_moon":    manglik_from_moon,
            "manglik_from_venus":   manglik_from_venus,
            "mars_house_lagna":     house_from_lagna,
            "mars_house_moon":      house_from_moon,
            "mars_house_venus":     house_from_venus,
            "mars_sign":            mars["sign"],
            # Supplementary
            "ketu_manglik":         ketu_manglik,
        }

    # ------------------------------------------------------------------
    def build_report(self, person: Person, include_charts: bool = True) -> Dict:
        technical_profile = self.engine.get_technical_profile(person)

        moon_rashi_idx = technical_profile["moon_sign_index"]
        moon_nak_idx   = technical_profile["moon_nakshatra_index"]

        classification = {
            "varna":          VARNA_NAMES[VARNA_MAP[moon_rashi_idx]],
            "gana":           GANA_NAMES[GANA_MAP[moon_nak_idx]],
            "nadi":           NADI_NAMES[NADI_MAP[moon_nak_idx]],
            "moon_sign_lord": SIGN_LORDS[moon_rashi_idx],
        }

        report = {
            "profile":        technical_profile["birth"] | {"name": technical_profile["name"]},
            "ascendant":      technical_profile["ascendant"],
            "moon_sign":      technical_profile["moon_sign"],
            "moon_nakshatra": technical_profile["moon_nakshatra"],
            "moon_pada":      technical_profile["moon_pada"],
            "classification": classification,
            "planets":        technical_profile["planets"],
            "manglik_dosha":  self.check_manglik(technical_profile),
            "ayanamsha_used": "Lahiri",
            "dasha_periods":  VimshottariCalculator.calculate_dasha_periods(
                technical_profile["birth"]["utc"],
                technical_profile["planets"]["Moon"]["longitude"],
                technical_profile["moon_nakshatra_index"],
            ),
        }

        if include_charts:
            report["charts"] = self.chart_engine.build_all_charts(technical_profile)

        # Keep the raw technical profile around for downstream consumers
        # (MatchMaker/Ashtakoot) without re-computing ephemeris calls.
        report["_technical_profile"] = technical_profile
        return report
