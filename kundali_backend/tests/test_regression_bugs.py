"""
tests/test_regression_bugs.py
------------------------------
Regression tests for issues found in the Kundali accuracy audit.

Each test documents WHICH bug it guards, and is written so it FAILS on the
current (buggy) code and PASSES once the corresponding fix from the roadmap
is applied. Drop this file into kundali_backend/tests/ and run:

    pytest tests/test_regression_bugs.py -v

Do not "fix" a failing test by loosening its assertion — a failure here means
the underlying bug is still present in app/ code, not that the test is wrong.
"""
from __future__ import annotations

import pytest

from app.astro_engine import VedicAstrologyEngine
from app.models import Person
from app.gemstone_engine import GemstoneEngine
from app.yoga_engine import YogaEngine
from app.ashtakvarga_engine import AshtakvargaEngine, BPHS_BAV_RULES
from app.kundali_analyzer import KundaliAnalyzer
from app.panchang_engine import PanchangEngine


# ---------------------------------------------------------------------------
# Bug #1: lagna_sign_index is never populated on technical_profile, so
# yoga_engine / ashtakvarga_engine / gemstone_engine all silently default to
# Aries (sign_index 0) for every single chart.
# ---------------------------------------------------------------------------
class TestLagnaSignIndexPropagation:
    @pytest.fixture(scope="class")
    def engine(self):
        return VedicAstrologyEngine()

    @pytest.fixture(scope="class")
    def taurus_ascendant_profile(self, engine):
        # Verified via direct Swiss Ephemeris computation: Aug 15 1947, 00:00 IST,
        # New Delhi (28.6139N, 77.2090E) => Taurus ascendant (sign_index 1).
        person = Person("TestSubject", 1947, 8, 15, 0, 0, 28.6139, 77.2090, "Asia/Kolkata")
        return engine.get_technical_profile(person)

    def test_ascendant_is_actually_taurus_not_aries(self, taurus_ascendant_profile):
        # Sanity check on the fixture itself before testing anything downstream.
        assert taurus_ascendant_profile["ascendant"]["sign_index"] == 1  # Taurus

    def test_lagna_sign_index_key_matches_real_ascendant(self, taurus_ascendant_profile):
        """
        This is THE bug. technical_profile must expose a top-level
        'lagna_sign_index' equal to the real ascendant's sign_index.
        Currently this key doesn't exist at all, so .get(..., 0) elsewhere
        silently returns 0 (Aries) for every chart.
        """
        assert "lagna_sign_index" in taurus_ascendant_profile, (
            "technical_profile has no top-level 'lagna_sign_index' key — "
            "yoga_engine/ashtakvarga_engine/gemstone_engine are silently "
            "treating every ascendant as Aries."
        )
        assert (
            taurus_ascendant_profile["lagna_sign_index"]
            == taurus_ascendant_profile["ascendant"]["sign_index"]
        )

    def test_gemstone_life_stone_is_venus_not_mars(self, taurus_ascendant_profile):
        """
        Downstream proof: for a Taurus ascendant, the Life Stone's ruling
        planet must be Venus (Taurus's lord). If the lagna bug is present,
        this comes back as Mars (Aries's lord) instead -> Red Coral, not
        Diamond. (NOT Ruby/Sun -- that would be Leo's lord, a different
        mistake. Aries's lord is Mars.)
        """
        result = GemstoneEngine.recommend(taurus_ascendant_profile)
        life_stone = next(
            r for r in result["recommendations"]
            if r["category"].startswith("Life Stone")
        )
        assert life_stone["ruling_planet"] == "Venus", (
            f"Life Stone ruling planet was '{life_stone['ruling_planet']}' — "
            "expected Venus for a Taurus ascendant. If this is 'Mars', the "
            "lagna_sign_index bug is still defaulting to Aries."
        )
        assert life_stone["primary_gemstone"] == "Diamond (Heera)"


