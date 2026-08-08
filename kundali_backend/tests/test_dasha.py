import pytest
from app.dasha import VimshottariCalculator

def test_initial_dasha_lord_mapping():
    # Ashwini (0) -> Ketu (7)
    dashas = VimshottariCalculator.calculate_dashas("2000-01-01T00:00:00+00:00", 0.0, 0)
    assert dashas[0]["planet"] == "Ketu"
    assert dashas[0]["total_years"] == 7.0
    
    # Bharani (1) -> Venus (20)
    dashas = VimshottariCalculator.calculate_dashas("2000-01-01T00:00:00+00:00", 13.333333333333334, 1)
    assert dashas[0]["planet"] == "Venus"
    assert dashas[0]["total_years"] == 20.0
    
    # Revati (26) -> Mercury (17)
    dashas = VimshottariCalculator.calculate_dashas("2000-01-01T00:00:00+00:00", 346.6666666666667, 26)
    assert dashas[0]["planet"] == "Mercury"
    assert abs(dashas[0]["total_years"] - 17.0) < 0.001

def test_fractional_balance_calculation():
    # Halfway through Ashwini (6 degrees 40 minutes = 6.666666 degrees)
    # Remaining fraction should be 0.5
    # Balance of Ketu should be 3.5 years
    dashas = VimshottariCalculator.calculate_dashas("2000-01-01T00:00:00+00:00", 6.666666666666667, 0)
    assert dashas[0]["planet"] == "Ketu"
    assert abs(dashas[0]["total_years"] - 3.5) < 0.001
    
    # Exactly at the end of Ashwini (13 degrees 20 minutes)
    # Remaining fraction should be 0.0
    # Balance of Ketu should be 0.0 years
    # (Note: realistically moon_nakshatra_index would be 1 if it hits 13.3333 exactly, 
    # but testing the math boundary here)
    dashas = VimshottariCalculator.calculate_dashas("2000-01-01T00:00:00+00:00", 13.333333333333332, 0)
    assert dashas[0]["planet"] == "Ketu"
    assert dashas[0]["total_years"] < 0.001

def test_date_projection_and_total_duration():
    # Start at year 2000
    dashas = VimshottariCalculator.calculate_dashas("2000-01-01T12:00:00+00:00", 0.0, 0)
    
    assert len(dashas) == 9
    
    # Total years should sum exactly to 120
    total_years = sum(d["total_years"] for d in dashas)
    assert abs(total_years - 120.0) < 0.001
    
    # The final end date should be in year 2120
    final_end_date = dashas[-1]["end_date"]
    assert final_end_date.startswith("2120-")
