"""
app/rate_limiter.py
-------------------
IP-based & User-based rate limiter for Gemini AI Astrologer questions.
Enforces:
1. Free Tier / Guest: 1 question per 24 hours per IP.
2. Logged-in Wallet Users: Deducts from purchased question credits or allows if 24h pass is active.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple, Dict, Any
from fastapi import Request

from app.database import _conn, IS_POSTGRES

logger = logging.getLogger(__name__)


def get_client_ip(request: Request) -> str:
    """Extract real client IP considering proxies and load balancers."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"


def check_ai_quota(
    ip_address: str,
    user_id: Optional[str] = None,
) -> Tuple[bool, Optional[datetime], str, Dict[str, Any]]:
    """
    Check if a user/IP is allowed to ask a question.
    Returns:
        (is_allowed, next_available_utc, reason_message, quota_meta)
    """
    now = datetime.now(timezone.utc)
    placeholder = "%s" if IS_POSTGRES else "?"

    with _conn() as con:
        # 1. Check user wallet if logged in
        if user_id:
            if IS_POSTGRES:
                cur = con.cursor()
                cur.execute("SELECT credits, unlimited_until, tier FROM user_wallets WHERE user_id = %s", (user_id,))
                wallet = cur.fetchone()
            else:
                row = con.execute("SELECT credits, unlimited_until, tier FROM user_wallets WHERE user_id = ?", (user_id,)).fetchone()
                wallet = dict(row) if row else None

            if wallet:
                unlimited_until = wallet.get("unlimited_until")
                if unlimited_until:
                    if isinstance(unlimited_until, str):
                        try:
                            unlimited_dt = datetime.fromisoformat(unlimited_until)
                        except Exception:
                            unlimited_dt = None
                    else:
                        unlimited_dt = unlimited_until

                    if unlimited_dt and now < unlimited_dt:
                        return True, None, "24h Pass Active", {
                            "type": "day_pass",
                            "unlimited_until": unlimited_dt.isoformat(),
                            "credits_remaining": wallet.get("credits", 0),
                        }

                credits = wallet.get("credits", 0)
                if credits > 0:
                    return True, None, f"{credits} Credits Remaining", {
                        "type": "credit",
                        "credits_remaining": credits,
                    }

        # 2. Check IP log (Free tier / Guest)
        if IS_POSTGRES:
            cur = con.cursor()
            cur.execute("SELECT last_query_timestamp, query_count FROM ai_usage_logs WHERE ip_address = %s", (ip_address,))
            ip_row = cur.fetchone()
        else:
            row = con.execute("SELECT last_query_timestamp, query_count FROM ai_usage_logs WHERE ip_address = ?", (ip_address,)).fetchone()
            ip_row = dict(row) if row else None

        if ip_row:
            last_ts = ip_row.get("last_query_timestamp")
            if isinstance(last_ts, str):
                try:
                    last_dt = datetime.fromisoformat(last_ts)
                except Exception:
                    last_dt = now - timedelta(days=2)
            else:
                last_dt = last_ts or (now - timedelta(days=2))

            # If inside 24 hours window
            if now < last_dt + timedelta(hours=24):
                next_time = last_dt + timedelta(hours=24)
                return False, next_time, "Daily free question limit reached (1/day).", {
                    "type": "free_ip_exhausted",
                    "next_available": next_time.isoformat(),
                    "credits_remaining": 0,
                }

        # First query or 24 hours passed
        return True, None, "1 Free Daily Question Available", {
            "type": "free_ip",
            "credits_remaining": 1,
        }


def record_ai_usage(
    ip_address: str,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Record a consumed query and deduct wallet credits if applicable."""
    now = datetime.now(timezone.utc)
    now_str = now.isoformat() if not IS_POSTGRES else now
    placeholder = "%s" if IS_POSTGRES else "?"

    with _conn() as con:
        # If user logged in and has credits, deduct credit
        if user_id:
            if IS_POSTGRES:
                cur = con.cursor()
                cur.execute("SELECT credits, unlimited_until FROM user_wallets WHERE user_id = %s", (user_id,))
                w = cur.fetchone()
                if w and w.get("credits", 0) > 0 and (not w.get("unlimited_until") or now >= w.get("unlimited_until")):
                    cur.execute("UPDATE user_wallets SET credits = credits - 1, updated_at = %s WHERE user_id = %s", (now, user_id))
            else:
                row = con.execute("SELECT credits, unlimited_until FROM user_wallets WHERE user_id = ?", (user_id,)).fetchone()
                if row and row["credits"] > 0:
                    con.execute("UPDATE user_wallets SET credits = credits - 1, updated_at = ? WHERE user_id = ?", (now_str, user_id))

        # Record in ai_usage_logs
        if IS_POSTGRES:
            cur = con.cursor()
            cur.execute(
                """
                INSERT INTO ai_usage_logs (ip_address, user_id, last_query_timestamp, query_count, cost_type)
                VALUES (%s, %s, %s, 1, %s)
                ON CONFLICT (ip_address) DO UPDATE SET
                  user_id = EXCLUDED.user_id,
                  last_query_timestamp = EXCLUDED.last_query_timestamp,
                  query_count = ai_usage_logs.query_count + 1,
                  cost_type = EXCLUDED.cost_type
                """,
                (ip_address, user_id, now, "user_credit" if user_id else "free_ip")
            )
        else:
            con.execute(
                """
                INSERT INTO ai_usage_logs (ip_address, user_id, last_query_timestamp, query_count, cost_type)
                VALUES (?, ?, ?, 1, ?)
                ON CONFLICT (ip_address) DO UPDATE SET
                  user_id = excluded.user_id,
                  last_query_timestamp = excluded.last_query_timestamp,
                  query_count = query_count + 1,
                  cost_type = excluded.cost_type
                """,
                (ip_address, user_id, now_str, "user_credit" if user_id else "free_ip")
            )

    return {"status": "recorded", "timestamp": now.isoformat()}
