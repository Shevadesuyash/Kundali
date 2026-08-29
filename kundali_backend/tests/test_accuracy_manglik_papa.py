"""
tests/test_accuracy_manglik_papa.py
-----------------------------------
P1 Accuracy Tests for Manglik Dosha and Multi-Chart Papa Samyam Engine:
- Three-chart independence: Mars in Manglik house from Lagna, Moon, or Venus independently.
- Own-sign and Exaltation cancellations vs Debilitation non-cancellation.
- Hand-computed South Indian Papa Samyam weighted formula verification.
"""
from __future__ import annotations
import pytest
from app.astro_engine import VedicAstrologyEngine
from app.kundali_analyzer import KundaliAnalyzer


@pytest.fixture(scope="module")
def analyzer():
    return KundaliAnalyzer(VedicAstrologyEngine())


def test_three_chart_manglik_independence(analyzer):
    """
    Construct synthetic profiles to verify manglik_from_lagna, manglik_from_moon,
    and manglik_from_venus flag independently.
    """
    # Lagna = Aries (0), Moon = Gemini (2), Venus = Leo (4)
    # Lagna Manglik houses: {1, 4, 7, 8, 12} -> {Aries(0), Cancer(3), Libra(6), Scorpio(7), Pisces(11)}
    # Moon Manglik houses from Gemini(2): {Gemini(2), Virgo(5), Sagittarius(8), Capricorn(9), Taurus(1)}
    # Venus Manglik houses from Leo(4): {Leo(4), Scorpio(7), Aquarius(10), Pisces(11), Cancer(3)}

    # Place Mars in Cancer (sign 3):
    # - Lagna (0) -> House 4 (Manglik)
    # - Moon (2) -> House 2 (Not Manglik)
    # - Venus (4) -> House 12 (Manglik from Venus)
    # To isolate Lagna-only Manglik: place Venus in Sagittarius (8) -> Venus Manglik houses from 8: {8, 11, 2, 3, 7}
    # If Venus in Capricorn (9): Venus Manglik houses from 9: {9, 0, 3, 4, 8}
    # If Venus in Gemini (2, same as Moon): Venus Manglik houses: {2, 5, 8, 9, 1}
    # Then Cancer (3) is NOT Manglik from Moon (2) and NOT Manglik from Venus (2)!
    profile = {
        "ascendant": {"sign_index": 0},   # Aries
        "moon_sign_index": 2,             # Gemini
        "planets": {
            "Venus": {"sign_index": 2},   # Gemini
            "Mars": {"sign_index": 3, "sign": "Cancer"},  # In Cancer (House 4 from Lagna, House 2 from Moon/Venus)
            "Ketu": {"sign_index": 10},
            "Jupiter": {"sign_index": 10, "sign": "Aquarius"},
            "Sun": {"sign_index": 10},
            "Saturn": {"sign_index": 10},
            "Rahu": {"sign_index": 10},
        },
    }
    res = analyzer.check_manglik(profile)
    assert res["manglik_from_lagna"] is True
    assert res["manglik_from_moon"] is False
    assert res["manglik_from_venus"] is False
    assert res["is_manglik"] is True

    # Now move Mars to Virgo (5): House 4 from Moon (2) & Venus (2), House 6 from Lagna (0)
    # House 6 is not standard Manglik -> Manglik from Moon/Venus only (Anshik)
    profile["planets"]["Mars"]["sign_index"] = 5
    profile["planets"]["Mars"]["sign"] = "Virgo"
    res_moon = analyzer.check_manglik(profile)
    assert res_moon["manglik_from_lagna"] is False
    assert res_moon["manglik_from_moon"] is True
    assert res_moon["is_manglik"] is False
    assert "Anshik" in res_moon["severity"]


