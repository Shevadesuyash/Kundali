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

from app import ai_service
from app.astro_engine import VedicAstrologyEngine
from app.kundali_analyzer import KundaliAnalyzer
from app.matchmaker import MatchMaker
from app.models import ErrorResponse, KundaliRequest, MatchRequest

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kundali_api")

app = FastAPI(
    title="Kundali & Matchmaking API",
    description="Vedic astrology Kundali generation and Ashtakoot Guna Milan matchmaking engine.",
    version="1.0.0",
)

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
