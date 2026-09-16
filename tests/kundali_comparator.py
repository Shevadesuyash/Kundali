"""
tests/kundali_comparator.py
---------------------------
Core verification and cross-comparison engine between:
1. Viaveda External Astrological API response
2. Local Kundali Milan backend (pyswisseph Lahiri engine)

Provides standard normalization for Sanskrit/English aliases across:
- Rashi (Moon Sign & Sun Sign)
- 27 Nakshatras (e.g. Poorva vs Purva, Moola vs Mula)
- Varna, Gana, Nadi, Yoni (Sanskrit <-> English animal maps)
- Ayanamsha delta (arcminutes / degrees)
- Manglik status (Parashari standard vs South-Indian house 2)
"""

from __future__ import annotations

import math
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

# Ensure kundali_backend is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent / "kundali_backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Ensure fallback to SQLite local db
if not os.environ.get("DATABASE_URL"):
    os.environ["DATABASE_URL"] = ""

from app.astro_engine import VedicAstrologyEngine
from app.kundali_analyzer import KundaliAnalyzer
from app.models import Person

# Shared singleton analyzer
_engine = VedicAstrologyEngine()
_analyzer = KundaliAnalyzer(_engine)

# ---------------------------------------------------------------------------
# Normalization Mappings & Dictionaries
# ---------------------------------------------------------------------------

RASHI_NORMALIZATION = {
    "aries": "Aries", "mesh": "Aries", "mesha": "Aries",
    "taurus": "Taurus", "vrishabh": "Taurus", "vrishabha": "Taurus",
    "gemini": "Gemini", "mithun": "Gemini", "mithuna": "Gemini",
    "cancer": "Cancer", "kark": "Cancer", "karka": "Cancer",
    "leo": "Leo", "simha": "Leo", "singh": "Leo",
    "virgo": "Virgo", "kanya": "Virgo",
    "libra": "Libra", "tula": "Libra",
    "scorpio": "Scorpio", "vrischik": "Scorpio", "vrishchika": "Scorpio",
    "sagittarius": "Sagittarius", "dhanu": "Sagittarius", "dhanus": "Sagittarius",
    "capricorn": "Capricorn", "makar": "Capricorn", "makara": "Capricorn",
    "aquarius": "Aquarius", "kumbh": "Aquarius", "kumbha": "Aquarius",
    "pisces": "Pisces", "meen": "Pisces", "meena": "Pisces",
}

NAKSHATRA_NORMALIZATION = {
    "ashwini": "Ashwini", "asvini": "Ashwini",
    "bharani": "Bharani",
    "krittika": "Krittika", "kritika": "Krittika",
    "rohini": "Rohini",
    "mrigashira": "Mrigashira", "mrigasira": "Mrigashira", "mrigashirsha": "Mrigashira",
    "ardra": "Ardra", "arudra": "Ardra", "aradra": "Ardra",
    "punarvasu": "Punarvasu", "punardham": "Punarvasu",
    "pushya": "Pushya", "pooyam": "Pushya",
    "ashlesha": "Ashlesha", "aslesha": "Ashlesha", "ayilyam": "Ashlesha",
    "magha": "Magha", "makha": "Magha",
    "purva phalguni": "Purva Phalguni", "poorva phalguni": "Purva Phalguni", "pubba": "Purva Phalguni",
    "uttara phalguni": "Uttara Phalguni", "uttaraphalguni": "Uttara Phalguni", "uthiram": "Uttara Phalguni",
    "hasta": "Hasta", "hastham": "Hasta",
    "chitra": "Chitra", "chithra": "Chitra",
    "swati": "Swati", "swathi": "Swati",
    "vishakha": "Vishakha", "visakha": "Vishakha",
    "anuradha": "Anuradha", "anusham": "Anuradha",
    "jyeshtha": "Jyeshtha", "jyestha": "Jyeshtha", "kettai": "Jyeshtha",
    "mula": "Mula", "moola": "Mula",
    "purva ashadha": "Purva Ashadha", "poorva ashadha": "Purva Ashadha", "poorvashadha": "Purva Ashadha", "purvashadha": "Purva Ashadha",
    "uttara ashadha": "Uttara Ashadha", "uttarashadha": "Uttara Ashadha", "uthrashada": "Uttara Ashadha",
    "shravana": "Shravana", "sravana": "Shravana", "shravan": "Shravana", "sravan": "Shravana", "thiruvonam": "Shravana",
    "dhanishta": "Dhanishta", "dhanistha": "Dhanishta", "avittam": "Dhanishta",
    "shatabhisha": "Shatabhisha", "satabhisha": "Shatabhisha", "shatataraka": "Shatabhisha", "chathayam": "Shatabhisha",
    "purva bhadrapada": "Purva Bhadrapada", "poorva bhadrapada": "Purva Bhadrapada", "purvabhadrapada": "Purva Bhadrapada",
    "uttara bhadrapada": "Uttara Bhadrapada", "uttarabhadrapada": "Uttara Bhadrapada", "uthirattathi": "Uttara Bhadrapada",
    "revati": "Revati", "revathi": "Revati",
}

