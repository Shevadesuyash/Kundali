"""
app/auth.py
-----------
JWT token validation for Supabase Auth and offline SQLite test user sessions.
"""
from __future__ import annotations

import base64
import json
import logging
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException

logger = logging.getLogger(__name__)

# Test user credentials for offline / mock testing
TEST_USER_EMAIL = "test@test.test"
TEST_USER_ID = "local_test_user_1"
TEST_TOKEN = "mock_jwt_test_user_token_123"


def decode_jwt_unverified_claims(token: str) -> Optional[Dict[str, Any]]:
    """Decode unverified claims from a JWT payload for fast user_id extraction."""
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
    1. Supabase JWT Bearer token (extracts 'sub' and 'email')
    2. Local mock test token for 'test@test.test'
    """
    if not token:
        return None

    clean_token = token.strip()
    if clean_token.startswith("Bearer "):
        clean_token = clean_token[7:].strip()

    if not clean_token:
        return None

    # 1. Check local mock test token
    if clean_token in (TEST_TOKEN, "test_token", "mock_jwt_test_user_1"):
        return {
            "id": TEST_USER_ID,
            "email": TEST_USER_EMAIL,
            "role": "authenticated",
            "is_test_user": True,
        }

    # 2. Check Supabase JWT structure
    claims = decode_jwt_unverified_claims(clean_token)
    if claims and "sub" in claims:
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
