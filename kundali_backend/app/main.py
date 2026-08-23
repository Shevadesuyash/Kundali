"""
app/main.py
-----------
FastAPI application. Two primary endpoints:
    POST /api/v1/kundali  - individual Kundali report
    POST /api/v1/match    - Boy/Girl Kundali Milan (Ashtakoot + Manglik)

Runs identically locally (uvicorn) and inside AWS Lambda (via Mangum,
see lambda_handler.py).
"""
from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import ai_service, database
from app.astro_engine import VedicAstrologyEngine
from app.database import count_profiles, get_profile_by_id, save_profile, search_profiles
from app.geocode_service import search_locations
from app.kundali_analyzer import KundaliAnalyzer
from app.matchmaker import MatchMaker
from app.models import (
    BirthDetails, ErrorResponse, KundaliRequest, MatchRequest,
    MatchSavedRequest, ProfileDetail, ProfileListResponse,
    ProfileSummary, SaveProfileRequest,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kundali_api")

app = FastAPI(
    title="Kundali & Matchmaking API",
    description="Vedic astrology Kundali generation and Ashtakoot Guna Milan matchmaking engine.",
    version="1.0.0",
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
        "endpoints": ["/api/v1/kundali", "/api/v1/match"]
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
# Profile endpoints
# ---------------------------------------------------------------------------

def _row_to_detail(row: dict) -> ProfileDetail:
    return ProfileDetail(
        id=row["id"], name=row["name"], gender=row["gender"],
        birth_place=row["birth_place"],
        year=row["year"], month=row["month"], day=row["day"],
        hour=row["hour"], minute=row["minute"],
        lat=row["lat"], lon=row["lon"],
        timezone_str=row["timezone_str"],
        moon_sign=row["moon_sign"], nakshatra=row["nakshatra"],
        is_manglik=bool(row["is_manglik"]),
        created_at=row["created_at"],
    )


@app.post(
    "/api/v1/profiles",
    response_model=ProfileDetail,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def create_profile(request: SaveProfileRequest):
    """Save a birth profile. Moon sign + effective Manglik status computed at save time."""
    try:
        person = request.person.to_person()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        report = _kundali_analyzer.build_report(person, include_charts=False)
        report.pop("_technical_profile", None)
        moon_sign  = report.get("moon_sign")
        nakshatra  = report.get("moon_nakshatra")
        md         = report.get("manglik_dosha", {})
        is_manglik = bool(md.get("is_manglik") and not md.get("is_cancelled"))
    except Exception:
        logger.exception("Kundali compute failed during profile save")
        moon_sign = nakshatra = None
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
        is_manglik=is_manglik,
    )
    return _row_to_detail(get_profile_by_id(profile_id))


@app.get(
    "/api/v1/profiles",
    response_model=ProfileListResponse,
)
def list_profiles(q: str = "", gender: str = "", page: int = 1, per_page: int = 20):
    """Search / list saved profiles. Supports name search and gender filter."""
    rows  = search_profiles(q or None, gender or None, page, per_page)
    total = count_profiles(q or None, gender or None)
    items = [
        ProfileSummary(
            id=r["id"], name=r["name"], gender=r["gender"],
            birth_place=r["birth_place"],
            year=r["year"], month=r["month"], day=r["day"],
            moon_sign=r["moon_sign"], nakshatra=r["nakshatra"],
            is_manglik=bool(r["is_manglik"]),
            created_at=r["created_at"],
        )
        for r in rows
    ]
    return ProfileListResponse(profiles=items, total=total, page=page, per_page=per_page)


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
        raise HTTPException(status_code=404, detail=f"Boy profile {request.boy_id} not found")
    if not girl_row:
        raise HTTPException(status_code=404, detail=f"Girl profile {request.girl_id} not found")

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
