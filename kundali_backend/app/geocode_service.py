"""
app/geocode_service.py
----------------------
3-tier geocoding cache: in-memory -> SQLite -> Nominatim HTTP.
Uses Python stdlib urllib only — no extra dependencies.
"""
from __future__ import annotations

import json
import logging
import urllib.parse
import urllib.request
from typing import Dict, List

from app.database import get_cached_location, save_location_cache

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT    = "KundaliApp/1.0 (local)"


def _fetch_nominatim(query: str) -> List[Dict]:
    """Direct Nominatim HTTP call via stdlib urllib."""
    params = urllib.parse.urlencode({
        "q":              query,
        "format":         "json",
        "addressdetails": "1",
        "limit":          "8",
        "accept-language": "en",
    })
    url = f"{NOMINATIM_URL}?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            return data if isinstance(data, list) else []
    except Exception as exc:
        logger.warning("Nominatim call failed for %r: %s", query, exc)
        return []


def search_locations(query: str) -> List[Dict]:
    """
    3-tier lookup:
      L1 — in-memory dict        (microseconds, lost on restart)
      L2 — SQLite location_cache (milliseconds, persisted)
      L3 — Nominatim HTTP call   (500ms-2s, saved to L1+L2)
    """
    if not query or len(query.strip()) < 2:
        return []

    cached = get_cached_location(query)
    if cached is not None:
        logger.debug("Geocode cache HIT for %r", query)
        return cached

    logger.debug("Geocode cache MISS for %r — calling Nominatim", query)
    results = _fetch_nominatim(query)
    if results:
        save_location_cache(query, results, source="nominatim")
    return results
