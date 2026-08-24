"""
app/main.py
-----------
FastAPI application. Primary endpoints:
    POST /api/v1/kundali          - individual Kundali report
    POST /api/v1/match            - Boy/Girl Kundali Milan (Ashtakoot + Manglik)
    GET/POST /api/v1/profiles     - profile CRUD
    PATCH /api/v1/profiles/{id}   - partial profile update
    DELETE /api/v1/profiles/{id}  - profile delete
    GET /api/v1/profiles/search   - lightweight typeahead search
    GET /api/v1/geocode           - location search

Runs identically locally (uvicorn) and inside AWS Lambda (via Mangum,
see lambda_handler.py).
"""
from __future__ import annotations

import logging
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app import ai_service, database
from app.astro_engine import VedicAstrologyEngine
from app.database import (
    count_profiles, delete_profile, get_gender_counts,
    get_profile_by_id, save_profile, search_profiles,
    search_profiles_typeahead, update_profile,
)
from app.geocode_service import search_locations
from app.kundali_analyzer import KundaliAnalyzer
from app.matchmaker import MatchMaker
from app.models import (
    BirthDetails, ErrorResponse, KundaliRequest, MatchRequest,
    MatchSavedRequest, ProfileDetail, ProfileListResponse,
    ProfileSummary, ProfileTypeahead, SaveProfileRequest,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kundali_api")

app = FastAPI(
    title="Kundali & Matchmaking API",
    description="Vedic astrology Kundali generation and Ashtakoot Guna Milan matchmaking engine.",
    version="2.0.0",
)

# Initialise SQLite DB — creates tables + seeds regional locations on first run
database.init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your frontend origin(s) in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Engines are stateless and cheap to share across requests / warm Lambda invocations.
_astro_engine = VedicAstrologyEngine()
_kundali_analyzer = KundaliAnalyzer(_astro_engine)
_matchmaker = MatchMaker()


@app.get("/")
def read_root():
    return {
        "message": "Kundali & Matchmaking API is running.",
        "documentation": "/docs",
        "health": "/health",
        "version": "2.0.0",
        "endpoints": [
            "/api/v1/kundali", "/api/v1/match",
            "/api/v1/profiles", "/api/v1/geocode",
        ]
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post(
    "/api/v1/kundali",
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def get_kundali(request: KundaliRequest):
    try:
        person = request.person.to_person()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        report = _kundali_analyzer.build_report(person)
        report.pop("_technical_profile", None)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Kundali generation failed")
        raise HTTPException(status_code=500, detail="Kundali calculation failed") from exc

    if request.include_ai_reading:
        report["ai_reading"] = ai_service.generate_individual_reading(report)

    return report


@app.post(
    "/api/v1/match",
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def get_match(request: MatchRequest):
    try:
        boy = request.boy.to_person()
        girl = request.girl.to_person()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        result = _matchmaker.match_profiles(boy, girl)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Matchmaking failed")
        raise HTTPException(status_code=500, detail="Matchmaking calculation failed") from exc

    if request.include_ai_reading:
        result["ai_reading"] = ai_service.generate_match_reading(result)

    return result


# ---------------------------------------------------------------------------
# Profile helpers
# ---------------------------------------------------------------------------

def _extract_active_dasha(dasha_periods: list) -> Optional[str]:
    """Return the planet name of the currently active Mahadasha."""
    if not dasha_periods:
        return None
    for period in dasha_periods:
        if period.get("is_current"):
            return period.get("planet")
    return None


def _row_to_summary(row: dict) -> ProfileSummary:
    return ProfileSummary(
        id=row["id"], name=row["name"], gender=row["gender"],
        birth_place=row["birth_place"],
        year=row["year"], month=row["month"], day=row["day"],
        moon_sign=row["moon_sign"], nakshatra=row["nakshatra"],
        lagna=row.get("lagna"),
        is_manglik=bool(row["is_manglik"]),
        active_dasha=row.get("active_dasha"),
        tag=row.get("tag", "self"),
        created_at=row["created_at"],
    )


def _row_to_detail(row: dict) -> ProfileDetail:
    return ProfileDetail(
        id=row["id"], name=row["name"], gender=row["gender"],
        birth_place=row["birth_place"],
        year=row["year"], month=row["month"], day=row["day"],
        hour=row["hour"], minute=row["minute"],
        lat=row["lat"], lon=row["lon"],
        timezone_str=row["timezone_str"],
        moon_sign=row["moon_sign"], nakshatra=row["nakshatra"],
        lagna=row.get("lagna"),
        is_manglik=bool(row["is_manglik"]),
        active_dasha=row.get("active_dasha"),
        tag=row.get("tag", "self"),
        created_at=row["created_at"],
    )


# ---------------------------------------------------------------------------
# Profile endpoints
# ---------------------------------------------------------------------------

@app.post(
    "/api/v1/profiles",
    response_model=ProfileDetail,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def create_profile(request: SaveProfileRequest):
    """Save a birth profile. Moon sign, Lagna, active Dasha & Manglik status computed at save time."""
    try:
        person = request.person.to_person()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        report = _kundali_analyzer.build_report(person, include_charts=False)
        report.pop("_technical_profile", None)
        moon_sign    = report.get("moon_sign")
        nakshatra    = report.get("moon_nakshatra")
        lagna        = report.get("ascendant", {}).get("sign")
        dasha_periods = report.get("dasha_periods", [])
        active_dasha = _extract_active_dasha(dasha_periods)
        md           = report.get("manglik_dosha", {})
        is_manglik   = bool(md.get("is_manglik") and not md.get("is_cancelled"))
    except Exception:
        logger.exception("Kundali compute failed during profile save")
        moon_sign = nakshatra = lagna = active_dasha = None
        is_manglik = False

    bd = request.person
    profile_id = save_profile(
        name=bd.name, gender=request.gender,
        year=bd.year, month=bd.month, day=bd.day,
        hour=bd.hour, minute=bd.minute,
        lat=bd.lat, lon=bd.lon,
        timezone_str=bd.timezone_str,
        birth_place=request.birth_place,
        moon_sign=moon_sign, nakshatra=nakshatra,
        lagna=lagna,
        is_manglik=is_manglik,
        active_dasha=active_dasha,
        tag=request.tag or "self",
    )
    return _row_to_detail(get_profile_by_id(profile_id))


@app.get("/api/v1/profiles")
def list_profiles(
    q: str = "",
    gender: str = "",
    tag: str = "",
    page: int = 1,
    per_page: int = 20,
):
    """Search / list saved profiles. Supports name search, gender filter, and tag filter."""
    rows  = search_profiles(q or None, gender or None, tag or None, page, per_page)
    total = count_profiles(q or None, gender or None, tag or None)
    items = [_row_to_summary(r) for r in rows]

    # Attach gender breakdown counts for dashboard stats bar
    gender_counts = get_gender_counts()

    response = ProfileListResponse(
        profiles=items, total=total, page=page, per_page=per_page
    )
    # Inject counts as extra fields (FastAPI/Pydantic v2 allows this via model_config extra=allow,
    # but for simplicity we return a plain dict here)
    return {
        "profiles": [p.model_dump() for p in items],
        "total": total,
        "page": page,
        "per_page": per_page,
        "male_count": gender_counts.get("male", 0),
        "female_count": gender_counts.get("female", 0),
    }


@app.get(
    "/api/v1/profiles/search",
    response_model=List[ProfileTypeahead],
)
def typeahead_profiles(q: str = Query(default="", min_length=2), limit: int = 5):
    """
    Lightweight typeahead endpoint for the auto-fill name dropdown.
    Returns minimal profile fields needed to populate the birth details form.
    """
    if not q or len(q.strip()) < 2:
        return []
    rows = search_profiles_typeahead(q.strip(), min(limit, 10))
    return [
        ProfileTypeahead(
            id=r["id"], name=r["name"], gender=r["gender"],
            year=r["year"], month=r["month"], day=r["day"],
            hour=r["hour"], minute=r["minute"],
            lat=r["lat"], lon=r["lon"],
            timezone_str=r["timezone_str"],
            birth_place=r.get("birth_place"),
            lagna=r.get("lagna"),
            moon_sign=r.get("moon_sign"),
        )
        for r in rows
    ]


@app.get(
    "/api/v1/profiles/{profile_id}",
    response_model=ProfileDetail,
    responses={404: {"model": ErrorResponse}},
)
def get_profile(profile_id: int):
    """Get a single full profile by ID."""
    row = get_profile_by_id(profile_id)
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _row_to_detail(row)


class ProfileUpdateRequest(BaseModel):
    """Partial update payload — all fields optional."""
    name: Optional[str] = None
    gender: Optional[str] = None
    year: Optional[int] = None
    month: Optional[int] = None
    day: Optional[int] = None
    hour: Optional[int] = None
    minute: Optional[int] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    timezone_str: Optional[str] = None
    birth_place: Optional[str] = None
    tag: Optional[str] = None


@app.patch(
    "/api/v1/profiles/{profile_id}",
    response_model=ProfileDetail,
    responses={404: {"model": ErrorResponse}, 400: {"model": ErrorResponse}},
)
def patch_profile(profile_id: int, request: ProfileUpdateRequest):
    """Partially update a saved profile. Re-computes astro fields if birth details change."""
    row = get_profile_by_id(profile_id)
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Build the fields to update (ignore None and empty strings)
    updates = {k: v for k, v in request.model_dump().items() if v is not None and v != ""}


    # If any birth data changed, recompute moon_sign, lagna, dasha, manglik
    birth_fields = {"year", "month", "day", "hour", "minute", "lat", "lon", "timezone_str"}
    if birth_fields & set(updates.keys()):
        merged = {**row, **updates}
        try:
            bd = BirthDetails(
                name=merged["name"],
                year=merged["year"], month=merged["month"], day=merged["day"],
                hour=merged["hour"], minute=merged["minute"],
                lat=merged["lat"], lon=merged["lon"],
                timezone_str=merged["timezone_str"],
            )
            person = bd.to_person()
            report = _kundali_analyzer.build_report(person, include_charts=False)
            report.pop("_technical_profile", None)
            updates["moon_sign"]    = report.get("moon_sign")
            updates["nakshatra"]    = report.get("moon_nakshatra")
            updates["lagna"]        = report.get("ascendant", {}).get("sign")
            updates["active_dasha"] = _extract_active_dasha(report.get("dasha_periods", []))
            md = report.get("manglik_dosha", {})
            updates["is_manglik"]   = 1 if (md.get("is_manglik") and not md.get("is_cancelled")) else 0
        except Exception:
            logger.exception("Recompute failed during patch")

    update_profile(profile_id, **updates)
    return _row_to_detail(get_profile_by_id(profile_id))


@app.delete(
    "/api/v1/profiles/{profile_id}",
    responses={404: {"model": ErrorResponse}},
)
def remove_profile(profile_id: int):
    """Hard-delete a saved profile by ID."""
    if not delete_profile(profile_id):
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"deleted": True, "id": profile_id}


@app.post(
    "/api/v1/match-saved",
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse},
               500: {"model": ErrorResponse}},
)
def match_saved_profiles(request: MatchSavedRequest):
    """Run Guna Milan for two already-saved profiles by ID."""
    boy_row  = get_profile_by_id(request.boy_id)
    girl_row = get_profile_by_id(request.girl_id)
    if not boy_row:
        raise HTTPException(status_code=404, detail=f"Profile {request.boy_id} not found")
    if not girl_row:
        raise HTTPException(status_code=404, detail=f"Profile {request.girl_id} not found")

    def _to_person(row):
        return BirthDetails(
            name=row["name"], year=row["year"], month=row["month"], day=row["day"],
            hour=row["hour"], minute=row["minute"],
            lat=row["lat"], lon=row["lon"], timezone_str=row["timezone_str"],
        ).to_person()

    try:
        result = _matchmaker.match_profiles(_to_person(boy_row), _to_person(girl_row))
    except Exception as exc:
        logger.exception("match-saved failed")
        raise HTTPException(status_code=500, detail="Matchmaking calculation failed") from exc

    if request.include_ai_reading:
        result["ai_reading"] = ai_service.generate_match_reading(result)

    return result


@app.get("/api/v1/geocode")
def geocode(q: str = ""):
    """Location search with 3-tier cache (memory -> SQLite -> Nominatim)."""
    if not q or len(q.strip()) < 2:
        return []
    return search_locations(q.strip())