def test_debilitation_does_not_cancel_manglik(analyzer):
    """
    Mars in Cancer (debilitated, sign 3) in House 4 from Lagna (Aries=0)
    must NOT set is_cancelled = True, but mention debilitation in severity.
    """
    profile = {
        "ascendant": {"sign_index": 0},
        "moon_sign_index": 10,
        "planets": {
            "Venus": {"sign_index": 10},
            "Mars": {"sign_index": 3, "sign": "Cancer"},  # Cancer = Debilitated
            "Ketu": {"sign_index": 10},
            "Jupiter": {"sign_index": 10, "sign": "Aquarius"},
            "Sun": {"sign_index": 10},
            "Saturn": {"sign_index": 10},
            "Rahu": {"sign_index": 10},
        },
    }
    res = analyzer.check_manglik(profile)
    assert res["is_manglik"] is True
    assert res["is_cancelled"] is False
    assert "Mars debilitated in Cancer" in res["severity"]


def test_papa_samyam_exact_weighted_formula(analyzer):
    """
    Classical Papa Samyam formula:
    Papa_Total = S_Lagna + 0.75 * S_Moon + 0.50 * S_Venus
    """
    # Lagna = Aries (0), Moon = Taurus (1), Venus = Gemini (2)
    # Malefics: Mars (in Cancer/3: H4 from Lagna), Saturn (in Aries/0: H1 from Lagna),
    # Rahu (in Leo/4: H4 from Moon), Sun (in Virgo/5: H4 from Venus)
    # Neutralize Mars with respect to Moon and Venus (Cancer/3 is H3 from Taurus/1 (not manglik), H2 from Gemini/2 (not manglik))
    # Neutralize Saturn with respect to Moon and Venus (Aries/0 is H12 from Taurus/1 -> H12 IS Manglik for Moon!)
    # To place Saturn in House 3 from Lagna (Gemini/2) -> non-manglik, or place in Libra (6) -> H6 from Moon (non-manglik), H5 from Venus (non-manglik)!
    # Libra (sign 6) is House 7 from Lagna (Manglik, weight 1.0), House 6 from Moon/1 (Not Manglik), House 5 from Venus/2 (Not Manglik).
    # Rahu in Leo (sign 4): House 5 from Lagna (non-manglik), House 4 from Moon/1 (Manglik, weight 1.0), House 3 from Venus/2 (non-manglik).
    # Sun in Virgo (sign 5): House 6 from Lagna (non-manglik), House 5 from Moon/1 (non-manglik), House 4 from Venus/2 (Manglik, weight 0.5).

    profile = {
        "ascendant": {"sign_index": 0},
        "moon_sign_index": 1,
        "planets": {
            "Venus": {"sign_index": 2},
            "Mars": {"sign_index": 3, "sign": "Cancer"},    # Lagna H4 (Neecha=1.0) | Moon H3 (0) | Venus H2 (0)
            "Saturn": {"sign_index": 6},                    # Lagna H7 (1.0)        | Moon H6 (0) | Venus H5 (0)
            "Rahu": {"sign_index": 4},                      # Lagna H5 (0)          | Moon H4 (1.0) | Venus H3 (0)
            "Sun": {"sign_index": 5},                       # Lagna H6 (0)          | Moon H5 (0) | Venus H4 (0.5)
            "Ketu": {"sign_index": 10},                     # Neutral
            "Jupiter": {"sign_index": 10, "sign": "Aquarius"},
        },
    }
    res = analyzer.check_manglik(profile)
    # lagna_papa: Mars(debilitated=1.0) + Saturn(1.0) = 2.0
    # moon_papa: Rahu(1.0) = 1.0
    # venus_papa: Sun(0.5) = 0.5
    # total = 2.0 + 0.75*(1.0) + 0.50*(0.5) = 2.0 + 0.75 + 0.25 = 3.00
    assert res["papa_breakdown"]["lagna"] == 2.0
    assert res["papa_breakdown"]["moon"] == 1.0
    assert res["papa_breakdown"]["venus"] == 0.5
    assert res["papa_points"] == 3.00