# ---------------------------------------------------------------------------
# Bug #2: gemstone_engine.py reads planet_placement.get("dignity", "Neutral")
# but nothing in astro_engine.py ever sets a "dignity" key on a planet's
# dict -- so the debilitation contraindication warning never fires.
# ---------------------------------------------------------------------------
class TestGemstoneDignityField:
    def _synthetic_profile(self, mars_dignity: str | None):
        """Minimal synthetic technical_profile -- Aries ascendant, Mars as
        lagna lord, with a controllable dignity value on Mars."""
        mars_data = {
            "sign_index": 3,          # Cancer -- Mars's debilitation sign
            "house_from_lagna": 1,
            "retrograde": False,
        }
        if mars_dignity is not None:
            mars_data["dignity"] = mars_dignity
        return {
            "lagna_sign_index": 0,  # Aries -> lagna lord = Mars
            "planets": {
                "Mars": mars_data,
                "Sun": {"sign_index": 4, "house_from_lagna": 5, "retrograde": False},
                "Venus": {"sign_index": 6, "house_from_lagna": 7, "retrograde": False},
                "Saturn": {"sign_index": 9, "house_from_lagna": 10, "retrograde": False},
            },
        }

    def test_debilitated_mars_triggers_contraindication_when_dignity_is_set(self):
        """Control case: if 'dignity' IS present and says Debilitated, the
        warning correctly fires. Confirms the consuming logic itself is fine
        -- the bug is purely that the field is never populated upstream."""
        profile = self._synthetic_profile(mars_dignity="Debilitated")
        result = GemstoneEngine.recommend(profile)
        life_stone = next(r for r in result["recommendations"] if r["category"].startswith("Life Stone"))
        assert any("debilitated" in c.lower() for c in life_stone["contraindications"])

    def test_real_engine_output_has_dignity_populated(self):
        """
        The actual regression test: run a REAL chart through
        VedicAstrologyEngine (not the synthetic profile above) where Mars is
        known to be in Cancer (debilitated), and confirm the planets dict it
        produces actually contains a 'dignity' key. As of the audit, it does
        not -- astro_engine.py never writes this field, so this test fails
        until the fix (adding EXALTATION_SIGNS/DEBILITATION_SIGNS/OWN_SIGNS
        dignity assignment to get_technical_profile) is applied.
        """
        engine = VedicAstrologyEngine()
        # Any real birth chart works -- we just need to inspect the shape of
        # the planets dict that astro_engine.py actually produces.
        person = Person("TestSubject", 2000, 1, 1, 12, 0, 18.5204, 73.8567, "Asia/Kolkata")
        profile = engine.get_technical_profile(person)
        for planet_name, data in profile["planets"].items():
            assert "dignity" in data, (
                f"planets['{planet_name}'] has no 'dignity' key -- "
                "gemstone_engine's debilitation warning is dead code."
            )


# ---------------------------------------------------------------------------
# Bug #3: gemstone_engine.py reads .get("is_retrograde", False), but every
# other engine (astro_engine, chart_engine, transit_engine, varshapal_engine)
# names this field "retrograde" -- so it's always silently False in
# gemstone recommendations.
# ---------------------------------------------------------------------------
class TestGemstoneRetrogradeKeyMismatch:
    def test_retrograde_marker_appears_when_planet_dict_says_retrograde(self):
        profile = {
            "lagna_sign_index": 0,  # Aries -> lagna lord = Mars
            "planets": {
                "Mars": {
                    "sign_index": 0,
                    "house_from_lagna": 1,
                    "dignity": "Own Sign",
                    "retrograde": True,   # the field name every other engine uses
                },
                "Sun": {"sign_index": 4, "house_from_lagna": 5, "retrograde": False, "dignity": "Neutral"},
                "Venus": {"sign_index": 6, "house_from_lagna": 7, "retrograde": False, "dignity": "Neutral"},
                "Saturn": {"sign_index": 9, "house_from_lagna": 10, "retrograde": False, "dignity": "Neutral"},
            },
        }
        result = GemstoneEngine.recommend(profile)
        life_stone = next(r for r in result["recommendations"] if r["category"].startswith("Life Stone"))
        assert "℞" in life_stone["planet_placement"], (
            "Mars is marked retrograde=True in the input, but no ℞ marker "
            "appeared -- gemstone_engine is still reading the wrong key "
            "('is_retrograde' instead of 'retrograde')."
        )


