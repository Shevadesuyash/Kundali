# Kundali & Matchmaking Engine — Complete Build Plan

Stack: **Python 3.12 · FastAPI · pyswisseph (Swiss Ephemeris) · Docker · AWS Lambda · Gemini (optional AI layer)**

This document is the full phase-by-phase plan. All phases below are already
implemented and tested in this delivery — treat this as both the spec and
the "as-built" record.

---

## Architecture at a glance

```
kundali_backend/
├── app/
│   ├── models.py            # Person domain model + Pydantic API schemas
│   ├── astro_engine.py       # Module A: Swiss Ephemeris calculations
│   ├── chart_engine.py       # Module B: D1 / Rashi / D9 JSON chart layouts
│   ├── kundali_analyzer.py   # Module B/C: individual report + Manglik check
│   ├── ashtakoot.py           # Module D: 8-koota / 36-point Guna Milan
│   ├── matchmaker.py          # Orchestrates boy+girl -> full match report
│   ├── ai_service.py          # Optional Gemini narrative layer
│   └── main.py                 # FastAPI app (the "Controller/Dispatcher")
├── lambda_handler.py          # Mangum ASGI->Lambda adapter
├── requirements.txt            # Runtime deps (used by Docker image)
├── requirements-dev.txt        # + uvicorn/pytest/httpx for local dev
├── Dockerfile                    # AWS Lambda container image
└── tests/                        # 53 pytest tests across all modules
```

Design decisions:
- **Whole-sign house system** for house placement (simple, robust, matches
  most South Indian-style software; documented so you can swap to
  Placidus/Equal-house later if needed).
- **Lahiri Ayanamsha**, sidereal mode — mainstream Vedic standard.
- **JSON-only output** (no matplotlib/image generation) — keeps the Lambda
  image small, cold-starts fast, and lets any frontend (web/mobile) render
  the chart from structured house/planet data.
- **AI layer is presentation-only.** Gemini is only ever shown numbers
  already computed by the ephemeris engine; it narrates, it never
  calculates or overrides a score. If `GEMINI_API_KEY` isn't set or the
  call fails, the API still returns the full numeric report — `ai_reading`
  is simply `null`. The core product never depends on the AI call succeeding.

---

## Phase 1 — Python Backend & Docker Setup (AWS Lambda-ready)

**Goal:** Colab logic → clean, modular, testable Python API, containerized for Lambda.

| Step | What | File(s) |
|---|---|---|
| 1.1 | Restructure into modules (`Person`, engine, chart builder, matcher, AI, API layer) instead of one notebook | `app/*.py` |
| 1.2 | `requirements.txt` with pinned versions (`fastapi`, `pyswisseph`, `pytz`, `mangum`, `google-generativeai`) | `requirements.txt` |
| 1.3 | `Dockerfile` on the official `public.ecr.aws/lambda/python:3.12` base image | `Dockerfile` |
| 1.4 | Local Docker test before ever touching AWS | commands below |

**How to test Phase 1 locally (Docker):**
```bash
cd kundali_backend
docker build -t kundali-api .
docker run -p 9000:8080 kundali-api

# In another terminal — invoke like Lambda would:
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" \
  -d '{
        "httpMethod": "POST",
        "path": "/api/v1/kundali",
        "headers": {"Content-Type": "application/json"},
        "body": "{\"person\":{\"name\":\"Sunita\",\"year\":1982,\"month\":7,\"day\":20,\"hour\":5,\"minute\":5,\"lat\":17.0,\"lon\":74.0}}"
      }'
```

**How to test Phase 1 locally (plain Python, faster iteration):**
```bash
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
# then POST to http://localhost:8000/api/v1/kundali or /api/v1/match
# interactive docs at http://localhost:8000/docs
```

**Status:** ✅ Done. Verified with a live `uvicorn` run + `curl` in this session.

---

## Phase 2 — Core Astronomical Engine (Module A)

**File:** `app/astro_engine.py`, class `VedicAstrologyEngine`