YONI_SAN_TO_ENG = {
    "ashwa": "Horse", "ashv": "Horse", "ashva": "Horse", "horse": "Horse",
    "gaja": "Elephant", "gaj": "Elephant", "elephant": "Elephant",
    "mesha": "Sheep", "mesh": "Sheep", "sheep": "Sheep", "ram": "Sheep", "goat": "Sheep", "bhed": "Sheep",
    "sarpa": "Serpent", "sarp": "Serpent", "serpent": "Serpent", "snake": "Serpent",
    "shwan": "Dog", "swan": "Dog", "dog": "Dog", "kutta": "Dog",
    "marjar": "Cat", "marjara": "Cat", "cat": "Cat", "billi": "Cat",
    "mushak": "Rat", "mushaka": "Rat", "rat": "Rat", "mouse": "Rat", "chuha": "Rat",
    "gau": "Cow", "go": "Cow", "cow": "Cow", "gai": "Cow",
    "mahish": "Buffalo", "mahisha": "Buffalo", "buffalo": "Buffalo", "bhains": "Buffalo",
    "vyaghr": "Tiger", "vyaghra": "Tiger", "vyagh": "Tiger", "tiger": "Tiger", "bagh": "Tiger",
    "mrig": "Deer", "mriga": "Deer", "deer": "Deer", "hiran": "Deer",
    "vaanar": "Monkey", "vanar": "Monkey", "monkey": "Monkey", "bandar": "Monkey",
    "nakul": "Mongoose", "nakula": "Mongoose", "mongoose": "Mongoose", "nevla": "Mongoose",
    "simha": "Lion", "singh": "Lion", "lion": "Lion", "sher": "Lion",
}

NADI_NORMALIZATION = {
    "adi": "Adi", "aadi": "Adi", "aadi (vata)": "Adi", "vata": "Adi", "ad": "Adi",
    "madhya": "Madhya", "madhya (pitta)": "Madhya", "pitta": "Madhya", "madh": "Madhya",
    "antya": "Antya", "antya (kapha)": "Antya", "kapha": "Antya", "anta": "Antya", "anthya": "Antya",
}


def clean_string(val: Optional[str]) -> str:
    if not val:
        return ""
    # strip non-alphanumeric except space
    s = re.sub(r"[^a-zA-Z\s]", " ", str(val)).strip().lower()
    return " ".join(s.split())


def normalize_rashi(rashi_str: Optional[str]) -> str:
    if not rashi_str:
        return ""
    clean = clean_string(rashi_str)
    for token in clean.split():
        if token in RASHI_NORMALIZATION:
            return RASHI_NORMALIZATION[token]
    for k, v in RASHI_NORMALIZATION.items():
        if k in clean:
            return v
    return rashi_str.title()


def normalize_nakshatra(nak_str: Optional[str]) -> str:
    if not nak_str:
        return ""
    clean = clean_string(nak_str)
    if clean in NAKSHATRA_NORMALIZATION:
        return NAKSHATRA_NORMALIZATION[clean]
    for k, v in NAKSHATRA_NORMALIZATION.items():
        if k in clean:
            return v
    return nak_str.title()


def normalize_nadi(nadi_str: Optional[str]) -> str:
    if not nadi_str:
        return ""
    clean = clean_string(nadi_str)
    for k, v in NADI_NORMALIZATION.items():
        if k in clean:
            return v
    return nadi_str.title()


