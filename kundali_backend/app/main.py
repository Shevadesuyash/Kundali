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
import datetime
import logging
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app import ai_service, database
from app.rate_limiter import get_client_ip, check_ai_quota, record_ai_usage
from app.auth import get_optional_user, get_required_user, get_admin_user, is_admin, ADMIN_USER_ID
from app.astro_engine import VedicAstrologyEngine
from app.database import (
    count_profiles, delete_profile, get_gender_counts,
    get_profile_by_id, save_profile, search_profiles,
    search_profiles_typeahead, update_profile,
    search_all_profiles_admin, count_all_profiles_admin, get_admin_stats,
)
from app.geocode_service import search_locations
from app.kundali_analyzer import KundaliAnalyzer
from app.matchmaker import MatchMaker
from app.ashtakvarga_engine import AshtakvargaEngine
from app.transit_engine import TransitEngine
from app.panchang_engine import PanchangEngine
from app.kp_engine import KPEngine
from app.varshapal_engine import VarshapalEngine
from app.models import (
    AIChatRequest, BirthDetails, BulkMatchRequest, ErrorResponse, KundaliRequest, MatchRequest,
    MatchSavedRequest, ProfileDetail, ProfileListResponse,
    ProfileSummary, ProfileTypeahead, SaveProfileRequest, VarshapalRequest,
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

# Configure CORS
import os
cors_env = os.environ.get("CORS_ORIGINS", "*")
if cors_env == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True if allowed_origins != ["*"] else False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
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
            "/api/v1/transits/live", "/api/v1/match-bulk",
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
        # Attach the original person payload so the frontend can re-use it
        # for on-demand API calls (e.g. Load Full Ashtakvarga BAV).
        report["person"] = request.person.model_dump()
    except Exception as exc:  # noqa: BLE001
        logger.exception("Kundali generation failed")
        raise HTTPException(status_code=500, detail="Kundali calculation failed") from exc

    if request.include_ai_reading:
        report["ai_reading"] = ai_service.generate_individual_reading(report, language=request.language or "en")

    return report


@app.post(
    "/api/v1/ashtakvarga",
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def get_ashtakvarga(request: KundaliRequest):
    """
    On-demand full Bhinnashtakvarga (7 grahas x 8 references x 12 signs) + Sarvashtakvarga.
    """
    try:
        person = request.person.to_person()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        technical_profile = _astro_engine.get_technical_profile(person)
        bav_data = AshtakvargaEngine.calculate_full(technical_profile)
        return bav_data
    except Exception as exc:
        logger.exception("Ashtakvarga calculation failed")
        raise HTTPException(status_code=500, detail="Ashtakvarga calculation failed") from exc


# ---------------------------------------------------------------------------
# Phase 5A: Live Gochara / Sade Sati Transit Tracker
# ---------------------------------------------------------------------------

@app.get(
    "/api/v1/transits/live",
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def get_live_transits(
    moon_sign_index: int = Query(..., ge=0, le=11, description="Natal Moon sign index (0=Aries)"),
    lagna_sign_index: int = Query(..., ge=0, le=11, description="Natal Lagna sign index (0=Aries)"),
):
    """
    Returns current planetary positions (sidereal Lahiri) with Sade Sati phase,
    Dhaiya, and Jupiter Gochara status relative to natal Moon and Lagna.
    """
    try:
        return TransitEngine.get_current_transits(
            natal_moon_sign_index=moon_sign_index,
            natal_lagna_sign_index=lagna_sign_index,
        )
    except Exception as exc:
        logger.exception("Transit calculation failed")
        raise HTTPException(status_code=500, detail="Transit calculation failed") from exc


# ---------------------------------------------------------------------------
# Phase 6B: Daily Hindu Panchang & Muhurta Endpoint
# ---------------------------------------------------------------------------

@app.get(
    "/api/v1/panchang",
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def get_panchang_data(
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format (defaults to today)"),
    lat: float = Query(18.5204, ge=-90, le=90, description="Latitude (defaults to Pune)"),
    lon: float = Query(73.8567, ge=-180, le=180, description="Longitude (defaults to Pune)"),
    tz: str = Query("Asia/Kolkata", description="Timezone name"),
):
    """
    Computes complete 5-limb Vedic Panchang, Brahma/Abhijit Muhurtas, Rahu Kaal,
    Day Choghadiya slots, and Daily Devotional Deity & Mantra.
    """
    try:
        parsed_date = None
        if date:
            parsed_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()

        return PanchangEngine.get_panchang(
            target_date=parsed_date,
            lat=lat,
            lon=lon,
            timezone_str=tz,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid date format (expected YYYY-MM-DD): {exc}") from exc
    except Exception as exc:
        logger.exception("Panchang calculation failed")
        raise HTTPException(status_code=500, detail="Panchang calculation failed") from exc


# ---------------------------------------------------------------------------
# Phase 7A: KP Astrology System Endpoint
# ---------------------------------------------------------------------------

@app.post(
    "/api/v1/kp",
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def get_kp_system(request: KundaliRequest):
    """
    Returns full KP Astrology data: Placidus cusps, Sub Lords, Sub-Sub Lords,
    Planetary significators, and Ruling Planets.
    """
    try:
        person = request.person.to_person()
        tech = _astro_engine.get_technical_profile(person)
        return KPEngine.calculate_kp(
            jd=tech["julian_day"],
            lat=tech["birth"]["lat"],
            lon=tech["birth"]["lon"],
        )
    except Exception as exc:
        logger.exception("KP calculation failed")
        raise HTTPException(status_code=500, detail="KP calculation failed") from exc


# ---------------------------------------------------------------------------
# Phase 7B: Context-Aware Interactive AI Q&A Assistant
# ---------------------------------------------------------------------------

@app.post(
    "/api/v1/ai-chat",
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def ask_ai_assistant(request: AIChatRequest, http_req: Request, current_user: Optional[dict] = Depends(get_optional_user)):
    """
    Answers an interactive user question regarding a computed Kundali chart
    using Gemini 2.0 Flash with context-aware astrological facts and IP/wallet rate limiting.
    """
    try:
        if not request.question or not request.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")

        user_ip = get_client_ip(http_req)
        user_id = (current_user["id"] if current_user else None) or getattr(request, "user_id", None)

        allowed, next_avail, reason, meta = check_ai_quota(user_ip, user_id=user_id)
        if not allowed:
            next_str = next_avail.strftime('%H:%M UTC') if next_avail else '24 hours'
            return {
                "question": request.question,
                "answer": (
                    f"Free daily AI consultation limit reached (1 question per 24h). "
                    f"Your next free question opens at {next_str}. "
                    f"Upgrade to Explorer Pack (50 Questions for ₹49) or 24-Hour Consultation Pass for unlimited queries."
                ),
                "limit_reached": True,
                "next_available": meta.get("next_available"),
                "credits_remaining": 0,
                "reason": reason,
            }

        answer = ai_service.answer_chart_question(
            request.report,
            request.question.strip(),
            request.language or "en",
        )

        record_ai_usage(user_ip, user_id=user_id)

        return {
            "question": request.question,
            "answer": answer,
            "limit_reached": False,
            "credits_remaining": max(0, meta.get("credits_remaining", 1) - 1) if meta.get("type") == "credit" else 0,
            "quota_type": meta.get("type"),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("AI Chat failed")
        raise HTTPException(status_code=500, detail="AI Chat failed") from exc


# ---------------------------------------------------------------------------
# Phase 7C: Varshapal (Annual Solar Return / Tajika System)
# ---------------------------------------------------------------------------

@app.post(
    "/api/v1/varshapal",
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def get_varshapal_chart(request: VarshapalRequest):
    """
    Computes Tajika Varshapal solar return chart, Varsha Lagna, Muntha progression,
    and annual Mudda Dasha for the specified target year.
    """
    try:
        p = request.person
        return VarshapalEngine.calculate_varshapal(
            natal_year=p.year,
            natal_month=p.month,
            natal_day=p.day,
            natal_hour=p.hour,
            natal_minute=p.minute,
            lat=p.lat,
            lon=p.lon,
            target_year=request.target_year,
        )
    except Exception as exc:
        logger.exception("Varshapal calculation failed")
        raise HTTPException(status_code=500, detail="Varshapal calculation failed") from exc



# ---------------------------------------------------------------------------
# Phase 5C: Bulk Compatibility Matrix
# ---------------------------------------------------------------------------

@app.post(
    "/api/v1/match-bulk",
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def match_bulk(request: BulkMatchRequest):
    """
    Matches one anchor profile against all saved opposite-gender profiles.
    Returns a leaderboard sorted by Guna score (descending).
    """
    anchor_row = get_profile_by_id(request.anchor_profile_id)
    if not anchor_row:
        raise HTTPException(status_code=404, detail="Anchor profile not found")

    try:
        if request.candidate_ids:
            cand_rows = [get_profile_by_id(cid) for cid in request.candidate_ids]
            cand_rows = [r for r in cand_rows if r is not None]
        else:
            all_profiles = search_profiles(q="", page=1, per_page=500)
            cand_rows = [
                get_profile_by_id(r["id"])
                for r in all_profiles
                if r["id"] != request.anchor_profile_id
            ]
            cand_rows = [r for r in cand_rows if r is not None]

        def row_to_person(row):
            return BirthDetails(
                name=row["name"],
                year=row["year"], month=row["month"], day=row["day"],
                hour=row["hour"], minute=row["minute"],
                lat=row["lat"], lon=row["lon"],
                timezone_str=row["timezone_str"],
            ).to_person()

        results = []
        for cand in cand_rows:
            if cand["gender"] == anchor_row["gender"]:
                continue  # Ashtakoot requires opposite gender
            try:
                if anchor_row["gender"] == "male":
                    boy_row, girl_row = anchor_row, cand
                else:
                    boy_row, girl_row = cand, anchor_row

                match_result = _matchmaker.match_profiles(
                    row_to_person(boy_row),
                    row_to_person(girl_row),
                )
                guna = match_result["guna_milan"]
                papa = match_result.get("papa_samyam", {})

                results.append({
                    "profile_id":         cand["id"],
                    "name":               cand["name"],
                    "gender":             cand["gender"],
                    "birth_place":        cand.get("birth_place"),
                    "total_score":        guna["total_score"],
                    "out_of":             36,
                    "percent":            round((guna["total_score"] / 36) * 100, 1),
                    "verdict":            guna["verdict"],
                    "manglik_compatible": match_result.get("manglik_analysis", {}).get("combined_verdict", "N/A"),
                    "papa_anchor":        papa.get("male_score" if anchor_row["gender"] == "male" else "female_score"),
                    "papa_candidate":     papa.get("female_score" if anchor_row["gender"] == "male" else "male_score"),
                })
            except Exception:
                continue

        results.sort(key=lambda r: r["total_score"], reverse=True)
        return {
            "anchor_id":        anchor_row["id"],
            "anchor_name":      anchor_row["name"],
            "anchor_gender":    anchor_row["gender"],
            "total_candidates": len(results),
            "results":          results,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Bulk match failed")
        raise HTTPException(status_code=500, detail="Bulk match calculation failed") from exc


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
        result["ai_reading"] = ai_service.generate_match_reading(result, language=request.language or "en")

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
        id=row["id"], user_id=row.get("user_id"), name=row["name"], gender=row["gender"],
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
        id=row["id"], user_id=row.get("user_id"), name=row["name"], gender=row["gender"],
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
    status_code=200,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def create_profile(request: SaveProfileRequest, current_user: Optional[dict] = Depends(get_optional_user)):
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
    effective_user_id = (current_user["id"] if current_user else None) or request.user_id
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
        user_id=effective_user_id,
    )
    return _row_to_detail(get_profile_by_id(profile_id))


@app.get("/api/v1/profiles")
def list_profiles(
    q: str = "",
    gender: str = "",
    tag: str = "",
    page: int = 1,
    per_page: int = 20,
    current_user: Optional[dict] = Depends(get_optional_user),
):
    """Search / list saved profiles for the current user (or all if admin)."""
    # Determine which user_id to filter by
    if current_user:
        effective_user_id = current_user["id"]
    else:
        effective_user_id = None  # guest: show profiles with no user_id

    rows  = search_profiles(q or None, gender or None, tag or None, effective_user_id, page, per_page)
    total = count_profiles(q or None, gender or None, tag or None, effective_user_id)
    items = [_row_to_summary(r) for r in rows]

    # Gender counts scoped to this user
    gender_counts = get_gender_counts(user_id=effective_user_id)

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
        result["ai_reading"] = ai_service.generate_match_reading(result, language=request.language or "en")

    return result




# ===========================================================================
# Admin Endpoints — Protected by get_admin_user() (ADMIN_USER_ID in .env)
# ===========================================================================

@app.get("/api/v1/admin/stats")
def admin_stats(current_admin: dict = Depends(get_admin_user)):
    """Admin dashboard: system-wide statistics across all users."""
    stats = get_admin_stats()
    return {
        **stats,
        "admin_id": current_admin["id"],
        "admin_email": current_admin.get("email"),
    }


@app.get("/api/v1/admin/profiles")
def admin_list_all_profiles(
    q: str = "",
    gender: str = "",
    tag: str = "",
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=200),
    current_admin: dict = Depends(get_admin_user),
):
    """Admin: List ALL profiles from ALL users (no user_id filter)."""
    rows  = search_all_profiles_admin(q or None, gender or None, tag or None, page, per_page)
    total = count_all_profiles_admin(q or None, gender or None, tag or None)
    items = [_row_to_summary(r) for r in rows]
    gender_counts = get_gender_counts()
    return {
        "profiles": [p.model_dump() for p in items],
        "total": total,
        "page": page,
        "per_page": per_page,
        "male_count": gender_counts.get("male", 0),
        "female_count": gender_counts.get("female", 0),
        "admin_mode": True,
    }


@app.delete(
    "/api/v1/admin/profiles/{profile_id}",
    responses={404: {"model": ErrorResponse}},
)
def admin_delete_profile(profile_id: int, current_admin: dict = Depends(get_admin_user)):
    """Admin: Hard-delete any profile by ID (bypasses user ownership check)."""
    if not delete_profile(profile_id):
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"deleted": True, "id": profile_id, "deleted_by_admin": current_admin["id"]}


@app.get("/api/v1/geocode")
def geocode(q: str = ""):
    """Location search with 3-tier cache (memory -> SQLite -> Nominatim)."""
    if not q or len(q.strip()) < 2:
        return []
    return search_locations(q.strip())