Implements exactly the 3 functions from the spec, plus supporting utilities:
- `get_julian_day(person)` — local time → UTC (via `pytz`) → Julian Day
- `get_ayanamsha(jd)` — Lahiri Ayanamsha value at that JD
- `get_all_planet_positions(jd)` — sidereal longitude for Sun, Moon, Mars,
  Mercury, Jupiter, Venus, Saturn, Rahu (True Node); Ketu is derived as
  Rahu + 180°
- `get_ascendant(jd, person)` — Lagna degree, sign, Nakshatra, Pada
- `house_of_planet(asc_sign, planet_sign)` — whole-sign house number
- `get_technical_profile(person)` — the **one call** that returns
  everything downstream code needs (this is the canonical internal data
  contract used by every other module — see docstring in the file)

**Precision note (documented in-code):** pyswisseph falls back to the
Moshier semi-analytic ephemeris when no `.se1` data files are configured.
This is accurate to a few arc-seconds — far tighter than the 13°20'
Nakshatra granularity we need — so no external ephemeris file download is
required. If you later want sub-arcsecond precision, call
`swe.set_ephe_path(...)` with the official JPL/Swiss files.

**Tests:** `tests/test_astro_engine.py` — 15 tests covering Julian Day
sanity, all-9-graha presence, Rahu/Ketu 180° symmetry, Rashi/Nakshatra
boundary conditions (0°, 29.999°, 359.999°), Navamsha range invariants,
house-numbering correctness, and input validation (bad calendar dates,
unknown timezones).

**Status:** ✅ Done, 15/15 tests passing.

---

## Phase 3 — Kundali & Chart Generation (Module B)

**Files:** `app/chart_engine.py`, `app/kundali_analyzer.py`

- `get_rashi_and_nakshatra` → implemented as `astro_engine.rashi_index()` +
  `nakshatra_pada()`, consumed everywhere.
- `generate_lagna_chart` → `ChartEngine.build_d1_lagna_chart()` — 12-house
  whole-sign JSON array, each house listing its sign + occupant planets.
- `generate_navamsha_chart` → `ChartEngine.build_d9_navamsa_chart()` —
  D9 sign per planet via the classical movable/fixed/dual 9-part rule,
  then a fresh whole-sign chart anchored on the Navamsha Ascendant.
- Bonus: `build_rashi_chart()` — Moon-anchored chart (useful for
  Chandra-Lagna based predictions), included in `build_all_charts()`.
- `KundaliAnalyzer.build_report()` assembles the full individual report:
  profile, Ascendant, Moon sign/Nakshatra/Pada, Varna/Gana/Nadi
  classification, full planet table, all 3 charts, and Manglik status.

**Example chart JSON shape** (one house):
```json
{"house": 1, "sign_index": 2, "sign": "Gemini (Mithuna)",
 "occupants": [{"planet": "Moon", "abbr": "Mo", "degree_str": "17°06'33\"", "retrograde": false}]}
```
A frontend renders this directly into 12 boxes (North Indian diamond
layout or South Indian grid) without any further backend logic.

**Status:** ✅ Done.

---

## Phase 4 — Manglik Dosha (Module C)

**File:** `app/kundali_analyzer.py`, `KundaliAnalyzer.check_manglik()`

- Checks Mars's whole-sign house **from the Ascendant** against
  `{1, 2, 4, 7, 8, 12}`.
- Flags a common cancellation rule: Mars in its own sign (Aries/Scorpio)
  or exalted (Capricorn) — many schools treat this as nullifying/reducing
  the dosha. This is called out as a "common" rule, not universal, in
  the docstring — exact cancellation rules vary significantly by
  tradition and should be confirmed with a professional astrologer for
  serious decisions.
- Returns `is_manglik`, `is_cancelled`, a `severity` label (`High` for
  1/7/8 house placement, `Low` otherwise), the Mars house, and sign.
- `MatchMaker._combined_manglik_verdict()` applies the classical mutual-
  cancellation rule: if **both** partners are Manglik, the dosha is
  considered cancelled.

**Status:** ✅ Done, covered by `test_matchmaker.py` and `test_api.py`.

---

## Phase 5 — Ashtakoot Guna Milan, 36 points (Module D)

