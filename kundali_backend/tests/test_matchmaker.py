import pytest

from app.matchmaker import MatchMaker
from app.models import Person


@pytest.fixture(scope="module")
def matchmaker():
    return MatchMaker()


@pytest.fixture
def boy():
    return Person("Saurabh", 1997, 8, 15, 4, 17, 18.5204, 73.8567)


@pytest.fixture
def girl():
    return Person("Apurva", 2000, 8, 29, 4, 0, 16.9125, 74.1358)


def test_match_profiles_returns_expected_top_level_keys(matchmaker, boy, girl):
    result = matchmaker.match_profiles(boy, girl)
    assert set(result.keys()) == {"boy", "girl", "manglik_analysis", "guna_milan"}


def test_match_profiles_no_leaked_internal_technical_profile(matchmaker, boy, girl):
    result = matchmaker.match_profiles(boy, girl)
    assert "_technical_profile" not in result["boy"]
    assert "_technical_profile" not in result["girl"]


def test_guna_milan_score_in_valid_range(matchmaker, boy, girl):
    result = matchmaker.match_profiles(boy, girl)
    score = result["guna_milan"]["total_score"]
    assert 0 <= score <= 36


def test_manglik_analysis_has_combined_verdict(matchmaker, boy, girl):
    result = matchmaker.match_profiles(boy, girl)
    assert "combined_verdict" in result["manglik_analysis"]
    assert isinstance(result["manglik_analysis"]["combined_verdict"], str)


def test_charts_omitted_by_default(matchmaker, boy, girl):
    result = matchmaker.match_profiles(boy, girl, include_charts=False)
    assert "charts" not in result["boy"]


def test_charts_included_when_requested(matchmaker, boy, girl):
    result = matchmaker.match_profiles(boy, girl, include_charts=True)
    assert "charts" in result["boy"]
    assert "D1_lagna" in result["boy"]["charts"]
    assert len(result["boy"]["charts"]["D1_lagna"]) == 12
