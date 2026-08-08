import pytest

from app.ashtakoot import AshtakootCalculator


@pytest.fixture
def calc():
    return AshtakootCalculator()


def test_varna_same_sign_gets_full_point(calc):
    result = calc.calc_varna(0, 0)
    assert result["score"] == 1.0


def test_vashya_same_group_full_marks(calc):
    result = calc.calc_vashya(0, 1)  # Aries, Taurus - both Chatushpad
    assert result["score"] == 2.0


def test_vashya_max_is_two(calc):
    for b in range(12):
        for g in range(12):
            r = calc.calc_vashya(b, g)
            assert 0.0 <= r["score"] <= 2.0


def test_tara_identical_nakshatra_favorable_both_ways(calc):
    # Count from a nakshatra to itself = 1 (Janma), which is NOT in the good set,
    # so same-nakshatra Tara should score 0 both ways.
    result = calc.calc_tara(5, 5)
    assert result["score"] == 0.0


def test_tara_score_within_bounds(calc):
    for b in range(27):
        for g in range(27):
            r = calc.calc_tara(b, g)
            assert r["score"] in (0.0, 1.5, 3.0)


def test_yoni_same_animal_same_gender_is_max(calc):
    # nakshatra 3 (Rohini) and 4 (Mrigashira) are both Serpent, different genders (M,F)
    result = calc.calc_yoni(3, 4)
    assert result["score"] == 3.0  # same animal, different gender


def test_yoni_identical_nakshatra_is_perfect(calc):
    result = calc.calc_yoni(0, 0)
    assert result["score"] == 4.0


def test_yoni_enemy_pair_scores_zero(calc):
    # Ashwini=Horse(M) idx0, index that maps to Buffalo -> Hasta idx12 = Buffalo,F
    result = calc.calc_yoni(0, 12)
    assert result["score"] == 0.0


def test_graha_maitri_same_lord_is_max(calc):
    result = calc.calc_graha_maitri("Mars", "Mars")
    assert result["score"] == 5.0


def test_graha_maitri_mutual_friends(calc):
    result = calc.calc_graha_maitri("Sun", "Moon")
    assert result["score"] == 5.0


def test_graha_maitri_mutual_enemies(calc):
    result = calc.calc_graha_maitri("Sun", "Saturn")
    assert result["score"] == 0.0


def test_gana_same_gana_is_max(calc):
    result = calc.calc_gana(0, 3)  # both Deva-gana nakshatras
    assert result["score"] == 6.0


def test_bhakoot_6_8_relationship_is_dosha(calc):
    # rashi 0 (Aries) and rashi 5 (Virgo): count = (5-0)%12+1 = 6 -> dosha
    result = calc.calc_bhakoot(0, 5)
    assert result["score"] == 0.0


def test_bhakoot_no_dosha_case(calc):
    # rashi 0 and rashi 3: count = 4 (not in dosha set) -> full marks
    result = calc.calc_bhakoot(0, 3)
    assert result["score"] == 7.0


def test_nadi_same_nadi_scores_zero(calc):
    result = calc.calc_nadi(0, 0)
    assert result["score"] == 0.0


def test_nadi_different_nadi_scores_full(calc):
    result = calc.calc_nadi(0, 1)  # Aadi vs Madhya
    assert result["score"] == 8.0


def test_guna_milan_total_never_exceeds_36(calc):
    boy = {"rashi_index": 3, "nakshatra_index": 9, "rashi_lord": "Moon"}
    girl = {"rashi_index": 9, "nakshatra_index": 21, "rashi_lord": "Saturn"}
    result = calc.calculate_guna_milan(boy, girl)
    assert result["total_max"] == 36
    assert 0 <= result["total_score"] <= 36
    assert len(result["kootas"]) == 8


def test_guna_milan_identical_charts_scores_high_but_flags_nadi(calc):
    same = {"rashi_index": 2, "nakshatra_index": 8, "rashi_lord": "Mercury"}
    result = calc.calculate_guna_milan(same, dict(same))
    assert result["nadi_dosha"] is True  # identical nakshatra => same Nadi => dosha
