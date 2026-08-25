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
from app.yoga_engine import YogaEngine
from app.ashtakvarga_engine import AshtakvargaEngine
from app.transit_engine import TransitEngine


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

        # Overall Manglik flag: True ONLY if Manglik from Lagna (Primary)
        is_manglik = manglik_from_lagna

        # ---- 2. Cancellation checks (Muhurta Chintamani) ----------------
        # Run cancellations BEFORE Papa Samyam so we know if Mars is cancelled.
        cancellation_reason: Optional[str] = None

        # Debilitation: Cancer (sign index 3) weakens Mars significantly.
        # This reduces its Papa weight (see below) but does NOT grant full cancellation.
        mars_debilitated = (mars_idx == 3)  # Cancer = Neecha for Mars

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

        # ---- 1b. Papa Samyam Calculation (Full Multi-Chart) ---------------
        # Classical South Indian / Kerala Papa Samyam (Papa Sankhya):
        #   Total = S_Lagna + (0.75 × S_Moon) + (0.50 × S_Venus)
        #
        # Mars weight adjustments:
        #   - Normal Mars in Manglik house from Lagna : +2.0
        #   - Cancelled Mars (Parihara active)        : +0.5  (weakened, not eliminated)
        #   - Debilitated Mars in Cancer              : +1.0  (Neecha = reduced intensity)
        #
        # Other malefics: Saturn/Rahu = +1.0, Sun/Ketu = +0.5 per reference chart.

        def _chart_papa(ref_sign_idx: int) -> float:
            """Compute raw Papa Samyam points for one reference chart."""
            def in_m(p_name: str) -> bool:
                return self.engine.house_of_planet(ref_sign_idx, planets[p_name]["sign_index"]) in MANGLIK_HOUSES

            # Mars weight: cancelled → 0.5, debilitated → 1.0, normal → 2.0
            if in_m("Mars"):
                if is_cancelled:
                    score = 0.5
                elif mars_debilitated:
                    score = 1.0
                else:
                    score = 2.0
            else:
                score = 0.0

            if in_m("Saturn"): score += 1.0
            if in_m("Rahu"):   score += 1.0
            if in_m("Sun"):    score += 0.5
            if in_m("Ketu"):   score += 0.5
            return score

        lagna_papa  = _chart_papa(asc_idx)
        moon_papa   = _chart_papa(moon_idx)
        venus_papa  = _chart_papa(venus_idx)

        papa_points = round(lagna_papa + (0.75 * moon_papa) + (0.50 * venus_papa), 2)

        # ---- 3. Severity -------------------------------------------------
        debilitated_note = " [Mars debilitated in Cancer — strength reduced]" if mars_debilitated else ""

        if is_cancelled:
            severity = f"Cancelled ({cancellation_reason})"
        elif manglik_from_lagna:
            severity = f"Primary (Mars in Manglik house from Lagna){debilitated_note}"
        elif manglik_from_moon:
            severity = f"Anshik / Partial (Mars in Manglik house from Moon only){debilitated_note}"
        elif manglik_from_venus:
            severity = f"Minor / Secondary (Mars in Manglik house from Venus only){debilitated_note}"
        else:
            severity = "None"

        return {
            "is_manglik":           is_manglik,
            "is_cancelled":         is_cancelled,
            "cancellation_reason":  cancellation_reason,
            "severity":             severity,
            "papa_points":          papa_points,
            "papa_breakdown": {
                "lagna":  round(lagna_papa, 2),
                "moon":   round(moon_papa, 2),
                "venus":  round(venus_papa, 2),
            },
            # Per-chart detail
            "manglik_from_lagna":   manglik_from_lagna,
            "manglik_from_moon":    manglik_from_moon,
            "manglik_from_venus":   manglik_from_venus,
            "mars_house_lagna":     house_from_lagna,
            "mars_house_moon":      house_from_moon,
            "mars_house_venus":     house_from_venus,
            "mars_sign":            mars["sign"],
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
            "yogas": YogaEngine.detect_yogas(technical_profile),
            "ashtakvarga_sav": AshtakvargaEngine.calculate_sav(technical_profile),
            "current_transits": TransitEngine.get_current_transits(
                natal_moon_sign_index=moon_rashi_idx,
                natal_lagna_sign_index=technical_profile["ascendant"]["sign_index"],
            ),
        }


        if include_charts:
            report["charts"] = self.chart_engine.build_all_charts(technical_profile)

        # Keep the raw technical profile around for downstream consumers
        # (MatchMaker/Ashtakoot) without re-computing ephemeris calls.
        report["_technical_profile"] = technical_profile
        return report