**File:** `app/ashtakoot.py`, class `AshtakootCalculator`

All 8 kootas implemented with documented lookup tables:

| # | Koota | Points | Based on | Method |
|---|---|---|---|---|
| 1 | Varna | 1 | Moon Rashi | Brahmin>Kshatriya>Vaishya>Shudra hierarchy check |
| 2 | Vashya | 2 | Moon Rashi | 5-group (Chatushpad/Manav/Jalchar/Vanchar/Keeda) matrix |
| 3 | Tara | 3 | Moon Nakshatra | Bidirectional 9-count remainder, good/bad Tara set |
| 4 | Yoni | 4 | Moon Nakshatra | 14-animal table + classical enemy pairs |
| 5 | Graha Maitri | 5 | Rashi lord | Naisargika (natural) planetary friendship table |
| 6 | Gana | 6 | Moon Nakshatra | Deva/Manushya/Rakshasa compatibility grid |
| 7 | Bhakoot | 7 | Moon Rashi | 2/12, 5/9, 6/8 distance-dosha rule |
| 8 | Nadi | 8 | Moon Nakshatra | Aadi/Madhya/Antya — must differ |

`calculate_guna_milan()` sums all 8, always totals to 36 max, and returns
a verdict:
- ≥28 → Excellent Match
- 21–27.9 → Good / Compatible
- 18–20.9 → Average — Proceed with Caution
- <18 → Not Recommended

It also explicitly flags `nadi_dosha` and `bhakoot_dosha` booleans since
these two are the classical "hard stop" doshas most families ask about.

**Accuracy note (also in the code docstring):** Vashya and Yoni have
some regional/textual variation (e.g., mid-sign splits for
Sagittarius/Capricorn Vashya). This implementation uses the single most
common published version used by mainstream Kundali software. Treat it
as a strong reference implementation, not infallible classical truth —
say so in your product's UI/disclaimer too.

**Tests:** `tests/test_ashtakoot.py` — 21 tests, one or more per koota,
plus boundary/invariant tests (score never exceeds max, identical charts
correctly trigger Nadi Dosha, etc).

**Status:** ✅ Done, 21/21 tests passing.

---

## Phase 6 — Matchmaking Orchestration & API Output (Controller)

**Files:** `app/matchmaker.py`, `app/main.py`

- `MatchMaker.match_profiles(boy, girl)` runs both individual reports
  through `KundaliAnalyzer`, feeds their Moon Rashi/Nakshatra/Lord into
  `AshtakootCalculator`, and assembles the combined Manglik verdict.
- `app/main.py` is the FastAPI "Dispatcher" replacing the notebook's
  `AstrologyController`:
  - `GET /health` — liveness probe (for Lambda health checks / ALB)
  - `POST /api/v1/kundali` — individual report, `KundaliRequest` body
  - `POST /api/v1/match` — Boy/Girl compatibility, `MatchRequest` body
  - Both accept `include_ai_reading: bool` to opt into the Gemini
    narrative (Phase 7).
  - 400 for invalid input (bad date, unknown timezone), 422 for
    Pydantic schema violations (out-of-range fields), 500 for unexpected
    calculation errors — all logged server-side.

**Example request/response** — see `README.md` for full curl examples.

**Status:** ✅ Done, exercised end-to-end via `uvicorn` + `curl` in this session.

---

## Phase 7 — AI Reading Layer (Optional, Gemini)

**File:** `app/ai_service.py`

- Reads `GEMINI_API_KEY` from the environment. If absent, or if the
  Gemini call throws for any reason (quota, network, model deprecation),
  the function returns `None` — **the API never fails because of the AI
  layer**; the numeric report is always returned.
- The prompt is deliberately constrained: Gemini is given a compact JSON
  of already-computed facts and told explicitly not to invent or alter
  any placement/score, and not to make absolute predictions about death,
  disease, or finances — it narrates and gives general, constructive
  suggestions only.
- Two entry points: `generate_individual_reading(report)` and
  `generate_match_reading(match_report)`.

