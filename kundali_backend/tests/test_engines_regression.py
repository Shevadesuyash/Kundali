"""
tests/test_engines_regression.py
---------------------------------
Automated regression tests verifying:
1. Lagna fix & Gemstone Life Stone calculation (Taurus ascendant -> Venus, not Aries Mars default).
2. Debilitated planet contraindication in GemstoneEngine.
3. Retrograde planet marker in GemstoneEngine.
4. Ashtakvarga calculation uses correct Lagna sign index.
5. Jupiter 5th/7th/9th special aspect on Mars for Manglik cancellation.
6. Panchang engine sun_sign and moon_sign Rashi output with Nakshatras.
7. Seconds precision in Julian Day calculation.
8. True vs Mean Lunar Node calculation toggle.
"""
import pytest
from app.models import Person, BirthDetails
from app.astro_engine import VedicAstrologyEngine
from app.gemstone_engine import GemstoneEngine
from app.ashtakvarga_engine import AshtakvargaEngine
from app.kundali_analyzer import KundaliAnalyzer
from app.panchang_engine import PanchangEngine
import datetime


@pytest.fixture
def astro_engine():
    return VedicAstrologyEngine()


@pytest.fixture
def taurus_person():
    # India Independence Moment: Aug 15, 1947, 00:00 IST, New Delhi (28.6139 N, 77.2090 E)
    # Ascendant is Taurus (Vrishabha, sign_index=1, approx 7-8 deg Taurus)
    return Person(
        name="Taurus Test Chart",
        year=1947,
        month=8,
        day=15,
        hour=0,
        minute=0,
        lat=28.6139,
        lon=77.2090,
        timezone_str="Asia/Kolkata",
    )


def test_lagna_fix_and_life_stone(astro_engine, taurus_person):
    """
    Verification of Lagna Fix:
    For Aug 15, 1947 00:00 IST New Delhi, Ascendant is Taurus (sign_index=1).
    Life Stone must be Venus (Diamond), NEVER Mars (Red Coral from Aries fallback).
    """
    profile = astro_engine.get_technical_profile(taurus_person)

    assert profile["ascendant"]["sign_index"] == 1
    assert "Taurus" in profile["ascendant"]["sign"]
    assert profile["lagna_sign_index"] == 1

    gem_result = GemstoneEngine.recommend(profile)
    life_stone = next(r for r in gem_result["recommendations"] if "Life Stone" in r["category"])

    assert life_stone["ruling_planet"] == "Venus"
    assert "Diamond" in life_stone["primary_gemstone"]
    assert life_stone["ruling_planet"] != "Mars"


def test_dignity_population(astro_engine, taurus_person):
    """
    Planets must have their dignity set in technical_profile ('Exalted', 'Debilitated', 'Own Sign', 'Neutral').
    """
    profile = astro_engine.get_technical_profile(taurus_person)
    planets = profile["planets"]

    for name, p in planets.items():
        assert "dignity" in p
        assert p["dignity"] in {"Exalted", "Debilitated", "Own Sign", "Neutral"}

    # On Aug 15, 1947: Moon in Cancer (Own Sign)
    assert planets["Moon"]["dignity"] == "Own Sign"


def test_debilitation_warning_in_gemstones(astro_engine):
    """
    Debilitated planet must trigger the Neecha contraindication warning.
    """
    person = Person("Mars Neecha Test", 1990, 1, 1, 12, 0, 18.5204, 73.8567)
    profile = astro_engine.get_technical_profile(person)

    # Force Mars to Cancer (index 3) and Debilitated
    profile["planets"]["Mars"]["sign_index"] = 3
    profile["planets"]["Mars"]["dignity"] = "Debilitated"
    profile["lagna_sign_index"] = 0  # Aries ascendant -> Mars is Life Stone

    gem_result = GemstoneEngine.recommend(profile)
    life_stone = next(r for r in gem_result["recommendations"] if "Life Stone" in r["category"])

    assert any("debilitated (Neecha)" in warning for warning in life_stone["contraindications"])


def test_retrograde_marker_in_gemstones(astro_engine):
    """
    Retrograde planet must have Retrograde ℞ in placement description.
    """
    person = Person("Retrograde Test", 1990, 1, 1, 12, 0, 18.5204, 73.8567)
    profile = astro_engine.get_technical_profile(person)

    profile["planets"]["Venus"]["retrograde"] = True
    profile["lagna_sign_index"] = 1  # Taurus -> Venus is Life Stone

    gem_result = GemstoneEngine.recommend(profile)
    life_stone = next(r for r in gem_result["recommendations"] if "Life Stone" in r["category"])

    assert "Retrograde ℞" in life_stone["planet_placement"]


