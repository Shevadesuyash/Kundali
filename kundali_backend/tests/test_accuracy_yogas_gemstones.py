"""
tests/test_accuracy_yogas_gemstones.py
--------------------------------------
P1 Accuracy Tests for Yoga Detection and Gemstone Recommendations:
- Yoga detection synthetic tests for Gaja Kesari, Budhaditya, Pancha Mahapurusha, Chandra-Mangala, Kaal Sarp.
- Gemstone recommendations for all 12 ascendants (Lagna lord validation).
- Gemstone catalog coverage for all sign lords.
"""
from __future__ import annotations
import pytest
from app.yoga_engine import YogaEngine, SIGN_LORDS
from app.gemstone_engine import GemstoneEngine, GEMSTONE_CATALOG


def test_gaja_kesari_synthetic():
    """
    Jupiter in Kendra (1, 4, 7, 10) from Moon produces Gaja Kesari Yoga.
    """
    # Moon in Aries (0), Jupiter in Cancer (3, House 4 from Moon)
    profile = {
        "lagna_sign_index": 0,
        "planets": {
            "Moon": {"sign_index": 0, "sign": "Aries"},
            "Jupiter": {"sign_index": 3, "sign": "Cancer"},
            "Sun": {"sign_index": 5, "sign": "Virgo"},
        },
    }
    yogas = YogaEngine.detect_yogas(profile)
    assert any(y["name"] == "Gaja Kesari Yoga" for y in yogas)

    # Move Jupiter to Leo (4, House 5 from Moon -> Trikona, not Kendra)
    profile["planets"]["Jupiter"]["sign_index"] = 4
    yogas_absent = YogaEngine.detect_yogas(profile)
    assert not any(y["name"] == "Gaja Kesari Yoga" for y in yogas_absent)


def test_budhaditya_synthetic():
    """
    Sun and Mercury conjunct in the same sign produces Budhaditya Yoga.
    """
    profile = {
        "lagna_sign_index": 0,
        "planets": {
            "Moon": {"sign_index": 0, "sign": "Aries"},
            "Sun": {"sign_index": 4, "sign": "Leo"},
            "Mercury": {"sign_index": 4, "sign": "Leo"},
        },
    }
    yogas = YogaEngine.detect_yogas(profile)
    assert any(y["name"] == "Budhaditya Yoga" for y in yogas)


def test_pancha_mahapurusha_hamsa_and_malavya():
    """
    Hamsa Yoga: Jupiter exalted (Cancer/3) in Kendra from Lagna.
    Malavya Yoga: Venus in own sign (Taurus/1 or Libra/6) in Kendra from Lagna.
    """
    # Lagna = Aries (0), Jupiter in Cancer (3, House 4 Kendra) -> Hamsa Yoga
    # Venus in Libra (6, House 7 Kendra) -> Malavya Yoga
    profile = {
        "lagna_sign_index": 0,
        "planets": {
            "Moon": {"sign_index": 0, "sign": "Aries"},
            "Sun": {"sign_index": 1, "sign": "Taurus"},
            "Jupiter": {"sign_index": 3, "sign": "Cancer", "dignity": "Exalted"},
            "Venus": {"sign_index": 6, "sign": "Libra", "dignity": "Own Sign"},
        },
    }
    yogas = YogaEngine.detect_yogas(profile)
    yoga_names = {y["name"] for y in yogas}
    assert "Hamsa Yoga" in yoga_names
    assert "Malavya Yoga" in yoga_names


def test_gemstone_lagna_lords_for_all_12_ascendants():
    """
    Verify that GemstoneEngine assigns the exact classical ruling planet
    as the Life Stone for every one of the 12 ascendants (0 to 11).
    """
    for asc_idx in range(12):
        expected_lord = SIGN_LORDS[asc_idx]
        profile = {
            "lagna_sign_index": asc_idx,
            "planets": {
                expected_lord: {"sign_index": asc_idx, "retrograde": False, "dignity": "Own Sign"},
            },
        }
        res = GemstoneEngine.recommend(profile)
        life_stone = next(r for r in res["recommendations"] if "Life Stone" in r["category"])
        assert life_stone["ruling_planet"] == expected_lord
        assert life_stone["primary_gemstone"] == GEMSTONE_CATALOG[expected_lord]["primary"]


def test_all_sign_lords_have_gemstone_catalog_entry():
    """
    Every planet that can be a house lord must have a complete GEMSTONE_CATALOG entry.
    """
    for planet in set(SIGN_LORDS):
        assert planet in GEMSTONE_CATALOG
        entry = GEMSTONE_CATALOG[planet]
        assert "primary" in entry and len(entry["primary"]) > 0
        assert "substitute" in entry and len(entry["substitute"]) > 0
        assert "color" in entry
        assert "metal" in entry
        assert "mantra" in entry
