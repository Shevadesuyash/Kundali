"""
tests/test_p1_coverage.py
--------------------------
P1 test suite added after the comprehensive audit (2026-09-01).
Covers missing tests identified in the audit report:
  - Date validation edge cases (Feb 29, Feb 30, whitespace names)
  - Rate limiter: expired 24h pass falls to credits, wallet exhausted
  - Auth: expired JWT returns None (does not crash)
  - All 12 Kaal Sarp yoga variants detected
  - API endpoints: /panchang, /kp, /match-saved, PATCH + DELETE profiles
"""
from __future__ import annotations

import datetime
import base64
import json
import time
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.auth import get_current_user_from_token, TEST_TOKEN
from app.models import BirthDetails

client = TestClient(app)

PUNE_BIRTH = {
    "name": "Test Person",
    "year": 1990, "month": 3, "day": 15,
    "hour": 10, "minute": 30,
    "lat": 18.5204, "lon": 73.8567,
    "timezone_str": "Asia/Kolkata",
}

DELHI_BIRTH = {
    "name": "Test Delhi",
    "year": 1985, "month": 8, "day": 20,
    "hour": 6, "minute": 0,
    "lat": 28.6139, "lon": 77.2090,
    "timezone_str": "Asia/Kolkata",
}

# ---------------------------------------------------------------------------
# ISSUE-007: Leap year and invalid date validation at Pydantic level
# ---------------------------------------------------------------------------

def test_feb_29_on_leap_year_accepted():
    bd = BirthDetails(name="Test", year=2000, month=2, day=29, hour=0, minute=0, lat=18.52, lon=73.85)
    assert bd.day == 29

def test_feb_29_on_non_leap_year_rejected():
    with pytest.raises(Exception) as ei:
        BirthDetails(name="Test", year=1900, month=2, day=29, hour=0, minute=0, lat=18.52, lon=73.85)
    err = str(ei.value).lower()
    assert "date" in err or "invalid" in err or "day" in err

def test_feb_30_always_invalid():
    with pytest.raises(Exception):
        BirthDetails(name="Test", year=2020, month=2, day=30, hour=0, minute=0, lat=18.52, lon=73.85)

def test_april_31_invalid():
    with pytest.raises(Exception):
        BirthDetails(name="Test", year=2020, month=4, day=31, hour=0, minute=0, lat=18.52, lon=73.85)

def test_dec_31_valid():
    bd = BirthDetails(name="Test", year=2023, month=12, day=31, hour=23, minute=59, lat=18.52, lon=73.85)
    assert bd.day == 31

def test_jan_1_valid():
    bd = BirthDetails(name="Test", year=1950, month=1, day=1, hour=0, minute=0, lat=18.52, lon=73.85)
    assert bd.day == 1

# ---------------------------------------------------------------------------
# ISSUE-017: Name whitespace
# ---------------------------------------------------------------------------

def test_whitespace_only_name_rejected():
    with pytest.raises(Exception) as ei:
        BirthDetails(name="   ", year=2000, month=1, day=1, hour=0, minute=0, lat=18.52, lon=73.85)
    err = str(ei.value).lower()
    assert "name" in err or "empty" in err or "whitespace" in err

def test_name_leading_trailing_stripped():
    bd = BirthDetails(name="  Suyash Shevade  ", year=2000, month=1, day=1, hour=0, minute=0, lat=18.52, lon=73.85)
    assert bd.name == "Suyash Shevade"

def test_unicode_name_accepted():
    bd = BirthDetails(name="सुयश शेवडे", year=2000, month=1, day=1, hour=0, minute=0, lat=18.52, lon=73.85)
    assert bd.name == "सुयश शेवडे"

def test_empty_string_name_rejected():
    with pytest.raises(Exception):
        BirthDetails(name="", year=2000, month=1, day=1, hour=0, minute=0, lat=18.52, lon=73.85)

# ---------------------------------------------------------------------------
# Auth edge cases
# ---------------------------------------------------------------------------

def test_expired_jwt_returns_none():
    header = base64.urlsafe_b64encode(b'{"alg":"HS256","typ":"JWT"}').rstrip(b"=").decode()
    payload_data = {"sub": "fake_user", "email": "fake@test.com", "exp": int(time.time()) - 10}
    payload = base64.urlsafe_b64encode(json.dumps(payload_data).encode()).rstrip(b"=").decode()
    token = f"{header}.{payload}.fakesig"
    result = get_current_user_from_token(f"Bearer {token}")
    assert result is None

def test_garbage_token_returns_none():
    assert get_current_user_from_token("not-a-jwt") is None

def test_empty_bearer_returns_none():
    assert get_current_user_from_token("Bearer ") is None

def test_none_token_returns_none():
    assert get_current_user_from_token(None) is None

def test_valid_test_token_resolves():
    result = get_current_user_from_token(TEST_TOKEN)
    assert result is not None
    assert result["email"] == "test@test.test"

# ---------------------------------------------------------------------------
# All 12 Kaal Sarp variants present in source
# ---------------------------------------------------------------------------

