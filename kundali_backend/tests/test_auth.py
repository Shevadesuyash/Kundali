import base64
import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.auth import get_current_user_from_token, decode_jwt_unverified_claims, TEST_TOKEN, TEST_USER_ID, TEST_USER_EMAIL

client = TestClient(app)

def test_mock_test_token_resolution():
    user = get_current_user_from_token(f"Bearer {TEST_TOKEN}")
    assert user is not None
    assert user["id"] == TEST_USER_ID
    assert user["email"] == TEST_USER_EMAIL
    assert user["is_test_user"] is True

def test_jwt_claims_decoding():
    import hmac, hashlib, os
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(json.dumps({"sub": "supabase_user_uuid_456", "email": "seeker@vedic.com", "role": "authenticated"}).encode()).decode().rstrip("=")
    secret = os.environ.get("SUPABASE_JWT_SECRET", "").strip()
    if secret:
        sig = base64.urlsafe_b64encode(
            hmac.new(secret.encode("utf-8"), f"{header}.{payload}".encode("utf-8"), hashlib.sha256).digest()
        ).decode("utf-8").rstrip("=")
    else:
        sig = "dummy_signature"
    sample_jwt = f"{header}.{payload}.{sig}"

    user = get_current_user_from_token(f"Bearer {sample_jwt}")
    assert user is not None
    assert user["id"] == "supabase_user_uuid_456"
    assert user["email"] == "seeker@vedic.com"
    assert user["is_test_user"] is False

def test_invalid_token_resolution():
    assert get_current_user_from_token(None) is None
    assert get_current_user_from_token("") is None
    assert get_current_user_from_token("Bearer invalid_non_jwt_garbage") is None

def test_authenticated_profile_creation_with_jwt():
    payload = {
        "person": {
            "name": "Auth Test Seeker",
            "year": 1995,
            "month": 8,
            "day": 15,
            "hour": 10,
            "minute": 30,
            "lat": 18.5204,
            "lon": 73.8567,
            "timezone_str": "Asia/Kolkata"
        },
        "gender": "male",
        "birth_place": "Pune, Maharashtra, India",
        "tag": "self"
    }

    headers = {"Authorization": f"Bearer {TEST_TOKEN}"}
    res = client.post("/api/v1/profiles", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Auth Test Seeker"
    assert data["user_id"] == TEST_USER_ID


def test_admin_list_users_unauthorized_returns_401():
    res = client.get("/api/v1/admin/users")
    assert res.status_code == 401


def test_admin_list_users_authorized():
    # TEST_TOKEN belongs to TEST_USER_EMAIL / local_test_user_1 which has super_admin access in test mode
    headers = {"Authorization": f"Bearer {TEST_TOKEN}"}
    res = client.get("/api/v1/admin/users", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "users" in data
    assert "total" in data
    assert isinstance(data["users"], list)


def test_admin_set_user_role():
    headers = {"Authorization": f"Bearer {TEST_TOKEN}"}
    res = client.patch(
        "/api/v1/admin/users/test_user_dummy_1/role",
        json={"role": "admin", "email": "dummy@test.com", "display_name": "Dummy Admin"},
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "admin"
    assert data["user_id"] == "test_user_dummy_1"
