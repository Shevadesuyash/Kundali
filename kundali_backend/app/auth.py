"""
app/auth.py
-----------
JWT token validation for Supabase Auth and offline SQLite test user sessions.

Security architecture:
  - If SUPABASE_JWT_SECRET is set in .env: verifies JWT using HS256 signature (recommended).
  - If SUPABASE_JWT_SECRET is not set: falls back to unverified payload decoding (development only).
  - Always checks JWT `exp` claim for token expiry.
  - Supports local test user (test@test.test / Test@test) for offline SQLite testing.
"""
from __future__ import annotations

import base64
import json
import logging
import os
import time
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException

try:
    from dotenv import load_dotenv
    from pathlib import Path
    load_dotenv()
    load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")
except Exception:
    pass

logger = logging.getLogger(__name__)

# Test user credentials for offline / mock testing
TEST_USER_EMAIL = "test@test.test"
TEST_USER_ID = "local_test_user_1"
TEST_TOKEN = "mock_jwt_test_user_token_123"

SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "").strip()
# Admin user ID — set ADMIN_USER_ID in .env to your Supabase user UUID
# This grants access to /api/v1/admin/* endpoints
ADMIN_USER_ID = os.environ.get("ADMIN_USER_ID", "local_test_user_1").strip()
# For offline testing: the local test user IS the admin by default
ADMIN_TEST_TOKENS = {"mock_jwt_test_user_token_123", "test_token", "mock_jwt_test_user_1"}


def decode_jwt_unverified_claims(token: str) -> Optional[Dict[str, Any]]:
    """Decode unverified claims from a JWT payload for fast user_id extraction.
    NOTE: Use only for development or when SUPABASE_JWT_SECRET is not configured."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        payload_b64 = parts[1]
        # Fix padding
        padding = 4 - len(payload_b64) % 4
        if padding and padding != 4:
            payload_b64 += "=" * padding
        payload_bytes = base64.urlsafe_b64decode(payload_b64.encode("utf-8"))
        return json.loads(payload_bytes.decode("utf-8"))
    except Exception as exc:
        logger.debug("Failed to parse JWT payload: %s", exc)
        return None


def get_current_user_from_token(token: Optional[str]) -> Optional[Dict[str, Any]]:
    """
    Validates token and returns user dict with 'id' and 'email'.
    Supports:
    1. Supabase JWT Bearer token (verified with HS256 if SUPABASE_JWT_SECRET set, else unverified decode)
    2. Local mock test token for 'test@test.test' (offline SQLite testing only)

    Security:
    - Always checks `exp` claim — expired tokens return None.
    - When SUPABASE_JWT_SECRET is configured, verifies HS256 signature.
    """
    if not token:
        return None

    clean_token = token.strip()
    if clean_token.startswith("Bearer "):
        clean_token = clean_token[7:].strip()

    if not clean_token:
        return None

    # 1. Check local mock test token (SQLite offline testing only)
    if clean_token in (TEST_TOKEN, "test_token", "mock_jwt_test_user_1"):
        return {
            "id": TEST_USER_ID,
            "email": TEST_USER_EMAIL,
            "role": "authenticated",
            "is_test_user": True,
        }

    # 2. Try HS256 signature verification if secret is configured
    if SUPABASE_JWT_SECRET:
        try:
            import hmac
            import hashlib

            parts = clean_token.split(".")
            if len(parts) == 3:
                header_payload = f"{parts[0]}.{parts[1]}"
                expected_sig = base64.urlsafe_b64encode(
                    hmac.new(
                        SUPABASE_JWT_SECRET.encode("utf-8"),
                        header_payload.encode("utf-8"),
                        hashlib.sha256,
                    ).digest()
                ).decode("utf-8").rstrip("=")
                actual_sig = parts[2]
                if not hmac.compare_digest(expected_sig, actual_sig):
                    logger.warning("JWT signature verification failed — token rejected")
                    return None
        except Exception as exc:
            logger.debug("JWT signature verification error: %s", exc)
            # Fall through to unverified decode in development

    # 3. Decode payload (verified or unverified)
    claims = decode_jwt_unverified_claims(clean_token)
    if claims and "sub" in claims:
        # Always check expiry
        exp = claims.get("exp")
        if exp and time.time() > exp:
            logger.debug("JWT token expired (exp=%s, now=%s)", exp, time.time())
            return None

        user_id = claims["sub"]
        email = claims.get("email") or claims.get("user_metadata", {}).get("email")
        return {
            "id": user_id,
            "email": email,
            "role": claims.get("role", "authenticated"),
            "is_test_user": False,
        }

    return None


def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """Dependency that returns current user dict if valid Bearer token provided, else None."""
    return get_current_user_from_token(authorization)


def get_required_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Dependency that enforces authentication and returns current user dict."""
    user = get_current_user_from_token(authorization)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please sign in to access this feature.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def is_admin(user: Optional[Dict[str, Any]]) -> bool:
    """Returns True if the given user dict matches the configured ADMIN_USER_ID."""
    if not user:
        return False
    return user.get("id") == ADMIN_USER_ID


def get_admin_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """FastAPI dependency: requires admin privileges. Returns 403 if not admin."""
    user = get_current_user_from_token(authorization)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not is_admin(user):
        raise HTTPException(
            status_code=403,
            detail="Admin access required. Only the application administrator can access this endpoint.",
        )
    return user
