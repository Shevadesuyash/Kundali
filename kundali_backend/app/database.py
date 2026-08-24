"""
app/database.py
---------------
SQLite persistence layer for Kundali user profiles and location cache.
Uses Python built-in sqlite3 — zero extra dependencies.

Tables:
  profiles       — saved birth profiles (name, gender, birth details, computed astro fields)
  location_cache — cached geocoding results (query -> Nominatim JSON)

Cache strategy for geocoding:
  L1: in-process Python dict (_mem_cache) — microsecond access
  L2: location_cache SQLite table         — millisecond access
  L3: live Nominatim HTTP call            — 500ms-2s, result saved to L1+L2

SCHEMA VERSION: 2 (Phase 1 — fresh start, adds lagna, active_dasha, tag columns)
Gender values: 'male' | 'female' only.
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

DB_PATH = Path(os.getenv("KUNDALI_DB_PATH", "profiles.db"))

# ---------------------------------------------------------------------------
# L1 in-memory geocode cache  {normalised_query -> list[dict]}
# ---------------------------------------------------------------------------
_mem_cache: Dict[str, List[Dict]] = {}

# ---------------------------------------------------------------------------
# Pre-seeded locations — Kolhapur / Satara / Sangli region + major cities
# Format: (display_name, lat, lon, country_code)
# ---------------------------------------------------------------------------
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
    """Thread-safe SQLite connection context manager."""
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
    """
    Create tables and seed location cache. Called once at app startup.

    Schema strategy (safe — NEVER drops data):
      - CREATE TABLE IF NOT EXISTS for initial setup.
      - ALTER TABLE ADD COLUMN for each Phase-1 column if missing.
      - SQLite ignores duplicate ADD COLUMN via try/except.

    BUG FIX: The original Phase-1 init had DROP TABLE IF EXISTS profiles
    which wiped ALL saved profiles on every server restart. This is removed.
    Safe migration via ALTER TABLE ensures new columns exist without data loss.
    """
    with _conn() as con:
        # ── Core profiles table (safe: no-op if already exists) ──────────
        con.executescript("""
            CREATE TABLE IF NOT EXISTS profiles (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
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

            CREATE INDEX IF NOT EXISTS idx_profiles_name   ON profiles(name COLLATE NOCASE);
            CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
            CREATE INDEX IF NOT EXISTS idx_profiles_tag    ON profiles(tag);

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

        # ── Safe column migrations (ALTER TABLE IF NOT EXISTS equivalent) ─
        # SQLite does not support IF NOT EXISTS on ADD COLUMN — use try/except.
        for col_sql in [
            "ALTER TABLE profiles ADD COLUMN lagna        TEXT",
            "ALTER TABLE profiles ADD COLUMN active_dasha TEXT",
            "ALTER TABLE profiles ADD COLUMN tag          TEXT NOT NULL DEFAULT 'self'",
        ]:
            try:
                con.execute(col_sql)
            except Exception:
                pass  # column already exists — safe to ignore

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
    logger.info("DB initialised at %s", DB_PATH)


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
) -> int:
    """Insert a new profile and return its id."""
    now = datetime.now(timezone.utc).isoformat()
    with _conn() as con:
        cur = con.execute(
            """
            INSERT INTO profiles
              (name,gender,year,month,day,hour,minute,lat,lon,timezone_str,
               birth_place,moon_sign,nakshatra,lagna,is_manglik,active_dasha,tag,created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (name, gender, year, month, day, hour, minute, lat, lon,
             timezone_str, birth_place, moon_sign, nakshatra, lagna,
             1 if is_manglik else 0, active_dasha, tag, now)
        )
        return cur.lastrowid


def update_profile(profile_id: int, **fields) -> bool:
    """
    Partially update a profile. Only the supplied keyword arguments are updated.
    Returns True if a row was modified, False if the id was not found.
    Allowed fields: name, gender, year, month, day, hour, minute, lat, lon,
                    timezone_str, birth_place, tag, moon_sign, nakshatra, lagna,
                    is_manglik, active_dasha.
    """
    ALLOWED = {
        "name", "gender", "year", "month", "day", "hour", "minute",
        "lat", "lon", "timezone_str", "birth_place", "tag",
        "moon_sign", "nakshatra", "lagna", "is_manglik", "active_dasha",
    }
    updates = {k: v for k, v in fields.items() if k in ALLOWED}
    if not updates:
        return False

    set_clause = ", ".join(f"{k} = ?" for k in updates)
    values = list(updates.values()) + [profile_id]

    with _conn() as con:
        cur = con.execute(
            f"UPDATE profiles SET {set_clause} WHERE id = ?", values
        )
    return cur.rowcount > 0


def delete_profile(profile_id: int) -> bool:
    """Hard-delete a profile by id. Returns True if deleted."""
    with _conn() as con:
        cur = con.execute("DELETE FROM profiles WHERE id = ?", (profile_id,))
    return cur.rowcount > 0


def search_profiles(
    q: Optional[str] = None,
    gender: Optional[str] = None,
    tag: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
) -> List[Dict]:
    """Search profiles by name substring, gender, and/or tag."""
    conditions: List[str] = []
    params: List[Any] = []
    if q:
        conditions.append("name LIKE ? COLLATE NOCASE")
        params.append(f"%{q}%")
    if gender and gender in ("male", "female"):
        conditions.append("gender = ?")
        params.append(gender)
    if tag:
        conditions.append("tag = ?")
        params.append(tag)

    where  = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    offset = (page - 1) * per_page
    params.extend([per_page, offset])

    with _conn() as con:
        rows = con.execute(
            f"SELECT id,name,gender,birth_place,year,month,day,"
            f"moon_sign,nakshatra,lagna,is_manglik,active_dasha,tag,created_at "
            f"FROM profiles {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
            params
        ).fetchall()
    return [dict(r) for r in rows]


def search_profiles_typeahead(q: str, limit: int = 5) -> List[Dict]:
    """
    Lightweight search for the auto-fill typeahead dropdown.
    Returns minimal fields needed to populate the birth details form.
    """
    with _conn() as con:
        rows = con.execute(
            "SELECT id,name,gender,year,month,day,hour,minute,"
            "lat,lon,timezone_str,birth_place,lagna,moon_sign "
            "FROM profiles WHERE name LIKE ? COLLATE NOCASE "
            "ORDER BY created_at DESC LIMIT ?",
            (f"%{q}%", limit)
        ).fetchall()
    return [dict(r) for r in rows]


def get_profile_by_id(profile_id: int) -> Optional[Dict]:
    """Return full profile dict or None."""
    with _conn() as con:
        row = con.execute(
            "SELECT * FROM profiles WHERE id = ?", (profile_id,)
        ).fetchone()
    return dict(row) if row else None


def count_profiles(
    q: Optional[str] = None,
    gender: Optional[str] = None,
    tag: Optional[str] = None,
) -> int:
    conditions: List[str] = []
    params: List[Any] = []
    if q:
        conditions.append("name LIKE ? COLLATE NOCASE")
        params.append(f"%{q}%")
    if gender and gender in ("male", "female"):
        conditions.append("gender = ?")
        params.append(gender)
    if tag:
        conditions.append("tag = ?")
        params.append(tag)
    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    with _conn() as con:
        row = con.execute(
            f"SELECT COUNT(*) FROM profiles {where}", params
        ).fetchone()
    return row[0]


def get_gender_counts() -> Dict[str, int]:
    """Return counts of male and female profiles."""
    with _conn() as con:
        rows = con.execute(
            "SELECT gender, COUNT(*) as cnt FROM profiles GROUP BY gender"
        ).fetchall()
    counts = {"male": 0, "female": 0}
    for row in rows:
        if row["gender"] in counts:
            counts[row["gender"]] = row["cnt"]
    return counts


# ---------------------------------------------------------------------------
# Location cache
# ---------------------------------------------------------------------------

def get_cached_location(query: str) -> Optional[List[Dict]]:
    """Check L1 (memory) then L2 (SQLite). Returns parsed list or None."""
    key = query.strip().lower()

    if key in _mem_cache:
        return _mem_cache[key]

    with _conn() as con:
        row = con.execute(
            "SELECT results_json FROM location_cache WHERE query = ? COLLATE NOCASE",
            (key,)
        ).fetchone()
        if row:
            con.execute(
                "UPDATE location_cache SET hit_count = hit_count + 1 "
                "WHERE query = ? COLLATE NOCASE",
                (key,)
            )

    if row:
        results = json.loads(row[0])
        _mem_cache[key] = results
        return results

    return None


def save_location_cache(
    query: str, results: List[Dict], source: str = "nominatim"
) -> None:
    """Save geocoding results to L1 and L2."""
    key = query.strip().lower()
    _mem_cache[key] = results
    now = datetime.now(timezone.utc).isoformat()
    with _conn() as con:
        con.execute(
            "INSERT INTO location_cache(query,results_json,source,created_at) "
            "VALUES(?,?,?,?) "
            "ON CONFLICT(query) DO UPDATE SET results_json=excluded.results_json, "
            "source=excluded.source, hit_count=hit_count+1",
            (key, json.dumps(results), source, now)
        )
