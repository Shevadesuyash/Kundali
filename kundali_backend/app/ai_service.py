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
