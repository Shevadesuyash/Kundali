import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

VALID_PERSON = {
    "name": "Sunita", "year": 1982, "month": 7, "day": 20,
    "hour": 5, "minute": 5, "lat": 17.0, "lon": 74.0,
    "timezone_str": "Asia/Kolkata",
}

VALID_BOY = {
    "name": "Saurabh", "year": 1997, "month": 8, "day": 15,
    "hour": 4, "minute": 17, "lat": 18.5204, "lon": 73.8567,
}

VALID_GIRL = {
    "name": "Apurva", "year": 2000, "month": 8, "day": 29,
    "hour": 4, "minute": 0, "lat": 16.9125, "lon": 74.1358,
}


def test_health_check():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_kundali_endpoint_success():
    resp = client.post("/api/v1/kundali", json={"person": VALID_PERSON})
    assert resp.status_code == 200
    body = resp.json()
    assert body["profile"]["name"] == "Sunita"
    assert "ascendant" in body
    assert "manglik_dosha" in body
    assert "charts" in body
    assert "_technical_profile" not in body  # internal field must not leak


def test_kundali_endpoint_invalid_date_returns_422():
    """Feb 30 is invalid — Pydantic model_validator raises 422 Unprocessable Entity."""
    bad_person = dict(VALID_PERSON, month=2, day=30)
    resp = client.post("/api/v1/kundali", json={"person": bad_person})
    assert resp.status_code == 422  # Pydantic model_validator returns 422 (standard FastAPI)


def test_kundali_endpoint_out_of_range_hour_returns_422():
    bad_person = dict(VALID_PERSON, hour=27)
    resp = client.post("/api/v1/kundali", json={"person": bad_person})
    assert resp.status_code == 422  # Pydantic validation


def test_kundali_endpoint_no_ai_reading_key_when_not_requested():
    resp = client.post("/api/v1/kundali", json={"person": VALID_PERSON})
    assert "ai_reading" not in resp.json()


def test_kundali_endpoint_ai_reading_degrades_gracefully_without_api_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    resp = client.post(
        "/api/v1/kundali", json={"person": VALID_PERSON, "include_ai_reading": True}
    )
    assert resp.status_code == 200
    assert resp.json()["ai_reading"] is None


def test_match_endpoint_success():
    resp = client.post("/api/v1/match", json={"boy": VALID_BOY, "girl": VALID_GIRL})
    assert resp.status_code == 200
    body = resp.json()
    assert "guna_milan" in body
    assert 0 <= body["guna_milan"]["total_score"] <= 36
    assert "manglik_analysis" in body


def test_match_endpoint_invalid_timezone_returns_400():
    bad_girl = dict(VALID_GIRL, timezone_str="Not/AZone")
    resp = client.post("/api/v1/match", json={"boy": VALID_BOY, "girl": bad_girl})
    assert resp.status_code == 400


def test_match_endpoint_missing_field_returns_422():
    incomplete_boy = {k: v for k, v in VALID_BOY.items() if k != "lat"}
    resp = client.post("/api/v1/match", json={"boy": incomplete_boy, "girl": VALID_GIRL})
    assert resp.status_code == 422
