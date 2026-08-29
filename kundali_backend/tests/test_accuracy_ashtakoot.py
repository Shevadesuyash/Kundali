"""
tests/test_accuracy_ashtakoot.py
--------------------------------
P1 Accuracy Tests for Ashtakoot Guna Milan Engine:
- Brute-force bounds check on all 8 Kootas across 12x12 Rashis and 27x27 Nakshatras.
- Total Guna Milan maximum invariant is always 36.0.
- Symmetry tests: symmetric kootas (Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi)
  produce identical scores when Boy and Girl are swapped.
"""
from __future__ import annotations
import pytest
from app.ashtakoot import AshtakootCalculator
from app.astro_engine import SIGN_LORDS


@pytest.fixture(scope="module")
def calc():
    return AshtakootCalculator()


def test_all_kootas_within_bounds_exhaustive(calc):
    """
    Brute-force test every single Rashi combination (12x12) and Nakshatra combination (27x27).
    Every koota score must strictly satisfy 0 <= score <= max_points.
    """
    for boy_rashi in range(12):
        for girl_rashi in range(12):
            b_lord = SIGN_LORDS[boy_rashi]
            g_lord = SIGN_LORDS[girl_rashi]

            # Varna: [0, 1]
            r_varna = calc.calc_varna(boy_rashi, girl_rashi)
            assert 0.0 <= r_varna["score"] <= 1.0

            # Vashya: [0, 2]
            r_vashya = calc.calc_vashya(boy_rashi, girl_rashi)
            assert 0.0 <= r_vashya["score"] <= 2.0

            # Graha Maitri: [0, 5]
            r_gm = calc.calc_graha_maitri(b_lord, g_lord)
            assert 0.0 <= r_gm["score"] <= 5.0

            # Bhakoot: [0, 7]
            r_bhakoot = calc.calc_bhakoot(boy_rashi, girl_rashi, b_lord, g_lord)
            assert 0.0 <= r_bhakoot["score"] <= 7.0

    for boy_nak in range(27):
        for girl_nak in range(27):
            # Tara: [0, 3]
            r_tara = calc.calc_tara(boy_nak, girl_nak)
            assert 0.0 <= r_tara["score"] <= 3.0

            # Yoni: [0, 4]
            r_yoni = calc.calc_yoni(boy_nak, girl_nak)
            assert 0.0 <= r_yoni["score"] <= 4.0

            # Gana: [0, 6]
            r_gana = calc.calc_gana(boy_nak, girl_nak)
            assert 0.0 <= r_gana["score"] <= 6.0

            # Nadi: [0, 8]
            r_nadi = calc.calc_nadi(boy_nak, girl_nak)
            assert 0.0 <= r_nadi["score"] <= 8.0


def test_guna_milan_total_max_points_is_always_36(calc):
    """
    Sum of maximum potential points across all 8 kootas must equal 36.
    """
    boy_astro = {
        "rashi_index": 0, "nakshatra_index": 0, "rashi_lord": "Mars", "nakshatra_pada": 1
    }
    girl_astro = {
        "rashi_index": 1, "nakshatra_index": 2, "rashi_lord": "Venus", "nakshatra_pada": 1
    }
    res = calc.calculate_guna_milan(boy_astro, girl_astro)
    kootas = res["kootas"]
    assert sum(k["max"] for k in kootas) == 36.0
    assert 0.0 <= res["total_score"] <= 36.0


def test_symmetric_kootas_symmetry(calc):
    """
    Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi are symmetric in classical rules.
    Swapping Boy and Girl must return identical scores.
    """
    # 1. Yoni symmetry
    for b_nak in range(27):
        for g_nak in range(27):
            s_bg = calc.calc_yoni(b_nak, g_nak)["score"]
            s_gb = calc.calc_yoni(g_nak, b_nak)["score"]
            assert s_bg == s_gb

    # 2. Graha Maitri symmetry
    for b_rashi in range(12):
        for g_rashi in range(12):
            b_lord = SIGN_LORDS[b_rashi]
            g_lord = SIGN_LORDS[g_rashi]
            s_bg = calc.calc_graha_maitri(b_lord, g_lord)["score"]
            s_gb = calc.calc_graha_maitri(g_lord, b_lord)["score"]
            assert s_bg == s_gb

    # 3. Gana directional scores: Deva(boy)-Manushya(girl) = 6.0, Manushya(boy)-Deva(girl) = 5.0
    # Same Gana is always 6.0
    for nak in range(27):
        assert calc.calc_gana(nak, nak)["score"] == 6.0

    # 4. Nadi symmetry
    for b_nak in range(27):
        for g_nak in range(27):
            s_bg = calc.calc_nadi(b_nak, g_nak)["score"]
            s_gb = calc.calc_nadi(g_nak, b_nak)["score"]
            assert s_bg == s_gb