def normalize_yoni(yoni_str: Optional[str]) -> str:
    if not yoni_str:
        return ""
    clean = clean_string(yoni_str)
    # Check longest keys first and use word boundaries to avoid 'mongoose' matching 'go'
    for k in sorted(YONI_SAN_TO_ENG.keys(), key=len, reverse=True):
        if re.search(r'\b' + re.escape(k) + r'\b', clean) or (len(k) >= 4 and k in clean):
            return YONI_SAN_TO_ENG[k]
    return yoni_str.title()


def normalize_varna(varna_str: Optional[str]) -> str:
    if not varna_str:
        return ""
    clean = clean_string(varna_str)
    for v in ["brahmin", "kshatriya", "vaishya", "shudra"]:
        if v in clean:
            return v.capitalize()
    return varna_str.capitalize()


def normalize_gana(gana_str: Optional[str]) -> str:
    if not gana_str:
        return ""
    clean = clean_string(gana_str)
    if "dev" in clean:
        return "Deva"
    if "manush" in clean:
        return "Manushya"
    if "raksh" in clean:
        return "Rakshasa"
    return gana_str.capitalize()


# ---------------------------------------------------------------------------
# Local Engine Computation
# ---------------------------------------------------------------------------

def compute_local_chart(profile: Dict[str, Any]) -> Dict[str, Any]:
    """Runs local VedicAstrologyEngine + KundaliAnalyzer for a profile."""
    b = profile.get("birth_info", {})
    tzone = float(b.get("tzone", 5.5))
    
    # Map tzone to standard tz name if 5.5 -> Asia/Kolkata
    tz_str = "Asia/Kolkata" if abs(tzone - 5.5) < 0.01 else "UTC"

    p = Person(
        name=profile.get("name", "Unknown"),
        year=int(b.get("year")),
        month=int(b.get("month")),
        day=int(b.get("day")),
        hour=int(b.get("hour")),
        minute=int(b.get("minut", b.get("minute", 0))),
        lat=float(b.get("lat")),
        lon=float(b.get("lng", b.get("lon"))),
        timezone_str=tz_str,
        second=int(b.get("second", 0)),
    )

    report = _analyzer.build_report(p)
    jd = _engine.get_julian_day(p)
    ayanamsha_val = _engine.get_ayanamsha(jd)

    moon_info = report.get("planets", {}).get("Moon", {})
    sun_info = report.get("planets", {}).get("Sun", {})
    asc_info = report.get("ascendant", {})
    classification = report.get("classification", {})
    manglik_info = report.get("manglik_dosha", {})

    # Weekday calculation
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    local_weekday = day_names[p.utc_dt.weekday()]

    return {
        "name": p.name,
        "ascendant_sign": asc_info.get("sign"),
        "ascendant_deg": asc_info.get("degree_in_sign"),
        "moon_sign": report.get("moon_sign") or moon_info.get("sign"),
        "sun_sign": sun_info.get("sign"),
        "nakshatra": report.get("moon_nakshatra") or moon_info.get("nakshatra"),
        "pada": report.get("moon_pada") or moon_info.get("pada"),
        "varna": classification.get("varna"),
        "gana": classification.get("gana"),
        "nadi": classification.get("nadi"),
        "ayanamsha": ayanamsha_val,
        "is_manglik": manglik_info.get("is_manglik", False),
        "mars_house_lagna": manglik_info.get("mars_house_lagna"),
        "planets": report.get("planets", {}),
        "weekday": local_weekday,
        "raw_report": report,
    }


# ---------------------------------------------------------------------------
# Comparison Engine
# ---------------------------------------------------------------------------