# ---------------------------------------------------------------------------
# Bug #4: Manglik Dosha cancellation checks Jupiter's aspect distance against
# {4, 7, 9}. Jupiter's real classical special aspects are {5, 7, 9} -- 4 is
# Mars's aspect, not Jupiter's.
# ---------------------------------------------------------------------------
class TestManglikJupiterAspect:
    @pytest.fixture(scope="class")
    def analyzer(self):
        return KundaliAnalyzer(VedicAstrologyEngine())

    def _synthetic_profile(self, mars_sign_idx: int, jupiter_sign_idx: int):
        return {
            "planets": {
                "Mars": {"sign_index": mars_sign_idx, "sign": "TestSign"},
                "Ketu": {"sign_index": 5},
                "Jupiter": {"sign_index": jupiter_sign_idx, "sign": "TestSign"},
                "Venus": {"sign_index": 1},
                # check_manglik()'s Papa Samyam step also inspects Sun/Saturn/Rahu
                # via _chart_papa()'s in_m() helper -- these must be present or it
                # KeyErrors. Placed in a neutral, non-Manglik house (Gemini/idx 2)
                # from every reference chart so they don't interfere with the
                # Jupiter-aspect assertions this test is actually checking.
                "Sun": {"sign_index": 2},
                "Saturn": {"sign_index": 2},
                "Rahu": {"sign_index": 2},
            },
            "ascendant": {"sign_index": 0},   # Aries lagna
            "moon_sign_index": 2,             # Gemini moon (arbitrary, non-conflicting)
        }

    def test_jupiter_5th_aspect_cancels_dosha(self, analyzer):
        # Mars in Cancer (idx 3) -> house 4 from Aries lagna -> Manglik house.
        # Cancer is Mars's debilitation, NOT own/exaltation, so this isolates
        # the Jupiter-aspect cancellation path specifically.
        # Jupiter in Pisces (idx 11): aspect_dist = (3 - 11) % 12 + 1 = 5.
        profile = self._synthetic_profile(mars_sign_idx=3, jupiter_sign_idx=11)
        result = analyzer.check_manglik(profile)
        assert result["is_manglik"] is True  # baseline: Mars is in a Manglik house
        assert result["is_cancelled"] is True, (
            "Jupiter's 5th-house special aspect on Mars should cancel Manglik "
            "Dosha, but did not -- the aspect_dist check is still using "
            "{4, 7, 9} instead of {5, 7, 9}."
        )

    def test_jupiter_4th_aspect_does_not_cancel_dosha(self, analyzer):
        # Same Mars placement. Jupiter in Capricorn (idx 9):
        # aspect_dist = (3 - 9) % 12 + 1 = 7 -> that WOULD cancel (7th aspect
        # is universal to all planets), so instead pick a jupiter position
        # giving aspect_dist == 4 specifically, which is Mars's aspect, not
        # Jupiter's, and must NOT cancel.
        # aspect_dist = (mars_idx - jup_idx) % 12 + 1 == 4  =>  jup_idx = mars_idx + 9 (mod 12)
        # mars_idx=3 -> jup_idx = (3 - 3) % 12 = 0 ... solve properly:
        # (3 - jup_idx) % 12 == 3  =>  jup_idx = 0 (Aries)
        profile = self._synthetic_profile(mars_sign_idx=3, jupiter_sign_idx=0)
        result = analyzer.check_manglik(profile)
        assert result["is_manglik"] is True
        assert result["is_cancelled"] is False, (
            "A Jupiter position giving a 4th-house aspect on Mars should NOT "
            "cancel Manglik Dosha (4 is Mars's special aspect, not Jupiter's) "
            "-- but the code incorrectly cancelled it."
        )


# ---------------------------------------------------------------------------
# Bug #5: check_manglik()'s docstring/changelog promises a supplementary
# 'ketu_manglik' indicator ("Ketu is also checked from Lagna..."), and even
# assigns `ketu = planets["Ketu"]`, but never actually uses it or returns it.
# ---------------------------------------------------------------------------
class TestManglikKetuIndicatorPromised:
    def test_ketu_manglik_key_exists(self):
        analyzer = KundaliAnalyzer(VedicAstrologyEngine())
        profile = {
            "planets": {
                "Mars": {"sign_index": 0, "sign": "Aries"},
                "Ketu": {"sign_index": 0},   # Ketu conjunct Mars from Lagna -> should flag
                "Jupiter": {"sign_index": 6, "sign": "Libra"},
                "Venus": {"sign_index": 1},
                "Sun": {"sign_index": 2},
                "Saturn": {"sign_index": 2},
                "Rahu": {"sign_index": 2},
            },
            "ascendant": {"sign_index": 0},
            "moon_sign_index": 2,
        }
        result = analyzer.check_manglik(profile)
        assert "ketu_manglik" in result, (
            "check_manglik()'s own docstring says Ketu is checked as a "
            "supplementary indicator, but no 'ketu_manglik' key is returned "
            "-- the feature was never actually implemented (dead variable)."
        )


