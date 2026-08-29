"""
app/database.py
---------------
Dual-mode persistence layer for Kundali user profiles, AI usage logs, user wallets, and location cache.
Supports:
1. Supabase PostgreSQL (via DATABASE_URL in .env)
2. Local SQLite3 (profiles.db fallback for offline / local testing)

Tables:
  profiles       — saved birth profiles (with optional user_id for multi-user cloud sync)
  ai_usage_logs  — IP-based & user-based query tracking for rate limiting
  user_wallets   — AI Question credits & 24h consultation day passes
  location_cache — cached geocoding results (query -> Nominatim JSON)
"""
from __future__ import annotations

import json
import logging
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

DB_URL = os.getenv("DATABASE_URL", "").strip()
IS_POSTGRES = DB_URL.startswith("postgresql://") or DB_URL.startswith("postgres://")
DB_PATH = Path(os.getenv("KUNDALI_DB_PATH", "profiles.db"))

_mem_cache: Dict[str, List[Dict]] = {}

SEED_LOCATIONS = [
    ("Kolhapur, Maharashtra, India",     "16.7050", "74.2433", "in"),
    ("Sangli, Maharashtra, India",        "16.8524", "74.5815", "in"),
    ("Satara, Maharashtra, India",        "17.6805", "73.9985", "in"),
    ("Ichalkaranji, Maharashtra, India",  "16.6939", "74.4597", "in"),
    ("Miraj, Maharashtra, India",         "16.8275", "74.6453", "in"),
    ("Karad, Maharashtra, India",         "17.2893", "74.1826", "in"),
    ("Islampur, Maharashtra, India",      "17.0560", "74.3237", "in"),
    ("Vita, Maharashtra, India",          "17.2710", "74.5422", "in"),
    ("Tasgaon, Maharashtra, India",       "17.0361", "74.6007", "in"),
    ("Kagal, Maharashtra, India",         "16.5681", "74.3179", "in"),
    ("Shirol, Maharashtra, India",        "16.7289", "74.5825", "in"),
    ("Gadhinglaj, Maharashtra, India",    "16.2227", "74.3528", "in"),
    ("Panhala, Maharashtra, India",       "16.8122", "74.1102", "in"),
    ("Radhanagari, Maharashtra, India",   "16.4197", "74.0459", "in"),
    ("Khed, Maharashtra, India",          "17.7200", "73.9978", "in"),
    ("Wai, Maharashtra, India",           "17.9561", "73.8973", "in"),
    ("Ashta, Maharashtra, India",         "16.9600", "74.4200", "in"),
    ("Jaisingpur, Maharashtra, India",    "16.7897", "74.5554", "in"),
    ("Malvan, Maharashtra, India",        "16.0605", "73.4677", "in"),
    ("Ratnagiri, Maharashtra, India",     "16.9944", "73.3000", "in"),
    ("Pune, Maharashtra, India",          "18.5204", "73.8567", "in"),
    ("Mumbai, Maharashtra, India",        "19.0760", "72.8777", "in"),
    ("Nashik, Maharashtra, India",        "19.9975", "73.7898", "in"),
    ("Aurangabad, Maharashtra, India",    "19.8762", "75.3433", "in"),
    ("Solapur, Maharashtra, India",       "17.6868", "75.9064", "in"),
    ("Belgaum, Karnataka, India",         "15.8497", "74.4977", "in"),
    ("Hubli, Karnataka, India",           "15.3647", "75.1240", "in"),
    ("Goa, India",                        "15.2993", "74.1240", "in"),
]


@contextmanager
def _conn():
    """Connection manager supporting Supabase PostgreSQL or SQLite fallback."""
    if IS_POSTGRES:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        con = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
        try:
            yield con
            con.commit()
        except Exception:
            con.rollback()
            raise
        finally:
            con.close()
    else:
        con = sqlite3.connect(str(DB_PATH), check_same_thread=False)
        con.row_factory = sqlite3.Row
        con.execute("PRAGMA journal_mode=WAL")
        try:
            yield con
            con.commit()
        except Exception:
            con.rollback()
            raise
        finally:
            con.close()


