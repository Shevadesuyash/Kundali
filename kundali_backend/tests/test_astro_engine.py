import pytest

from app.astro_engine import VedicAstrologyEngine
from app.models import Person


@pytest.fixture(scope="module")
def engine():
    return VedicAstrologyEngine()


@pytest.fixture
def sample_person():
    # Pune coordinates, matches the original notebook's test data
    return Person("Sunita", 1982, 7, 20, 5, 5, 17.0, 74.0)


def test_julian_day_is_positive_float(engine, sample_person):
    jd = engine.get_julian_day(sample_person)
    assert isinstance(jd, float)
    assert jd > 2400000  # any 20th/21st century JD is well above this


def test_technical_profile_has_all_nine_grahas(engine, sample_person):
    profile = engine.get_technical_profile(sample_person)
    expected = {"Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"}
    assert set(profile["planets"].keys()) == expected


def test_ketu_is_exactly_180_degrees_from_rahu(engine, sample_person):
    profile = engine.get_technical_profile(sample_person)
    rahu = profile["planets"]["Rahu"]["longitude"]
    ketu = profile["planets"]["Ketu"]["longitude"]
    diff = abs((rahu - ketu) % 360)
    assert diff == pytest.approx(180.0, abs=1e-6) or diff == pytest.approx(0, abs=1e-6)


def test_rashi_index_boundaries(engine):
    assert engine.rashi_index(0.0) == 0
    assert engine.rashi_index(29.999) == 0
    assert engine.rashi_index(30.0) == 1
    assert engine.rashi_index(359.999) == 11


def test_nakshatra_pada_bounds(engine):
    nak_idx, pada = engine.nakshatra_pada(0.0)
    assert nak_idx == 0
    assert pada == 1
    nak_idx, pada = engine.nakshatra_pada(359.999)
    assert nak_idx == 26
    assert 1 <= pada <= 4


@pytest.mark.parametrize("sign_idx", range(12))
def test_navamsa_sign_index_always_in_range(engine, sign_idx):
    for degree in [0.0, 5.5, 14.9, 29.99]:
        d9 = engine.navamsa_sign_index(sign_idx, degree)
        assert 0 <= d9 <= 11


def test_house_of_planet_ascendant_house_is_one(engine):
    assert engine.house_of_planet(asc_sign_idx=3, planet_sign_idx=3) == 1
    assert engine.house_of_planet(asc_sign_idx=3, planet_sign_idx=4) == 2
    assert engine.house_of_planet(asc_sign_idx=3, planet_sign_idx=2) == 12


def test_invalid_calendar_date_raises():
    from app.models import BirthDetails
    with pytest.raises(ValueError):
        BirthDetails(
            name="X", year=2000, month=2, day=30, hour=10, minute=0, lat=0, lon=0
        ).to_person()


def test_unknown_timezone_raises():
    with pytest.raises(ValueError):
        Person("X", 2000, 1, 1, 10, 0, 0, 0, timezone_str="Not/ARealZone")