# ---------------------------------------------------------------------------
# Bug #6: panchang_engine.py labels a Nakshatra-span computation as
# "sun_sign"/"moon_sign" (implying a 30-degree Rashi), when it's actually
# indexing NAKSHATRA_NAMES with a 13d20' span.
# ---------------------------------------------------------------------------
class TestPanchangSignVsNakshatraNaming:
    def test_output_uses_nakshatra_keys_not_mislabeled_sign_keys(self):
        result = PanchangEngine.get_panchang(lat=18.5204, lon=73.8567, timezone_str="Asia/Kolkata")
        timings = result["sun_moon_timings"]
        assert "sun_sign" not in timings, (
            "'sun_sign' key is present but actually contains a Nakshatra "
            "name (13d20' span), not a real zodiac sign -- rename to "
            "'sun_nakshatra' or recompute using a 30-degree span."
        )
        assert "sun_nakshatra" in timings and "moon_nakshatra" in timings


# ---------------------------------------------------------------------------
# Bug #7: BPHS_BAV_RULES grand total should equal the classical Sarvashtakvarga
# checksum of 337. Currently sums to 338 -- Saturn's table totals 40 instead
# of the standard 39.
# ---------------------------------------------------------------------------
class TestAshtakvargaChecksum:
    def test_grand_total_bindus_equals_337(self):
        grand_total = sum(
            len(house_list)
            for planet_rules in BPHS_BAV_RULES.values()
            for house_list in planet_rules.values()
        )
        assert grand_total == 337, (
            f"BPHS_BAV_RULES sums to {grand_total}, not the classical "
            "Sarvashtakvarga total of 337. Cross-check each planet's row "
            "against your source text -- the per-planet breakdown test "
            "below will tell you which planet's table is off."
        )

    @pytest.mark.parametrize(
        "planet,expected_total",
        [
            ("Sun", 48), ("Moon", 49), ("Mars", 39), ("Mercury", 54),
            ("Jupiter", 56), ("Venus", 52), ("Saturn", 39),
        ],
    )
    def test_per_planet_bav_total_matches_classical_value(self, planet, expected_total):
        actual = sum(len(v) for v in BPHS_BAV_RULES[planet].values())
        assert actual == expected_total, (
            f"{planet}'s BAV rule table totals {actual}, expected {expected_total}. "
            f"One of its 8 reference lists (Sun/Moon/Mars/Mercury/Jupiter/"
            f"Venus/Saturn/Lagna) has an extra or missing house entry."
        )


# ---------------------------------------------------------------------------
# Bug #8 (part of #1): the Kendra-Trikona Rajayoga detector in yoga_engine.py
# uses the same broken lagna_sign_index default -- prove it actually reads
# the real ascendant by showing detection changes when it's supplied.
# ---------------------------------------------------------------------------
class TestYogaEngineUsesRealLagna:
    def _base_profile(self):
        # A profile where the 4th lord (Kendra) and 5th lord (Trikona) are
        # conjunct -- but which planets those ARE depends entirely on the
        # ascendant, which is exactly what this test is probing.
        return {
            "planets": {
                "Sun":     {"sign_index": 4,  "house_from_lagna": 1, "sign": "Leo (Simha)"},
                "Moon":    {"sign_index": 9,  "house_from_lagna": 6, "sign": "Capricorn (Makara)"},
                "Mars":    {"sign_index": 9,  "house_from_lagna": 6, "sign": "Capricorn (Makara)"},
                "Mercury": {"sign_index": 5,  "house_from_lagna": 2, "sign": "Virgo (Kanya)"},
                "Jupiter": {"sign_index": 8,  "house_from_lagna": 5, "sign": "Sagittarius (Dhanu)"},
                "Venus":   {"sign_index": 6,  "house_from_lagna": 3, "sign": "Libra (Tula)"},
                "Saturn":  {"sign_index": 9,  "house_from_lagna": 6, "sign": "Capricorn (Makara)"},
            },
        }

    def test_yoga_detection_differs_between_aries_and_capricorn_lagna(self):
        profile_aries = self._base_profile()
        profile_aries["lagna_sign_index"] = 0  # Aries

        profile_capricorn = self._base_profile()
        profile_capricorn["lagna_sign_index"] = 9  # Capricorn

        yogas_aries = {y["name"] for y in YogaEngine.detect_yogas(profile_aries)}
        yogas_capricorn = {y["name"] for y in YogaEngine.detect_yogas(profile_capricorn)}

        assert yogas_aries != yogas_capricorn, (
            "Detected yogas were identical for an Aries vs. Capricorn lagna "
            "on the same planet placements -- house-lordship-based yoga "
            "detection is not actually varying with the ascendant."
        )