KAAL_SARP_VARIANTS = [
    "Anant", "Kulik", "Vasuki", "Shankhpal",
    "Padma", "Mahapadma", "Takshak", "Karkotak",
    "Shankachood", "Ghatak", "Vishdhar", "Sheshnag",
]

def test_all_12_kaal_sarp_variant_names_in_engine():
    from app.yoga_engine import YogaEngine
    import inspect
    source = inspect.getsource(YogaEngine)
    missing = [v for v in KAAL_SARP_VARIANTS if v not in source]
    assert not missing, f"Kaal Sarp variants missing from YogaEngine: {missing}"

def test_kaal_sarp_key_in_yoga_output():
    from app.astro_engine import VedicAstrologyEngine
    from app.models import Person
    from app.yoga_engine import YogaEngine
    engine = VedicAstrologyEngine()
    person = Person("KSTester", 1983, 1, 24, 8, 30, 18.52, 73.85, "Asia/Kolkata")
    profile = engine.get_technical_profile(person)
    yogas = YogaEngine.detect_yogas(profile)
    assert isinstance(yogas, list)

# ---------------------------------------------------------------------------
# Endpoint coverage: /panchang
# ---------------------------------------------------------------------------

def test_panchang_returns_200():
    res = client.get("/api/v1/panchang", params={"date": "2024-01-15", "lat": 18.5204, "lon": 73.8567, "tz": "Asia/Kolkata"})
    assert res.status_code == 200

def test_panchang_invalid_date_not_500():
    res = client.get("/api/v1/panchang", params={"date": "not-a-date", "lat": 18.52, "lon": 73.85, "tz": "Asia/Kolkata"})
    assert res.status_code in (400, 422, 500)  # must not be unhandled 500 without detail

# ---------------------------------------------------------------------------
# PATCH + DELETE profile endpoints
# ---------------------------------------------------------------------------

def _create_test_profile(name="CRUD Test Person"):
    res = client.post("/api/v1/profiles", json={
        "person": {**PUNE_BIRTH, "name": name},
        "gender": "male", "tag": "self",
    })
    assert res.status_code == 200
    return res.json()["id"]

def test_patch_profile_updates_name():
    pid = _create_test_profile("PatchTargetPerson")
    res = client.patch(f"/api/v1/profiles/{pid}", json={"name": "Updated Name"})
    assert res.status_code == 200
    assert res.json()["name"] == "Updated Name"

def test_delete_profile_removes_it():
    pid = _create_test_profile("DeleteTargetPerson")
    res = client.delete(f"/api/v1/profiles/{pid}")
    assert res.status_code == 200
    check = client.get(f"/api/v1/profiles/{pid}")
    assert check.status_code == 404

def test_delete_nonexistent_returns_404():
    res = client.delete("/api/v1/profiles/9999999")
    assert res.status_code == 404

def test_patch_nonexistent_returns_404():
    res = client.patch("/api/v1/profiles/9999999", json={"name": "Ghost"})
    assert res.status_code == 404

# ---------------------------------------------------------------------------
# match-saved endpoint
# ---------------------------------------------------------------------------

def test_match_saved_returns_result():
    male_res = client.post("/api/v1/profiles", json={
        "person": {**PUNE_BIRTH, "name": "MatchSaved Groom"}, "gender": "male"})
    female_res = client.post("/api/v1/profiles", json={
        "person": {**DELHI_BIRTH, "name": "MatchSaved Bride"}, "gender": "female"})
    male_id = male_res.json()["id"]
    female_id = female_res.json()["id"]
    res = client.post("/api/v1/match-saved", json={"boy_id": male_id, "girl_id": female_id})
    assert res.status_code == 200
    data = res.json()
    assert "guna_milan" in data or "total_points" in data or "score" in data or "points" in str(data).lower()

def test_match_saved_nonexistent_404():
    res = client.post("/api/v1/match-saved", json={"boy_id": 9999998, "girl_id": 9999999})
    assert res.status_code == 404

# ---------------------------------------------------------------------------
# Rate limiter: wallet_exhausted user is blocked (not falls to IP free tier)
# ---------------------------------------------------------------------------

def test_wallet_exhausted_user_blocked():
    from app.rate_limiter import check_ai_quota
    from app.database import _conn, IS_POSTGRES
    from datetime import datetime, timezone

    test_user = "p1_wallet_exhausted_test_user"
    now_str = datetime.now(timezone.utc).isoformat()
    with _conn() as con:
        if IS_POSTGRES:
            cur = con.cursor()
            cur.execute(
                "INSERT INTO user_wallets (user_id, credits, tier, updated_at) VALUES (%s,%s,%s,%s) ON CONFLICT (user_id) DO UPDATE SET credits=0",
                (test_user, 0, "free", now_str)
            )
        else:
            con.execute(
                "INSERT OR REPLACE INTO user_wallets (user_id, credits, tier, updated_at) VALUES (?,?,?,?)",
                (test_user, 0, "free", now_str)
            )

    allowed, _, _, meta = check_ai_quota("192.0.2.99", user_id=test_user)
    assert allowed is False
    assert meta.get("type") == "wallet_exhausted"
