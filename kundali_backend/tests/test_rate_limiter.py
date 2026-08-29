import pytest
from datetime import datetime, timedelta, timezone
from app.rate_limiter import check_ai_quota, record_ai_usage
from app.database import _conn, IS_POSTGRES

def test_ip_rate_limiting_workflow():
    test_ip = "192.168.1.99"

    # Clean up test IP
    with _conn() as con:
        if IS_POSTGRES:
            cur = con.cursor()
            cur.execute("DELETE FROM ai_usage_logs WHERE ip_address = %s", (test_ip,))
        else:
            con.execute("DELETE FROM ai_usage_logs WHERE ip_address = ?", (test_ip,))

    # 1. First query should be allowed
    allowed, next_avail, reason, meta = check_ai_quota(test_ip)
    assert allowed is True
    assert meta["type"] == "free_ip"

    # 2. Record query
    record_ai_usage(test_ip)

    # 3. Second query within 24h should be blocked
    allowed, next_avail, reason, meta = check_ai_quota(test_ip)
    assert allowed is False
    assert next_avail is not None
    assert meta["type"] == "free_ip_exhausted"


def test_user_wallet_credits_workflow():
    test_user = "user_test_wallet_123"
    test_ip = "192.168.1.100"
    now = datetime.now(timezone.utc)
    now_str = now.isoformat() if not IS_POSTGRES else now

    # Setup wallet with 2 credits
    with _conn() as con:
        if IS_POSTGRES:
            cur = con.cursor()
            cur.execute("DELETE FROM user_wallets WHERE user_id = %s", (test_user,))
            cur.execute("INSERT INTO user_wallets (user_id, credits, tier, updated_at) VALUES (%s, 2, 'explorer', %s)", (test_user, now))
        else:
            con.execute("DELETE FROM user_wallets WHERE user_id = ?", (test_user,))
            con.execute("INSERT INTO user_wallets (user_id, credits, tier, updated_at) VALUES (?, 2, 'explorer', ?)", (test_user, now_str))

    # Should be allowed via credit
    allowed, next_avail, reason, meta = check_ai_quota(test_ip, user_id=test_user)
    assert allowed is True
    assert meta["type"] == "credit"
    assert meta["credits_remaining"] == 2

    # Deduct 1 credit
    record_ai_usage(test_ip, user_id=test_user)

    # Should have 1 credit remaining
    allowed, next_avail, reason, meta = check_ai_quota(test_ip, user_id=test_user)
    assert allowed is True
    assert meta["credits_remaining"] == 1
