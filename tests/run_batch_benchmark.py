"""
tests/run_batch_benchmark.py
----------------------------
Modular batch runner for testing slices of test_profiles_100.json
against Viaveda API (https://prod.viaveda.in) and our live local Kundali API (http://localhost:8000/api/v1/kundali).
Used by concurrent subagents to run simultaneous tests across 50 profiles.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List
import requests

TESTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = TESTS_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "kundali_backend"

for d in (str(TESTS_DIR), str(PROJECT_ROOT), str(BACKEND_DIR)):
    if d not in sys.path:
        sys.path.insert(0, d)

try:
    from tests.viaveda_client import ViavedaClient
    from tests.kundali_comparator import (
        normalize_rashi, normalize_nakshatra, normalize_varna,
        normalize_gana, normalize_nadi, normalize_yoni
    )
except ImportError:
    from viaveda_client import ViavedaClient
    from kundali_comparator import (
        normalize_rashi, normalize_nakshatra, normalize_varna,
        normalize_gana, normalize_nadi, normalize_yoni
    )

SERVER_URL = "http://localhost:8000/api/v1/kundali"
PROFILES_PATH = TESTS_DIR / "test_profiles_100.json"


def check_server_health() -> bool:
    try:
        r = requests.get("http://localhost:8000/docs", timeout=3)
        return r.status_code == 200
    except Exception:
        return False


def query_live_server(profile: Dict[str, Any]) -> Dict[str, Any]:
    b = profile["birth_info"]
    tzone = float(b.get("tzone", 5.5))
    tz_str = "Asia/Kolkata" if abs(tzone - 5.5) < 0.01 else "UTC"

    payload = {
        "person": {
            "name": profile.get("name", "Unknown"),
            "year": int(b["year"]),
            "month": int(b["month"]),
            "day": int(b["day"]),
            "hour": int(b["hour"]),
            "minute": int(b.get("minut", b.get("minute", 0))),
            "second": int(b.get("second", 0)),
            "lat": float(b["lat"]),
            "lon": float(b.get("lng", b.get("lon"))),
            "timezone_str": tz_str
        },
        "include_ai_reading": False,
        "language": "en"
    }

    res = requests.post(SERVER_URL, json=payload, timeout=12)
    if res.status_code != 200:
        raise RuntimeError(f"Server returned HTTP {res.status_code}: {res.text}")
    return res.json()


def run_batch(start_idx: int, end_idx: int, output_file: Path) -> Dict[str, Any]:
    if not check_server_health():
        raise RuntimeError(f"Backend server is not responding at {SERVER_URL}")

    with open(PROFILES_PATH, "r", encoding="utf-8") as f:
        all_profiles = json.load(f)

    profiles = all_profiles[start_idx:end_idx]
    client = ViavedaClient()

    print(f"\n[Batch Runner] Starting slice {start_idx} to {end_idx} ({len(profiles)} profiles)...")
    evaluations = []
    
    total_evaluated = 0
    moon_matches = 0
    sun_matches = 0
    nakshatra_matches = 0
    varna_matches = 0
    gana_matches = 0
    nadi_matches = 0
    yoni_matches = 0
    ayanamsha_concordances = 0

    total_graha_comparisons = 0
    graha_sign_matches = 0
    graha_house_matches = 0
    d1_house_layout_matches = 0
    max_degree_delta = 0.0
    all_deltas = []

    start_time = time.time()

    for idx, prof in enumerate(profiles, start=start_idx + 1):
        name = prof["name"]
        b = prof["birth_info"]
        print(f"  [{idx:02d}/{end_idx:02d}] {name:<22} ({b['year']}-{b['month']:02d}-{b['day']:02d} {b['hour']:02d}:{b['minut']:02d})... ", end="", flush=True)

        try:
            # 1. Fetch viaveda full report (handles 2-step create & details + cache)
            v_full = client.fetch_full_report(prof)
            doc_id = v_full.get("doc_id")

            if "planetary_response" not in v_full or not v_full["planetary_response"]:
                try:
                    v_full["planetary_response"] = client.get_details(doc_id, field="jaimini:planetary")
                except Exception:
                    pass

            if "chart_response" not in v_full or not v_full["chart_response"]:
                try:
                    v_full["chart_response"] = client.get_details(doc_id, field="chart:north")
                except Exception:
                    pass

            # 2. Query our live server
            server_data = query_live_server(prof)

            # 3. Compare core details
            v_astro = v_full.get("details_response", {}).get("data", {}).get("astrological_details", {}).get("data", {})
            
            v_moon = normalize_rashi(v_astro.get("moonsign"))
            s_moon = normalize_rashi(server_data.get("moon_sign"))
            m_match = (v_moon == s_moon)
            if m_match: moon_matches += 1

            v_sun = normalize_rashi(v_astro.get("sunsign"))
            s_sun = normalize_rashi(server_data.get("planets", {}).get("Sun", {}).get("sign"))
            su_match = (v_sun == s_sun)
            if su_match: sun_matches += 1

            v_nak = normalize_nakshatra(v_astro.get("nakshatra"))
            s_nak = normalize_nakshatra(server_data.get("moon_nakshatra"))
            n_match = (v_nak == s_nak)
            if n_match: nakshatra_matches += 1

            v_varna = normalize_varna(v_astro.get("varna"))
            s_varna = normalize_varna(server_data.get("classification", {}).get("varna"))
            va_match = (v_varna == s_varna)
            if va_match: varna_matches += 1

            v_gana = normalize_gana(v_astro.get("gana"))
            s_gana = normalize_gana(server_data.get("classification", {}).get("gana"))
            g_match = (v_gana == s_gana)
            if g_match: gana_matches += 1

            v_nadi = normalize_nadi(v_astro.get("nadi"))
            s_nadi = normalize_nadi(server_data.get("classification", {}).get("nadi"))
            na_match = (v_nadi == s_nadi)
            if na_match: nadi_matches += 1

            # Yoni
            from app.ashtakoot import YONI_MAP
            nak_idx = server_data.get("planets", {}).get("Moon", {}).get("nakshatra_index")
            s_yoni = normalize_yoni(YONI_MAP[nak_idx][0]) if nak_idx is not None else ""
            v_yoni = normalize_yoni(v_astro.get("yoni"))
            yo_match = (v_yoni == s_yoni)
            if yo_match: yoni_matches += 1

            # Ayanamsha: Both systems use Lahiri Ayanamsha
            v_raw = str(v_astro.get("ayanamsha", "")).lower()
            s_raw = str(server_data.get("ayanamsha_used", "")).lower()
            try:
                v_num = float(v_raw)
                s_num = float(s_raw)
                ay_match = (abs(v_num - s_num) * 60.0 <= 10.0)
            except ValueError:
                if "lahiri" in s_raw:
                    try:
                        ay_match = (23.0 <= float(v_raw) <= 24.5)
                    except ValueError:
                        ay_match = ("lahiri" in v_raw)
                else:
                    ay_match = ("lahiri" in v_raw and "lahiri" in s_raw)
            if ay_match: ayanamsha_concordances += 1

            # 4. Planetary & House Comparison
            v_planets_list = v_full.get("planetary_response", {}).get("data", {}).get("planetary", {}).get("data", [])
            v_planets = {p["name"]: p for p in v_planets_list}
            s_planets = server_data.get("planets", {})
            s_asc = server_data.get("ascendant", {})

            grahas = [
                ("Ascendant", s_asc),
                ("Sun", s_planets.get("Sun")),
                ("Moon", s_planets.get("Moon")),
                ("Mars", s_planets.get("Mars")),
                ("Mercury", s_planets.get("Mercury")),
                ("Jupiter", s_planets.get("Jupiter")),
                ("Venus", s_planets.get("Venus")),
                ("Saturn", s_planets.get("Saturn")),
                ("Rahu", s_planets.get("Rahu")),
                ("Ketu", s_planets.get("Ketu")),
            ]

            p_eval = {}
            for g_name, s_info in grahas:
                if not s_info:
                    continue
                v_info = v_planets.get(g_name, {})
                if not v_info:
                    continue
                
                v_s = normalize_rashi(v_info.get("sign"))
                s_s = normalize_rashi(s_info.get("sign"))
                v_h = int(v_info.get("house", 0))
                s_h = int(s_info.get("house_from_lagna", s_info.get("house", 1 if g_name == "Ascendant" else 0)))
                v_d = float(v_info.get("full_degree", 0.0))
                s_d = float(s_info.get("longitude", 0.0))
                delta = abs(v_d - s_d)
                all_deltas.append(delta)
                if delta > max_degree_delta:
                    max_degree_delta = delta

                s_match = (v_s == s_s)
                h_match = (v_h == s_h)

                total_graha_comparisons += 1
                if s_match: graha_sign_matches += 1
                if h_match: graha_house_matches += 1

                p_eval[g_name] = {
                    "viaveda": f"{v_s} (H{v_h}, {v_d:.2f}°)",
                    "server": f"{s_s} (H{s_h}, {s_d:.2f}°)",
                    "sign_match": s_match,
                    "house_match": h_match,
                    "delta_deg": round(delta, 4)
                }

            # 5. D1 Chart House Layout
            s_d1 = server_data.get("charts", {}).get("D1_lagna", [])
            s_house_map = {}
            for item in s_d1:
                h_num = item.get("house")
                s_house_map[h_num] = [occ.get("planet") for occ in item.get("occupants", [])]

            v_d1_dict = v_full.get("chart_response", {}).get("data", {}).get("lagna_chart_d1", {}).get("data", {}).get("data", {})
            v_house_map = {}
            if isinstance(v_d1_dict, dict):
                for h_str, h_data in v_d1_dict.items():
                    if h_str.isdigit():
                        h_num = int(h_str)
                        v_house_map[h_num] = [p.get("name") for p in h_data.get("planet", []) if p.get("name") not in ("Uranus", "Neptune", "Pluto", "Ascendant")]

            h_matches = 0
            for h in range(1, 13):
                v_occ = set(v_house_map.get(h, []))
                s_occ = set(s_house_map.get(h, []))
                if v_occ == s_occ:
                    h_matches += 1
            
            d1_match = (h_matches == 12)
            if d1_match: d1_house_layout_matches += 1

            core_score = sum([m_match, su_match, n_match, va_match, g_match, na_match, yo_match, ay_match]) / 8.0 * 100.0
            total_evaluated += 1
            print(f"OK (Concordance: {core_score:.1f}%, D1: {h_matches}/12)")

            evaluations.append({
                "profile_id": prof.get("id", idx),
                "name": name,
                "birth_place": b.get("place"),
                "dob": f"{b['year']}-{b['month']:02d}-{b['day']:02d} {b['hour']:02d}:{b['minut']:02d}",
                "score": core_score,
                "moon_sign": s_moon,
                "moon_match": m_match,
                "sun_sign": s_sun,
                "sun_match": su_match,
                "nakshatra": s_nak,
                "nakshatra_match": n_match,
                "gana": s_gana,
                "gana_match": g_match,
                "nadi": s_nadi,
                "nadi_match": na_match,
                "varna_match": va_match,
                "yoni_match": yo_match,
                "ayanamsha_match": ay_match,
                "d1_chart_match": d1_match,
                "d1_houses_matched": f"{h_matches}/12",
                "planets_detail": p_eval
            })

        except Exception as exc:
            print(f"FAILED: {exc}")

    elapsed = time.time() - start_time
    avg_score = sum(e["score"] for e in evaluations) / len(evaluations) if evaluations else 0.0
    avg_delta = sum(all_deltas) / len(all_deltas) if all_deltas else 0.0

    batch_result = {
        "start_idx": start_idx,
        "end_idx": end_idx,
        "count": total_evaluated,
        "elapsed_seconds": round(elapsed, 2),
        "avg_score": round(avg_score, 2),
        "avg_degree_delta": round(avg_delta, 4),
        "max_degree_delta": round(max_degree_delta, 4),
        "metrics": {
            "moon_matches": moon_matches,
            "sun_matches": sun_matches,
            "nakshatra_matches": nakshatra_matches,
            "varna_matches": varna_matches,
            "gana_matches": gana_matches,
            "nadi_matches": nadi_matches,
            "yoni_matches": yoni_matches,
            "ayanamsha_concordances": ayanamsha_concordances,
            "total_graha_comparisons": total_graha_comparisons,
            "graha_sign_matches": graha_sign_matches,
            "graha_house_matches": graha_house_matches,
            "d1_house_layout_matches": d1_house_layout_matches,
        },
        "evaluations": evaluations,
    }

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(batch_result, f, indent=2, ensure_ascii=False)

    print(f"\n[Batch Runner] Finished slice {start_idx}..{end_idx}. Saved to {output_file}\n")
    return batch_result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, default=0)
    parser.add_argument("--end", type=int, default=25)
    parser.add_argument("--output", type=str, default="batch_result.json")
    args = parser.parse_args()

    out_path = Path(args.output)
    if not out_path.is_absolute():
        out_path = PROJECT_ROOT / args.output

    run_batch(args.start, args.end, out_path)


if __name__ == "__main__":
    main()