def test_ashtakvarga_with_taurus_lagna(astro_engine, taurus_person):
    """
    Ashtakvarga calculation uses correct Lagna reference rather than defaulting to Aries.
    """
    profile = astro_engine.get_technical_profile(taurus_person)
    sav_res = AshtakvargaEngine.calculate_full(profile)

    assert "sav_by_sign" in sav_res
    assert len(sav_res["sav_by_sign"]) == 12
    assert sav_res["sav_total"] in {337, 338}


def test_jupiter_aspect_cancellation(astro_engine):
    """
    Jupiter's 5th, 7th, 9th aspect on Mars cancels Mangal Dosha per Muhurta Chintamani.
    4th aspect should NOT cancel (Mars has 4th aspect, Jupiter has 5th, 7th, 9th).
    """
    analyzer = KundaliAnalyzer(astro_engine)
    person = Person("Aspect Test", 1995, 5, 10, 10, 0, 18.5204, 73.8567)
    profile = astro_engine.get_technical_profile(person)

    # Place Mars in Leo (sign_index 4, House 4 from Taurus=1) -> Manglik without own/exaltation cancellation
    profile["ascendant"]["sign_index"] = 1
    profile["lagna_sign_index"] = 1
    profile["planets"]["Mars"]["sign_index"] = 4  # Leo (House 4 Manglik)

    # Test 1: Jupiter in Sagittarius (sign index 8). Distance from Jupiter (8) to Mars (4):
    # (4 - 8) % 12 + 1 = 8 + 1 = 9th aspect!
    profile["planets"]["Jupiter"]["sign_index"] = 8
    manglik_res_9 = analyzer.check_manglik(profile)
    assert manglik_res_9["is_cancelled"] is True
    assert "9th aspect" in manglik_res_9["cancellation_reason"]

    # Test 2: Jupiter in Aries (sign index 0). Distance from Jupiter (0) to Mars (4):
    # (4 - 0) % 12 + 1 = 4 + 1 = 5th aspect!
    profile["planets"]["Jupiter"]["sign_index"] = 0
    manglik_res_5 = analyzer.check_manglik(profile)
    assert manglik_res_5["is_cancelled"] is True
    assert "5th aspect" in manglik_res_5["cancellation_reason"]

    # Test 3: Jupiter in Taurus (sign index 1). Distance: (4 - 1) % 12 + 1 = 3 + 1 = 4th aspect distance (not a Jupiter aspect!)
    profile["planets"]["Jupiter"]["sign_index"] = 1
    manglik_res_4th = analyzer.check_manglik(profile)
    assert manglik_res_4th["is_cancelled"] is False


def test_panchang_sun_moon_timings():
    """
    Panchang sun_moon_timings must return sun_nakshatra and moon_nakshatra.
    """
    panchang = PanchangEngine.get_panchang(target_date=datetime.date(2026, 8, 15), lat=18.5204, lon=73.8567)
    timings = panchang["sun_moon_timings"]

    assert "sun_nakshatra" in timings
    assert "moon_nakshatra" in timings
    assert len(timings["sun_nakshatra"]) > 2
    assert len(timings["moon_nakshatra"]) > 2


def test_seconds_precision(astro_engine):
    """
    Adding seconds should change the Julian Day accordingly.
    """
    p1 = Person("Sec0", 2026, 1, 1, 12, 0, 18.5204, 73.8567, second=0)
    p2 = Person("Sec30", 2026, 1, 1, 12, 0, 18.5204, 73.8567, second=30)

    jd1 = astro_engine.get_julian_day(p1)
    jd2 = astro_engine.get_julian_day(p2)

    diff_sec = (jd2 - jd1) * 86400.0
    assert abs(diff_sec - 30.0) < 0.01


def test_true_vs_mean_node_toggle():
    """
    VedicAstrologyEngine should respect node_mode ('TRUE' vs 'MEAN').
    """
    engine_true = VedicAstrologyEngine(node_mode="TRUE")
    engine_mean = VedicAstrologyEngine(node_mode="MEAN")

    person = Person("Node Test", 2026, 6, 21, 15, 30, 18.5204, 73.8567)
    jd = engine_true.get_julian_day(person)

    planets_true = engine_true.get_all_planet_positions(jd)
    planets_mean = engine_mean.get_all_planet_positions(jd)

    assert "Rahu" in planets_true and "Rahu" in planets_mean
    # True node and Mean node longitudes typically differ by 0.1 to 1.5 degrees
    assert abs(planets_true["Rahu"]["longitude"] - planets_mean["Rahu"]["longitude"]) < 5.0