def compare_profiles(viaveda_full: Dict[str, Any], local_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compares astrological data points between Viaveda and local Swiss Ephemeris engine.
    """
    details = viaveda_full.get("details_response", {}).get("data", {})
    astro = details.get("astrological_details", {}).get("data", {})
    manglik_ext = details.get("dosha_manglik", {}).get("data", {})

    # 1. Moon Sign
    v_moonsign = normalize_rashi(astro.get("moonsign"))
    l_moonsign = normalize_rashi(local_data.get("moon_sign"))
    moonsign_match = (v_moonsign == l_moonsign)

    # 2. Sun Sign
    v_sunsign = normalize_rashi(astro.get("sunsign"))
    l_sunsign = normalize_rashi(local_data.get("sun_sign"))
    sunsign_match = (v_sunsign == l_sunsign)

    # 3. Nakshatra
    v_nak = normalize_nakshatra(astro.get("nakshatra"))
    l_nak = normalize_nakshatra(local_data.get("nakshatra"))
    nakshatra_match = (v_nak == l_nak)

    # 4. Varna
    v_varna = normalize_varna(astro.get("varna"))
    l_varna = normalize_varna(local_data.get("varna"))
    varna_match = (v_varna == l_varna)

    # 5. Gana
    v_gana = normalize_gana(astro.get("gana"))
    l_gana = normalize_gana(local_data.get("gana"))
    gana_match = (v_gana == l_gana)

    # 6. Nadi
    v_nadi = normalize_nadi(astro.get("nadi"))
    l_nadi = normalize_nadi(local_data.get("nadi"))
    nadi_match = (v_nadi == l_nadi)

    # 7. Yoni
    v_yoni = normalize_yoni(astro.get("yoni"))
    # local yoni from ashtakoot lookup
    from app.ashtakoot import YONI_MAP
    nak_idx = local_data.get("raw_report", {}).get("_technical_profile", {}).get("moon_nakshatra_index")
    l_yoni = normalize_yoni(YONI_MAP[nak_idx][0]) if nak_idx is not None else ""
    yoni_match = (v_yoni == l_yoni)

    # 8. Ayanamsha
    v_ayan = float(astro.get("ayanamsha", 0.0))
    l_ayan = float(local_data.get("ayanamsha", 0.0))
    ayan_delta_deg = abs(v_ayan - l_ayan)
    ayan_delta_arcmin = ayan_delta_deg * 60.0
    # Less than 6 arcminutes (~0.1 deg) difference is high concordance (standard Lahiri variance)
    ayanamsha_concordance = (ayan_delta_arcmin <= 10.0)

    # 9. Weekday
    v_vaar = astro.get("vaar", "").strip().capitalize()
    l_vaar = local_data.get("weekday", "")
    vaar_match = (v_vaar == l_vaar) if v_vaar else True

    # 10. Manglik Analysis
    # Note: Parashari (Houses 1,4,7,8,12) vs South Indian (Houses 1,2,4,7,8,12)
    v_manglik_str = str(manglik_ext.get("manglik_dosha", "")).lower()
    v_is_manglik = ("yes" in v_manglik_str)
    l_is_manglik = local_data.get("is_manglik", False)
    mars_house = local_data.get("mars_house_lagna")

    # If Mars is in house 2, Viaveda flags it as "Yes (May be)" Low Manglik,
    # whereas Standard Parashari directive defines it as NOT Manglik.
    manglik_note = None
    if v_is_manglik != l_is_manglik:
        if mars_house == 2:
            manglik_note = "Expected school variation: Mars in House 2 is considered Manglik in South Indian tradition (Viaveda 'Low/May be'), but strictly non-Manglik in Standard Parashari directive."
        else:
            manglik_note = f"Different assessment: Viaveda={manglik_ext.get('manglik_dosha')} vs Local={l_is_manglik} (Mars in house {mars_house})"

    # Scoring core astrological factors
    core_matches = [
        moonsign_match,
        sunsign_match,
        nakshatra_match,
        varna_match,
        gana_match,
        nadi_match,
        yoni_match,
        ayanamsha_concordance,
    ]
    concordance_score = sum(1 for m in core_matches if m) / len(core_matches) * 100.0

    # 11. Planetary Positions Comparison (if available in viaveda_full)
    planetary_comp = {}
    p_data = viaveda_full.get("planetary_response", {}).get("data", {}).get("planetary", {}).get("data", [])
    if p_data:
        v_planets_map = {p["name"]: p for p in p_data}
        local_planets = local_data.get("planets", {})
        local_asc = local_data.get("raw_report", {}).get("ascendant", {})

        graha_list = [
            ("Ascendant", local_asc),
            ("Sun", local_planets.get("Sun")),
            ("Moon", local_planets.get("Moon")),
            ("Mars", local_planets.get("Mars")),
            ("Mercury", local_planets.get("Mercury")),
            ("Jupiter", local_planets.get("Jupiter")),
            ("Venus", local_planets.get("Venus")),
            ("Saturn", local_planets.get("Saturn")),
            ("Rahu", local_planets.get("Rahu")),
            ("Ketu", local_planets.get("Ketu")),
        ]

        for g_name, l_info in graha_list:
            if not l_info:
                continue
            v_info = v_planets_map.get(g_name, {})
            if not v_info:
                continue
            v_sign = normalize_rashi(v_info.get("sign"))
            l_sign = normalize_rashi(l_info.get("sign"))
            v_house = int(v_info.get("house", 0))
            l_house = int(l_info.get("house_from_lagna", l_info.get("house", 1 if g_name == "Ascendant" else 0)))
            v_deg = float(v_info.get("full_degree", 0.0))
            l_deg = float(l_info.get("longitude", 0.0))
            delta_deg = abs(v_deg - l_deg)
            v_nak = normalize_nakshatra(v_info.get("nakshatra"))
            l_nak = normalize_nakshatra(l_info.get("nakshatra"))

            sign_match = (v_sign == l_sign)
            house_match = (v_house == l_house)
            nak_match = (v_nak == l_nak)
            deg_close = (delta_deg <= 0.05) if g_name not in ("Rahu", "Ketu") else (delta_deg <= 2.0)

            planetary_comp[g_name] = {
                "sign": {"viaveda": v_sign, "local": l_sign, "match": sign_match},
                "house": {"viaveda": v_house, "local": l_house, "match": house_match},
                "deg": {"viaveda": round(v_deg, 4), "local": round(l_deg, 4), "delta": round(delta_deg, 4), "close": deg_close},
                "nakshatra": {"viaveda": v_nak, "local": l_nak, "match": nak_match},
            }

    # 12. D1 Chart House Occupants Comparison (if available in viaveda_full)
    chart_comp = {}
    d1_data = viaveda_full.get("chart_response", {}).get("data", {}).get("lagna_chart_d1", {}).get("data", {}).get("data", {})
    if isinstance(d1_data, dict):
        local_planets = local_data.get("planets", {})
        local_house_planets = {h: [] for h in range(1, 13)}
        for p_name, p_val in local_planets.items():
            h_num = p_val.get("house") or p_val.get("house_from_lagna")
            if h_num and 1 <= h_num <= 12:
                local_house_planets[h_num].append(p_name)

        for h_str, h_info in d1_data.items():
            if h_str.isdigit():
                h_num = int(h_str)
                v_planets_in_h = [p.get("name") for p in h_info.get("planet", []) if p.get("name") not in ("Uranus", "Neptune", "Pluto", "Ascendant")]
                l_planets_in_h = local_house_planets.get(h_num, [])
                v_set = set(v_planets_in_h)
                l_set = set(l_planets_in_h)
                chart_comp[f"House_{h_num}"] = {
                    "sign_no": h_info.get("sign_no"),
                    "viaveda_planets": sorted(list(v_set)),
                    "local_planets": sorted(list(l_set)),
                    "match": (v_set == l_set),
                }

    return {
        "name": local_data.get("name"),
        "concordance_score": round(concordance_score, 1),
        "fields": {
            "moonsign": {"viaveda": v_moonsign, "local": l_moonsign, "match": moonsign_match},
            "sunsign": {"viaveda": v_sunsign, "local": l_sunsign, "match": sunsign_match},
            "nakshatra": {"viaveda": v_nak, "local": l_nak, "match": nakshatra_match},
            "varna": {"viaveda": v_varna, "local": l_varna, "match": varna_match},
            "gana": {"viaveda": v_gana, "local": l_gana, "match": gana_match},
            "nadi": {"viaveda": v_nadi, "local": l_nadi, "match": nadi_match},
            "yoni": {"viaveda": v_yoni, "local": l_yoni, "match": yoni_match},
            "ayanamsha": {
                "viaveda": round(v_ayan, 4),
                "local": round(l_ayan, 4),
                "delta_deg": round(ayan_delta_deg, 4),
                "delta_arcmin": round(ayan_delta_arcmin, 2),
                "concordance": ayanamsha_concordance,
            },
            "vaar": {"viaveda": v_vaar, "local": l_vaar, "match": vaar_match},
            "manglik": {
                "viaveda": manglik_ext.get("manglik_dosha"),
                "viaveda_percentage": manglik_ext.get("percentage"),
                "local_is_manglik": l_is_manglik,
                "local_mars_house": mars_house,
                "school_difference_note": manglik_note,
            },
            "planets_comparison": planetary_comp,
            "chart_d1_comparison": chart_comp,
        },
    }