**To enable:**
```bash
export GEMINI_API_KEY="your-key-here"
```
In Lambda, set this as an environment variable on the function
configuration (or better, pull it from AWS Secrets Manager at cold-start
inside `ai_service.py` if you want it out of plaintext env vars).

**Status:** ✅ Done. Tested for graceful `None` fallback when no key is
set (`test_kundali_endpoint_ai_reading_degrades_gracefully_without_api_key`).
Not exercised against the live Gemini API in this sandbox (no network
egress to Google's API from this environment) — the prompt/response
plumbing is verified; do a live smoke test with a real key before
shipping.

---

## Phase 8 — Testing (all phases)

53 tests total, all passing:

| File | Tests | Covers |
|---|---|---|
| `tests/test_astro_engine.py` | 15 | Julian Day, all grahas present, Rahu/Ketu symmetry, Rashi/Nakshatra boundaries, Navamsha range, house numbering, bad input handling |
| `tests/test_ashtakoot.py` | 21 | Every koota's scoring logic + boundary/invariant checks |
| `tests/test_matchmaker.py` | 6 | Orchestration correctness, no internal-field leakage, chart opt-in/out |
| `tests/test_api.py` | 11 | HTTP status codes (200/400/422/500 paths), response shape, AI opt-in behavior |

**Run everything:**
```bash
pip install -r requirements-dev.txt
pytest tests/ -v
```

---

## Phase 9 — AWS Deployment (Lambda + API Gateway)

1. **Build & push the image to ECR:**
   ```bash
   aws ecr create-repository --repository-name kundali-api
   aws ecr get-login-password --region <region> | docker login --username AWS \
     --password-stdin <account_id>.dkr.ecr.<region>.amazonaws.com

   docker build -t kundali-api .
   docker tag kundali-api:latest <account_id>.dkr.ecr.<region>.amazonaws.com/kundali-api:latest
   docker push <account_id>.dkr.ecr.<region>.amazonaws.com/kundali-api:latest
   ```

2. **Create the Lambda function from the image:**
   ```bash
   aws lambda create-function \
     --function-name kundali-api \
     --package-type Image \
     --code ImageUri=<account_id>.dkr.ecr.<region>.amazonaws.com/kundali-api:latest \
     --role arn:aws:iam::<account_id>:role/<lambda-execution-role> \
     --timeout 15 \
     --memory-size 512
   ```
   - Set `GEMINI_API_KEY` under **Configuration → Environment variables**
     if you want AI readings live.
   - 512 MB / 15s timeout is comfortable headroom; the Moshier ephemeris
     calls are CPU-light (no file I/O), typical cold start is dominated
     by Python/import time, not by astrology math.

3. **Expose it:** either a Lambda **Function URL** (simplest, built-in
   HTTPS endpoint, good for a solo/portfolio project) or **API Gateway**
   (HTTP API) in front of it for custom domains, throttling, and usage
   plans.

4. **Smoke test the deployed endpoint:**
   ```bash
   curl -X POST https://<your-endpoint>/api/v1/kundali \
     -H "Content-Type: application/json" \
     -d '{"person":{"name":"Test","year":1990,"month":1,"day":1,"hour":6,"minute":0,"lat":18.52,"lon":73.86}}'
   ```

**Status:** Steps documented and ready to run; actual AWS deployment
requires your AWS account/credentials, which this environment doesn't
have — the artifact you have (Dockerfile + handler) is exactly what
Lambda expects, and it's already been validated to run correctly on
plain `uvicorn`, which is the same ASGI app Mangum wraps.

---

## What's deliberately out of scope (tell me if you want these added)

- **Persistence** (saving Kundalis/matches to a DB — DynamoDB would be
  the natural Lambda-native choice).
- **Auth** (API keys / Cognito) — currently the API is open; add before
  any public deployment.
- **Rate limiting** — handle at API Gateway / WAF level.
- **Frontend** — this is a pure backend; charts are JSON, ready for a
  React/Java Spring Boot frontend to render.
- **Dasha (planetary period) calculations, transits, and remedial
  Muhurta timing** — a natural Phase 10 if you want to extend this further.
