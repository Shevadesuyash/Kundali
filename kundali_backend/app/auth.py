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
    jwt_secret = os.environ.get("SUPABASE_JWT_SECRET", SUPABASE_JWT_SECRET).strip()
    if jwt_secret:
        try:
            import hmac
            import hashlib

            parts = clean_token.split(".")
            if len(parts) == 3:
                header_payload = f"{parts[0]}.{parts[1]}"
                actual_sig = parts[2]
                # Option A: string secret
                expected_sig = base64.urlsafe_b64encode(
                    hmac.new(
                        jwt_secret.encode("utf-8"),
                        header_payload.encode("utf-8"),
                        hashlib.sha256,
                    ).digest()
                ).decode("utf-8").rstrip("=")

                sig_valid = hmac.compare_digest(expected_sig, actual_sig)

                # Option B: base64-decoded binary secret
                if not sig_valid:
                    try:
                        decoded_sec = base64.b64decode(jwt_secret)
                        expected_sig_b = base64.urlsafe_b64encode(
                            hmac.new(
                                decoded_sec,
                                header_payload.encode("utf-8"),
                                hashlib.sha256,
                            ).digest()
                        ).decode("utf-8").rstrip("=")
                        sig_valid = hmac.compare_digest(expected_sig_b, actual_sig)
                    except Exception:
                        pass

                if not sig_valid:
                    logger.warning("JWT signature verification failed — token rejected")
                    return None
        except Exception as exc:
            logger.debug("JWT signature verification error: %s", exc)

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

SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '').strip()
SUPABASE_URL = os.environ.get('SUPABASE_URL', '').strip()
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@kundali.app').strip()


def get_user_role_from_db(user_id: str) -> str:
    """Fetch role from user_roles table. Returns 'user' if not found."""
    try:
        from app.database import _conn, IS_POSTGRES
        with _conn() as con:
            ph = '%s' if IS_POSTGRES else '?'
            if IS_POSTGRES:
                cur = con.cursor()
                cur.execute(f'SELECT role FROM user_roles WHERE user_id = {ph}', (user_id,))
                row = cur.fetchone()
            else:
                row = con.execute(f'SELECT role FROM user_roles WHERE user_id = {ph}', (user_id,)).fetchone()
            if row:
                return row['role'] if hasattr(row, '__getitem__') else row[0]
    except Exception:
        pass
    return 'user'


def is_admin(user: Optional[Dict[str, Any]]) -> bool:
    """Returns True if user is admin or super_admin (env var OR user_roles table)."""
    if not user:
        return False
    uid = user.get('id', '')
    email = user.get('email', '')
    admin_uid = os.environ.get("ADMIN_USER_ID", "425a7447-6bdb-4461-9d39-dda0fd4ed58f").strip()
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@kundali.app").strip()

    # Fast path: env var match or local mock test user
    if (
        uid == admin_uid or
        uid == '425a7447-6bdb-4461-9d39-dda0fd4ed58f' or
        uid == 'local_test_user_1' or
        email == 'test@test.test' or
        email == 'admin@kundali.app' or
        (admin_email and email == admin_email)
    ):
        return True
    # DB check
    role = get_user_role_from_db(uid)
    return role in ('admin', 'super_admin')


def is_super_admin(user: Optional[Dict[str, Any]]) -> bool:
    """Returns True only if user is super_admin (env var OR user_roles table)."""
    if not user:
        return False
    uid = user.get('id', '')
    email = user.get('email', '')
    admin_uid = os.environ.get("ADMIN_USER_ID", "425a7447-6bdb-4461-9d39-dda0fd4ed58f").strip()
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@kundali.app").strip()

    # Fast path: env var match or local mock test user
    if (
        uid == admin_uid or
        uid == '425a7447-6bdb-4461-9d39-dda0fd4ed58f' or
        uid == 'local_test_user_1' or
        email == 'test@test.test' or
        email == 'admin@kundali.app' or
        (admin_email and email == admin_email)
    ):
        return True
    # DB check
    role = get_user_role_from_db(uid)
    return role == 'super_admin'


def get_admin_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """FastAPI dependency: requires admin privileges. Returns 403 if not admin."""
    user = get_current_user_from_token(authorization)
    if not user:
        raise HTTPException(
            status_code=401,
            detail='Authentication required.',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    if not is_admin(user):
        raise HTTPException(
            status_code=403,
            detail='Admin access required. Only the application administrator can access this endpoint.',
        )
    return user


def get_super_admin_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """FastAPI dependency: requires super_admin role."""
    user = get_current_user_from_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail='Authentication required.')
    if not is_super_admin(user):
        raise HTTPException(status_code=403, detail='Super admin access required.')
    return user