def init_db() -> None:
    """Create tables and seed cache across Supabase Postgres or SQLite."""
    with _conn() as con:
        if IS_POSTGRES:
            cur = con.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS profiles (
                    id           SERIAL PRIMARY KEY,
                    user_id      TEXT,
                    name         TEXT NOT NULL,
                    gender       TEXT NOT NULL DEFAULT 'male',
                    year         INTEGER NOT NULL,
                    month        INTEGER NOT NULL,
                    day          INTEGER NOT NULL,
                    hour         INTEGER NOT NULL,
                    minute       INTEGER NOT NULL,
                    lat          REAL NOT NULL,
                    lon          REAL NOT NULL,
                    timezone_str TEXT NOT NULL,
                    birth_place  TEXT,
                    moon_sign    TEXT,
                    nakshatra    TEXT,
                    lagna        TEXT,
                    is_manglik   INTEGER NOT NULL DEFAULT 0,
                    active_dasha TEXT,
                    tag          TEXT NOT NULL DEFAULT 'self',
                    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
                CREATE INDEX IF NOT EXISTS idx_profiles_name    ON profiles(name);
                CREATE INDEX IF NOT EXISTS idx_profiles_gender  ON profiles(gender);

                CREATE TABLE IF NOT EXISTS ai_usage_logs (
                    ip_address             TEXT PRIMARY KEY,
                    user_id                TEXT,
                    last_query_timestamp   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    query_count            INTEGER DEFAULT 1,
                    cost_type              TEXT DEFAULT 'free_ip'
                );

                CREATE TABLE IF NOT EXISTS user_wallets (
                    user_id          TEXT PRIMARY KEY,
                    credits          INTEGER DEFAULT 0,
                    unlimited_until  TIMESTAMP WITH TIME ZONE,
                    tier             TEXT DEFAULT 'free',
                    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS location_cache (
                    id           SERIAL PRIMARY KEY,
                    query        TEXT NOT NULL UNIQUE,
                    results_json TEXT NOT NULL,
                    source       TEXT DEFAULT 'nominatim',
                    hit_count    INTEGER DEFAULT 1,
                    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)
            logger.info("Supabase PostgreSQL initialized successfully")
        else:
            con.executescript("""
                CREATE TABLE IF NOT EXISTS profiles (
                    id           INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id      TEXT,
                    name         TEXT    NOT NULL,
                    gender       TEXT    NOT NULL DEFAULT 'male',
                    year         INTEGER NOT NULL,
                    month        INTEGER NOT NULL,
                    day          INTEGER NOT NULL,
                    hour         INTEGER NOT NULL,
                    minute       INTEGER NOT NULL,
                    lat          REAL    NOT NULL,
                    lon          REAL    NOT NULL,
                    timezone_str TEXT    NOT NULL,
                    birth_place  TEXT,
                    moon_sign    TEXT,
                    nakshatra    TEXT,
                    lagna        TEXT,
                    is_manglik   INTEGER NOT NULL DEFAULT 0,
                    active_dasha TEXT,
                    tag          TEXT    NOT NULL DEFAULT 'self',
                    created_at   TEXT    NOT NULL
                );

                CREATE TABLE IF NOT EXISTS ai_usage_logs (
                    ip_address             TEXT PRIMARY KEY,
                    user_id                TEXT,
                    last_query_timestamp   TEXT NOT NULL,
                    query_count            INTEGER DEFAULT 1,
                    cost_type              TEXT DEFAULT 'free_ip'
                );

                CREATE TABLE IF NOT EXISTS user_wallets (
                    user_id          TEXT PRIMARY KEY,
                    credits          INTEGER DEFAULT 0,
                    unlimited_until  TEXT,
                    tier             TEXT DEFAULT 'free',
                    updated_at       TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS location_cache (
                    id           INTEGER PRIMARY KEY AUTOINCREMENT,
                    query        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
                    results_json TEXT    NOT NULL,
                    source       TEXT    DEFAULT 'nominatim',
                    hit_count    INTEGER DEFAULT 1,
                    created_at   TEXT    NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_loc_query ON location_cache(query COLLATE NOCASE);
            """)
            for col_sql in [
                "ALTER TABLE profiles ADD COLUMN user_id TEXT",
                "ALTER TABLE profiles ADD COLUMN lagna TEXT",
                "ALTER TABLE profiles ADD COLUMN active_dasha TEXT",
                "ALTER TABLE profiles ADD COLUMN tag TEXT NOT NULL DEFAULT 'self'",
            ]:
                try:
                    con.execute(col_sql)
                except Exception:
                    pass

            for idx_sql in [
                "CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)",
                "CREATE INDEX IF NOT EXISTS idx_profiles_name   ON profiles(name COLLATE NOCASE)",
                "CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender)",
                "CREATE INDEX IF NOT EXISTS idx_profiles_tag    ON profiles(tag)",
            ]:
                try:
                    con.execute(idx_sql)
                except Exception:
                    pass

            now = datetime.now(timezone.utc).isoformat()
            for display, lat, lon, cc in SEED_LOCATIONS:
                result = [{
                    "display_name": display,
                    "lat": lat,
                    "lon": lon,
                    "address": {"country_code": cc},
                    "source": "seed",
                }]
                query_key = display.split(",")[0].strip().lower()
                con.execute(
                    "INSERT OR IGNORE INTO location_cache(query, results_json, source, created_at) "
                    "VALUES (?, ?, 'seed', ?)",
                    (query_key, json.dumps(result), now)
                )
            logger.info("Local SQLite DB initialized at %s", DB_PATH)


# ---------------------------------------------------------------------------
# Profile CRUD
# ---------------------------------------------------------------------------

def save_profile(
    name: str, gender: str,
    year: int, month: int, day: int,
    hour: int, minute: int,
    lat: float, lon: float,
    timezone_str: str,
    birth_place: Optional[str] = None,
    moon_sign: Optional[str] = None,
    nakshatra: Optional[str] = None,
    lagna: Optional[str] = None,
    is_manglik: bool = False,
    active_dasha: Optional[str] = None,
    tag: str = "self",
    user_id: Optional[str] = None,
) -> int:
    """Insert a new profile and return its id."""
    now = datetime.now(timezone.utc).isoformat() if not IS_POSTGRES else datetime.now(timezone.utc)
    with _conn() as con:
        if IS_POSTGRES:
            cur = con.cursor()
            cur.execute(
                """
                INSERT INTO profiles
                  (user_id, name, gender, year, month, day, hour, minute, lat, lon, timezone_str,
                   birth_place, moon_sign, nakshatra, lagna, is_manglik, active_dasha, tag, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (user_id, name, gender, year, month, day, hour, minute, lat, lon,
                 timezone_str, birth_place, moon_sign, nakshatra, lagna,
                 1 if is_manglik else 0, active_dasha, tag, now)
            )
            row = cur.fetchone()
            return row["id"] if row else 1
        else:
            cur = con.execute(
                """
                INSERT INTO profiles
                  (user_id, name, gender, year, month, day, hour, minute, lat, lon, timezone_str,
                   birth_place, moon_sign, nakshatra, lagna, is_manglik, active_dasha, tag, created_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """,
                (user_id, name, gender, year, month, day, hour, minute, lat, lon,
                 timezone_str, birth_place, moon_sign, nakshatra, lagna,
                 1 if is_manglik else 0, active_dasha, tag, now)
            )
            return cur.lastrowid


def update_profile(profile_id: int, user_id: Optional[str] = None, **fields) -> bool:
    """Partially update a profile."""
    ALLOWED = {
        "name", "gender", "year", "month", "day", "hour", "minute",
        "lat", "lon", "timezone_str", "birth_place", "tag",
        "moon_sign", "nakshatra", "lagna", "is_manglik", "active_dasha",
    }
    updates = {k: v for k, v in fields.items() if k in ALLOWED}
    if not updates:
        return False

    with _conn() as con:
        if IS_POSTGRES:
            cur = con.cursor()
            set_clause = ", ".join(f"{k} = %s" for k in updates)
            values = list(updates.values()) + [profile_id]
            extra_where = " AND user_id = %s" if user_id else ""
            if user_id:
                values.append(user_id)
            cur.execute(f"UPDATE profiles SET {set_clause} WHERE id = %s{extra_where}", values)
            return cur.rowcount > 0
        else:
            set_clause = ", ".join(f"{k} = ?" for k in updates)
            values = list(updates.values()) + [profile_id]
            extra_where = " AND user_id = ?" if user_id else ""
            if user_id:
                values.append(user_id)
            cur = con.execute(f"UPDATE profiles SET {set_clause} WHERE id = ?{extra_where}", values)
            return cur.rowcount > 0


def delete_profile(profile_id: int, user_id: Optional[str] = None) -> bool:
    """Delete a profile by id."""
    with _conn() as con:
        if IS_POSTGRES:
            cur = con.cursor()
            if user_id:
                cur.execute("DELETE FROM profiles WHERE id = %s AND user_id = %s", (profile_id, user_id))
            else:
                cur.execute("DELETE FROM profiles WHERE id = %s", (profile_id,))
            return cur.rowcount > 0
        else:
            if user_id:
                cur = con.execute("DELETE FROM profiles WHERE id = ? AND user_id = ?", (profile_id, user_id))
            else:
                cur = con.execute("DELETE FROM profiles WHERE id = ?", (profile_id,))
            return cur.rowcount > 0


def search_profiles(
    q: Optional[str] = None,
    gender: Optional[str] = None,
    tag: Optional[str] = None,
    user_id: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
) -> List[Dict]:
    """Search profiles by name, gender, tag, and/or user_id."""
    conditions: List[str] = []
    params: List[Any] = []
    placeholder = "%s" if IS_POSTGRES else "?"

    if user_id:
        conditions.append(f"user_id = {placeholder}")
        params.append(user_id)
    if q:
        if IS_POSTGRES:
            conditions.append(f"name ILIKE {placeholder}")
        else:
            conditions.append(f"name LIKE {placeholder} COLLATE NOCASE")
        params.append(f"%{q}%")
    if gender and gender in ("male", "female"):
        conditions.append(f"gender = {placeholder}")
        params.append(gender)
    if tag:
        conditions.append(f"tag = {placeholder}")
        params.append(tag)

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    offset = (page - 1) * per_page
    params.extend([per_page, offset])

    with _conn() as con:
        query_sql = (
            f"SELECT id, name, gender, birth_place, year, month, day, hour, minute, "
            f"lat, lon, timezone_str, moon_sign, nakshatra, lagna, is_manglik, active_dasha, tag, created_at "
            f"FROM profiles {where} ORDER BY created_at DESC LIMIT {placeholder} OFFSET {placeholder}"
        )
        if IS_POSTGRES:
            cur = con.cursor()
            cur.execute(query_sql, params)
            rows = cur.fetchall()
            return [dict(r) for r in rows]
        else:
            rows = con.execute(query_sql, params).fetchall()
            return [dict(r) for r in rows]


def search_profiles_typeahead(q: str, user_id: Optional[str] = None, limit: int = 5) -> List[Dict]:
    """Lightweight search for typeahead dropdown."""
    placeholder = "%s" if IS_POSTGRES else "?"
    conditions = [f"name ILIKE {placeholder}" if IS_POSTGRES else f"name LIKE {placeholder} COLLATE NOCASE"]
    params = [f"%{q}%"]

    if user_id:
        conditions.append(f"user_id = {placeholder}")
        params.append(user_id)

    where = "WHERE " + " AND ".join(conditions)
    params.append(limit)

    query_sql = (
        f"SELECT id, name, gender, year, month, day, hour, minute, "
        f"lat, lon, timezone_str, birth_place, lagna, moon_sign "
        f"FROM profiles {where} ORDER BY created_at DESC LIMIT {placeholder}"
    )

    with _conn() as con:
        if IS_POSTGRES:
            cur = con.cursor()
            cur.execute(query_sql, params)
            rows = cur.fetchall()
            return [dict(r) for r in rows]
        else:
            rows = con.execute(query_sql, params).fetchall()
            return [dict(r) for r in rows]


def get_profile_by_id(profile_id: int) -> Optional[Dict]:
    """Return full profile dict or None."""
    placeholder = "%s" if IS_POSTGRES else "?"
    with _conn() as con:
        if IS_POSTGRES:
            cur = con.cursor()
            cur.execute(f"SELECT * FROM profiles WHERE id = {placeholder}", (profile_id,))
            row = cur.fetchone()
            return dict(row) if row else None
        else:
            row = con.execute(f"SELECT * FROM profiles WHERE id = {placeholder}", (profile_id,)).fetchone()
            return dict(row) if row else None


def count_profiles(
    q: Optional[str] = None,
    gender: Optional[str] = None,
    tag: Optional[str] = None,
    user_id: Optional[str] = None,
) -> int:
    """Return total count of matching profiles."""
    conditions: List[str] = []
    params: List[Any] = []
    placeholder = "%s" if IS_POSTGRES else "?"

    if user_id:
        conditions.append(f"user_id = {placeholder}")
        params.append(user_id)
    if q:
        if IS_POSTGRES:
            conditions.append(f"name ILIKE {placeholder}")
        else:
            conditions.append(f"name LIKE {placeholder} COLLATE NOCASE")
        params.append(f"%{q}%")
    if gender and gender in ("male", "female"):
        conditions.append(f"gender = {placeholder}")
        params.append(gender)
    if tag:
        conditions.append(f"tag = {placeholder}")
        params.append(tag)

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    with _conn() as con:
        if IS_POSTGRES:
            cur = con.cursor()
            cur.execute(f"SELECT COUNT(*) as cnt FROM profiles {where}", params)
            row = cur.fetchone()
            return row["cnt"] if row else 0
        else:
            row = con.execute(f"SELECT COUNT(*) FROM profiles {where}", params).fetchone()
            return row[0] if row else 0


def get_gender_counts(user_id: Optional[str] = None) -> Dict[str, int]:
    """Return counts of male and female profiles."""
    placeholder = "%s" if IS_POSTGRES else "?"
    where = f"WHERE user_id = {placeholder}" if user_id else ""
    params = [user_id] if user_id else []

    with _conn() as con:
        if IS_POSTGRES:
            cur = con.cursor()
            cur.execute(f"SELECT gender, COUNT(*) as cnt FROM profiles {where} GROUP BY gender", params)
            rows = cur.fetchall()
            counts = {"male": 0, "female": 0}
            for row in rows:
                if row["gender"] in counts:
                    counts[row["gender"]] = row["cnt"]
            return counts
        else:
            rows = con.execute(f"SELECT gender, COUNT(*) as cnt FROM profiles {where} GROUP BY gender", params).fetchall()
            counts = {"male": 0, "female": 0}
            for row in rows:
                if row["gender"] in counts:
                    counts[row["gender"]] = row["cnt"]
            return counts


# ---------------------------------------------------------------------------
# Location cache
# ---------------------------------------------------------------------------

def get_cached_location(query: str) -> Optional[List[Dict]]:
    """Check L1 then database cache."""
    key = query.strip().lower()
    if key in _mem_cache:
        return _mem_cache[key]

    placeholder = "%s" if IS_POSTGRES else "?"
    with _conn() as con:
        if IS_POSTGRES:
            cur = con.cursor()
            cur.execute(f"SELECT results_json FROM location_cache WHERE query = {placeholder}", (key,))
            row = cur.fetchone()
            if row:
                cur.execute(f"UPDATE location_cache SET hit_count = hit_count + 1 WHERE query = {placeholder}", (key,))
                results = json.loads(row["results_json"])
                _mem_cache[key] = results
                return results
        else:
            row = con.execute(f"SELECT results_json FROM location_cache WHERE query = {placeholder} COLLATE NOCASE", (key,)).fetchone()
            if row:
                con.execute(f"UPDATE location_cache SET hit_count = hit_count + 1 WHERE query = {placeholder} COLLATE NOCASE", (key,))
                results = json.loads(row[0])
                _mem_cache[key] = results
                return results
    return None


def save_location_cache(query: str, results: List[Dict], source: str = "nominatim") -> None:
    """Save geocoding results."""
    key = query.strip().lower()
    _mem_cache[key] = results
    now = datetime.now(timezone.utc).isoformat() if not IS_POSTGRES else datetime.now(timezone.utc)

    with _conn() as con:
        if IS_POSTGRES:
            cur = con.cursor()
            cur.execute(
                """
                INSERT INTO location_cache(query, results_json, source, created_at)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT(query) DO UPDATE SET
                  results_json = EXCLUDED.results_json,
                  source = EXCLUDED.source,
                  hit_count = location_cache.hit_count + 1
                """,
                (key, json.dumps(results), source, now)
            )
        else:
            con.execute(
                """
                INSERT INTO location_cache(query, results_json, source, created_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(query) DO UPDATE SET
                  results_json = excluded.results_json,
                  source = excluded.source,
                  hit_count = hit_count + 1
                """,
                (key, json.dumps(results), source, now)
            )
