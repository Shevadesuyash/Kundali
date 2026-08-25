"""
app/ai_service.py
------------------
Optional AI layer: uses Google Gemini (google-generativeai) to turn the
structured Kundali / Guna Milan JSON into a readable, personalized
narrative reading plus remedies. This is purely presentational - all
astrological math happens upstream in astro_engine/ashtakoot/matchmaker.
The AI is only ever shown numbers we already computed; it is not asked
to invent astrological facts.

Configuration:
    Set the GEMINI_API_KEY environment variable. If it is not set, or
    the SDK call fails for any reason (quota, network, etc.), the
    service degrades gracefully and returns a `None` reading rather
    than breaking the API response - the numeric report is always the
    source of truth and is returned regardless.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Dict, Optional

logger = logging.getLogger(__name__)

_MODEL_NAME = "gemini-2.0-flash"


def _get_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        return genai.GenerativeModel(_MODEL_NAME)
    except Exception:  # pragma: no cover - defensive, SDK/env issues
        logger.exception("Failed to initialize Gemini client")
        return None


def generate_individual_reading(report: Dict) -> Optional[str]:
    model = _get_client()
    if model is None:
        return None

    # Only pass the compact, already-computed facts - never raw ephemeris
    # noise - so the model narrates rather than "calculates".
    facts = {
        "name": report["profile"].get("name"),
        "ascendant": report["ascendant"]["sign"],
        "moon_sign": report["moon_sign"],
        "moon_nakshatra": report["moon_nakshatra"],
        "moon_pada": report["moon_pada"],
        "varna": report["classification"]["varna"],
        "gana": report["classification"]["gana"],
        "nadi": report["classification"]["nadi"],
        "manglik": report["manglik_dosha"],
    }
    prompt = (
        "You are a warm, plain-spoken Vedic astrology assistant. Using ONLY the "
        "structured facts below (already computed by a Swiss-Ephemeris backend - "
        "do not invent or alter any placement), write a friendly 150-200 word "
        "personality/life-theme summary for this person, followed by 2-3 short, "
        "practical, non-medical general well-being suggestions if their Manglik "
        "status warrants a note. Do not state exact predictions about death, "
        "disease, or finances; keep it general and constructive.\n\n"
        f"FACTS:\n{json.dumps(facts, indent=2)}"
    )
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:  # pragma: no cover - network/quota failures
        logger.exception("Gemini generation failed for individual reading")
        return None


def generate_match_reading(match_report: Dict) -> Optional[str]:
    model = _get_client()
    if model is None:
        return None

    guna = match_report["guna_milan"]
    facts = {
        "boy_name": match_report["boy"]["profile"].get("name"),
        "girl_name": match_report["girl"]["profile"].get("name"),
        "total_score": guna["total_score"],
        "total_max": guna["total_max"],
        "verdict": guna["verdict"],
        "kootas": [
            {"name": k["koota"], "score": k["score"], "max": k["max"]}
            for k in guna["kootas"]
        ],
        "nadi_dosha": guna["nadi_dosha"],
        "bhakoot_dosha": guna["bhakoot_dosha"],
        "manglik_verdict": match_report["manglik_analysis"]["combined_verdict"],
    }
    prompt = (
        "You are a warm, balanced Vedic astrology assistant helping a family "
        "understand a Kundali Milan (marriage matching) report. Using ONLY the "
        "structured facts below (already computed - do not alter any score), "
        "write a clear 150-250 word plain-language summary of the compatibility, "
        "explain in simple terms what the weakest koota(s) mean in practice, and "
        "give 2-3 constructive, non-alarming next steps (e.g. 'discuss with an "
        "astrologer', 'consider remedies'). Avoid absolute pronouncements about "
        "the couple's fate; be supportive and balanced either way.\n\n"
        f"FACTS:\n{json.dumps(facts, indent=2)}"
    )
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:  # pragma: no cover
        logger.exception("Gemini generation failed for match reading")
        return None


def answer_chart_question(report: Dict, question: str) -> Optional[str]:
    """
    Answers an interactive user question regarding a computed Kundali chart
    using Gemini 2.0 Flash with context-aware facts.
    """
    model = _get_client()
    if model is None:
        return (
            "Interactive AI Assistant requires a configured GEMINI_API_KEY. "
            "Please set your GEMINI_API_KEY environment variable in .env to activate personalized AI Q&A."
        )

    # Extract relevant technical facts
    profile = report.get("profile", {})
    asc = report.get("ascendant", {})
    planets = report.get("planets", {})
    dasha = report.get("dasha_periods", [])
    current_dasha = next((d for d in dasha if d.get("is_current")), {})
    yogas = [y["name"] for y in report.get("yogas", []) if y.get("is_present")]
    manglik = report.get("manglik_dosha", {})
    transits = report.get("current_transits", {})
    sade_sati = transits.get("sade_sati", {})

    planet_summary = {
        p: f"H{data.get('house_from_lagna')} in {data.get('sign')}{' ℞' if data.get('retrograde') else ''}"
        for p, data in planets.items()
    }

    facts = {
        "person_name": profile.get("name"),
        "birth_date_time": profile.get("local"),
        "birth_place": report.get("birth_place") or f"Lat: {profile.get('lat')}, Lon: {profile.get('lon')}",
        "ascendant": f"{asc.get('sign')} (Nakshatra: {asc.get('nakshatra')})",
        "moon_sign": f"{report.get('moon_sign')} (Nakshatra: {report.get('moon_nakshatra')}, Pada {report.get('moon_pada')})",
        "planetary_placements": planet_summary,
        "current_mahadasha": f"{current_dasha.get('planet')} Dasha ({current_dasha.get('start_date')} to {current_dasha.get('end_date')})",
        "manglik_status": f"{'Manglik' if manglik.get('is_manglik') else 'Not Manglik'} (Severity: {manglik.get('severity', 'None')}, Papa Points: {manglik.get('papa_points', 0)})",
        "active_yogas": yogas,
        "sade_sati_status": f"{sade_sati.get('phase_label')} (Active: {sade_sati.get('active')})",
        "jupiter_transit": transits.get("jupiter_gochara", {}).get("description"),
    }

    prompt = (
        "You are an expert, compassionate Vedic Astrologer providing a personalized reading. "
        "Using ONLY the verified chart facts below (computed with Swiss Ephemeris), "
        "answer the user's specific question clearly, constructively, and empathetically.\n\n"
        "Structure your response with 3 concise markdown sections:\n"
        "### 1. 🔍 Astrological Diagnosis\n"
        "Explain the relevant planetary placements, house rulers, active Dasha, and Gochara transits influencing this question.\n\n"
        "### 2. 🌟 Opportunities & Timing\n"
        "Outline practical life themes, favorable windows, and considerations without making fatalistic claims.\n\n"
        "### 3. 🌿 Practical Remedies & Guidance\n"
        "Suggest constructive Vedic remedies (recommended mantras, gemstones, spiritual practices, or lifestyle adjustments).\n\n"
        f"VERIFIED CHART FACTS:\n{json.dumps(facts, indent=2)}\n\n"
        f"USER QUESTION: {question}"
    )

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        logger.exception("Gemini Q&A generation failed")
        return "Our astrological AI service is temporarily unavailable. Please try asking again in a moment."

