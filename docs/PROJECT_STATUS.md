# ✦ Kundali Milan — Living Project Status & Technical Ledger

> 🚨 **AGENT DIRECTIVE & MANDATORY RULE:**
> 1. **Read First**: Always read this file FIRST before scanning other code to immediately understand current architecture, active endpoints, completed features, and the confirmed roadmap.
> 2. **Append-Only Policy**: Whenever you make changes, resolve bugs, plan phases, or commit code, you MUST APPEND to this file. **NEVER DELETE OR OVERWRITE EXISTING HISTORICAL CONTENT**.
> 3. **Entry Format**: Every new entry in the Append Log must include **Date & Local Time**, **Chat / Session Reference Context**, **Short Executive Summary**, **Files Touched/Planned**, and **Detailed Notes**.

---

## 📌 Executive Summary & Quick Reference

* **Project Name:** Kundali Milan — Vedic Astrology, Ashtakvarga & Matchmaking Suite
* **Current Version:** `v2.0.0`
* **Git Repository:** `https://github.com/Shevadesuyash/Kundali.git` (`main` branch)
* **Primary Stack:**
  * **Backend:** Python 3.10+, FastAPI, `pyswisseph` (Swiss Ephemeris C-bindings, Lahiri Ayanamsha), SQLite3 (`profiles.db` with WAL mode & safe migrations)
  * **Frontend:** React 18, Vite, React Router DOM v6, Vanilla CSS Design System with Vedic Parchment Tokens
  * **AI Layer:** Google Gemini (Gemini 2.0 Flash) — opt-in, non-blocking, key stored strictly in gitignored `.env`
* **Local Development Ports:**
  * Backend API: `http://localhost:8000` (Docs: `http://localhost:8000/docs`, Health: `http://localhost:8000/health`)
  * Frontend Web: `http://localhost:5173`

```powershell
# Start Backend (Terminal 1)
cd c:\Users\sheva\antigravity\Kundali\kundali_backend
uvicorn app.main:app --reload --port 8000

# Start Frontend (Terminal 2)
cd c:\Users\sheva\antigravity\Kundali\kundali_frontend
npm run dev
```

---

## 🏛️ System Architecture & File Registry

### 1. Backend Service (`kundali_backend/app/`)

| File | Size | Role & Architectural Responsibilities |
|---|---|---|
| `main.py` | 15.3 KB | FastAPI application instance, 13 REST API endpoints, CORS configuration, engine singletons, error handling middleware |
| `models.py` | 5.0 KB | Domain `Person` model and Pydantic v2 schemas: `BirthDetails`, `KundaliRequest`, `MatchRequest`, `MatchSavedRequest`, `SaveProfileRequest`, `ProfileSummary`, `ProfileDetail`, `ProfileTypeahead`, `ErrorResponse` |
| `database.py` | 14.8 KB | SQLite3 persistence layer: `profiles` table CRUD, safe `ALTER TABLE` migrations (no DROP TABLE), 3-tier geocode cache table (`geocode_cache`) |
| `astro_engine.py` | 9.4 KB | `VedicAstrologyEngine`: Swiss Ephemeris wrapper. Computes sidereal Lahiri planetary longitudes, Ascendant (Lagna), Bhava cusps, Nakshatras & Padas, D9 Navamsha, and `get_technical_profile()` |
| `kundali_analyzer.py` | 10.3 KB | `KundaliAnalyzer`: Core orchestrator. Builds full individual Kundali reports by coordinating `astro_engine`, `dasha`, `yoga_engine`, `ashtakvarga_engine`, `chart_engine`, and `check_manglik()` with multi-chart Papa Samyam |
| `dasha.py` | 6.9 KB | `VimshottariCalculator`: 120-year Vimshottari Mahadasha sequence + 9-fold Antardashas (81 sub-periods total) with real-time percentage elapsed progress and calendar start/end dates |
| `yoga_engine.py` | 16.8 KB | `YogaEngine`: Classical Vedic Yoga and Dosha detector. Analyzes kendra/trikona placements, conjunctions, dignities, and aspects across 10 benefic yogas and 4 classical doshas |
| `ashtakvarga_engine.py` | 6.0 KB | `AshtakvargaEngine`: Implements Brihat Parashara Hora Shastra (BPHS) 337/338 benefic bindu tables for 7 planets from 8 reference points. Computes Sarvashtakvarga (SAV) and full Bhinnashtakvarga (BAV) |
| `chart_engine.py` | 3.6 KB | `ChartEngine`: Formats 12-house planetary occupants and signs for D1 (Lagna), D9 (Navamsha), and Chandra (Moon) charts |
| `matchmaker.py` | 4.6 KB | `MatchMaker`: Coordinates Ashtakoot Guna Milan (36-point matching) and Papa Samyam differential balance |
| `ashtakoot.py` | 21.4 KB | Classical 8-Koota matching engine: Varna (1), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7), Nadi (8) + Papa Samyam score formula |
| `geocode_service.py` | 1.9 KB | Location search wrapper: Memory L1 cache → SQLite L2 cache → OpenStreetMap Nominatim L3 API |
| `ai_service.py` | 4.8 KB | Optional Gemini 2.0 Flash reading generator for individual charts and Guna Milan match reports |

### 2. SQLite Database Schema (`kundali_backend/profiles.db`)

```sql
CREATE TABLE IF NOT EXISTS profiles (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    gender       TEXT NOT NULL,        -- 'male' or 'female' ONLY
    year         INTEGER NOT NULL,
    month        INTEGER NOT NULL,
    day          INTEGER NOT NULL,
    hour         INTEGER NOT NULL,
    minute       INTEGER NOT NULL,
    lat          REAL NOT NULL,
    lon          REAL NOT NULL,
    timezone_str TEXT NOT NULL,
    birth_place  TEXT,
    moon_sign    TEXT,
    nakshatra    TEXT,
    lagna        TEXT,
    is_manglik   INTEGER DEFAULT 0,
    active_dasha TEXT,
    tag          TEXT DEFAULT 'self',  -- 'self', 'family', 'friend', 'partner', 'client'
    created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS geocode_cache (
    query        TEXT PRIMARY KEY,
    lat          REAL NOT NULL,
    lon          REAL NOT NULL,
    display_name TEXT NOT NULL,
    timezone_str TEXT NOT NULL,
    created_at   TEXT NOT NULL
);
```

### 3. Active REST API Endpoints

| HTTP Method | Route | Description & Parameters |
|---|---|---|
| `GET` | `/` | Root API health, documentation link, version info |
| `GET` | `/health` | Lightweight service health probe `{"status": "ok"}` |
| `POST` | `/api/v1/kundali` | Computes full 5-tab Kundali report. Echos `person` key for downstream on-demand calls |
| `POST` | `/api/v1/ashtakvarga` | On-demand full Bhinnashtakvarga (7 planets x 8 references x 12 signs) + SAV |
| `POST` | `/api/v1/match` | Ashtakoot Guna Milan (36 points) + Papa Samyam for two birth detail sets |
| `POST` | `/api/v1/match-saved` | Guna Milan for two saved profile IDs (`boy_id`, `girl_id`) |
| `GET` | `/api/v1/profiles` | List/search saved profiles with pagination (`q`, `gender`, `tag`, `page`, `per_page`), returns `male_count`, `female_count` |
| `POST` | `/api/v1/profiles` | Saves a new profile (automatically computes Moon sign, Lagna, Dasha, Manglik summary) |
| `GET` | `/api/v1/profiles/search` | Fast typeahead search (`q`, `limit`) for form auto-completion |
| `GET` | `/api/v1/profiles/{id}` | Fetches full birth details for a single saved profile |
| `PATCH` | `/api/v1/profiles/{id}` | Partially updates profile fields (recomputes astro metadata if birth details change) |
| `DELETE` | `/api/v1/profiles/{id}` | Hard deletes a profile from SQLite |
| `GET` | `/api/v1/geocode` | 3-tier cached location lookup (`q` query string) |

### 4. Frontend Application (`kundali_frontend/src/`)

#### Pages (`src/pages/`)
- `HomePage.jsx` — Landing page with cards for Kundali Generation, Guna Milan, and Profile Hub
- `KundaliPage.jsx` — Birth details form + 5-tab report view; attaches `data.raw_person = payload`
- `MatchPage.jsx` — Dual `PartnerSlot` interface supporting saved profile picking or manual entry with swap button
- `ProfilesPage.jsx` — Centralized Dashboard Hub: stats bar (Total, Male, Female counts), gender tabs, tag filters, ProfileCard grid, quick Match Tray

#### Components (`src/components/`)
- `KundaliReport.jsx` — 5-tab report container managing active tab switching and report context
- `ReportTabs.jsx` — Tab navigation bar (Overview, Planets, Dasha, Doshas, Health)
- `tabs/OverviewTab.jsx` — Birth details summary, classification badges (Varna, Gana, Nadi), interactive D1/D9/Chandra chart selector
- `tabs/PlanetsTab.jsx` — Sidereal planetary positions table with dignities + Sarvashtakvarga SAV heatmap + on-demand BAV button
- `tabs/DashaTab.jsx` — Interactive Vimshottari Antardasha accordion tree + Benefic Vedic Yogas list
- `tabs/DoshasTab.jsx` — Mangal Dosha 3-chart breakdown with Papa Samyam + Malefic Doshas list
- `tabs/HealthTab.jsx` — Ayurvedic Prakriti (Vata/Pitta/Kapha), fever & organ susceptibility, 6th/8th house indicators
- `DashaTree.jsx` — Interactive accordion for 9 Mahadashas x 9 Antardashas with elapsed progress bars
- `YogaList.jsx` — Cards displaying detected Vedic Yogas & Doshas (filterable by `benefic` or `malefic`)
- `AshtakvargaGrid.jsx` — SAV 12-house scorecard heatmap + lazy-load button for full 7-planet BAV bindu matrices
- `ProfileCard.jsx` — Rich dashboard profile card: Lagna, Rasi, Nakshatra, Dasha, Manglik pill, tag, match checkbox, 2-click delete
- `BirthDetailsForm.jsx` — Auto-fill birth details with typeahead profile search, override badge, and 3-tier geocoding
- `PartnerSlot.jsx` — Dual-mode matching slot with quick saved-profile dropdown and manual form fallback
- `GenderToggle.jsx` — Strict Male / Female toggle
- `SaveProfileButton.jsx` — Save/update profile directly from Kundali report with automatic gender synchronization
- `ChartGrid.jsx` & `NorthIndianChart.jsx` — Custom SVG chart rendering for North Indian Diamond and South Indian layouts

---

## 🧮 Astrological Calculation Rules & Ground Truth

1. **Gender Parameter**: Strict `male` / `female` values only. Essential for directional Ashtakoot (Yoni animal gender matching, Varna/Tara order) and Papa Samyam absorption.
2. **Ephemeris Engine**: Swiss Ephemeris (`pyswisseph`) with standard **Lahiri (Chitrapaksha) Ayanamsha**.
3. **Manglik Dosha (Parashari)**:
   - Evaluated from Lagna (1st, 4th, 7th, 8th, 12th houses). Mars in House 2 is **NOT** Manglik.
   - Evaluated from Moon and Venus charts for secondary severity.
   - Cancellations applied: Mars in own sign (Aries/Scorpio), Mars exalted (Capricorn), Jupiter aspects Mars (4th, 7th, 9th aspects).
4. **Papa Samyam (Malefic Score)**:
   $$\text{Total Papa Points} = S_{\text{Lagna}} + (0.75 \times S_{\text{Moon}}) + (0.50 \times S_{\text{Venus}})$$
5. **Vimshottari Dasha & Antardasha**:
   $$\text{Antardasha Duration (Years)} = \frac{\text{Mahadasha Years} \times \text{Sub-Planet Years}}{120}$$
6. **Ashtakvarga (BPHS)**:
   - Full 8 reference points (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Lagna).
   - SAV benefic thresholds: >= 28 points (Strong), 25-27 points (Average), < 25 points (Weak/Problematic).

---

## 🗺️ Master Phased Roadmap & Confirmed Implementation Plans

### ✅ Completed Phases (Phases 1–10)

* **Phase 10: Full-Suite Deep Multi-Language Translation (English, Marathi, Hindi, Gujarati)**
  - **10A Dynamic 8-Tab Localization**: Updated ReportTabs.jsx to dynamically translate all 8 tabs (	ab.overview, 	ab.planets, 	ab.dasha, 	ab.doshas, 	ab.panchang, 	ab.kp, 	ab.varshapal, 	ab.health).
  - **10B Comprehensive Translation Engine**: Expanded i18n.js with complete English, Marathi, Hindi (hi), and Gujarati (gu) dictionaries covering all Planet table columns, 27 Nakshatras, 9 Dignities, 12 Signs, Form inputs, and Guna Milan match reports.
  - **10C Instant UI Synchronization**: Seamless 4-language toggle (EN, मराठी, हिंदी, ગુજરાતી) dynamically translates the entire application without reload.

* **Phase 9: Dynamic Panchang Geocoding, Vedic Astrology Knowledge Center & Jyotish Matchmaking Deep-Dive**
  - **9A Dynamic Panchang Location Selector**: Added interactive location geocoding and preset city quick-select chips in PanchangPage.jsx/css to recalculate Sun/Moon timings and Choghadiya for any city.
  - **9B Vedic Astrology Knowledge Center & Tooltips**: Created AstroTooltip.jsx/css with contextual ? badges across chart tabs and a comprehensive visual GuidePage.jsx/css (/guide) covering 12 Bhavas, 9 Grahas, SAV benchmarks, Dashas, and Guna Milan rules.
  - **9C Professional Jyotish Matchmaking Deep-Dive**: Created JyotishMatchMatrix.jsx/css in MatchPage.jsx providing side-by-side planetary comparison, Sambandha mutual house axes (1-7, 5-9, 3-11, 6-8, 2-12), and Papa Samyam differential balance.

* **Phase 8: 3-Way Regional Charts, Multi-Language Vedic Localization & Matchmaking AI/PDF**
  - **8A 3-Way Regional Chart Formats**: Created EastIndianChart.jsx/css (authentic Bengali/Odia fixed-sign rectangular layout in SVG). Updated ChartGrid.jsx with an intuitive 3-way toggle (North Indian Diamond, South Indian Box, East Indian Bengali) across D1, D9, and Chandra charts.
  - **8B Multi-Language Vedic Astrological Localization**: Expanded i18n.js with comprehensive English, Marathi, Hindi (hi), and Gujarati (gu) dictionaries. Added 4-language pill selector (EN, मराठी, हिंदी, ગુજરાતી) to Navbar.jsx.
  - **8C Matchmaking AI Compatibility & PDF Suite**: Extended client-side PDF export (ExportPDFButton) to MatchPage.jsx and added opt-in Gemini AI compatibility narrative analysis for 36-point Guna Milan.

* **Phase 7: Advanced Astrological Systems (KP System, AI Q&A, Varshapal)**
  - **7A Krishnamurti Paddhati (KP System)**: kp_engine.py (12 Placidus cusps, Sign/Star/Sub/Sub-Sub Lords, 9 Planets KP table, Ruling Planets, 4-Fold Significators), POST /api/v1/kp, KPTab.jsx/css 7th tab in Kundali report.
  - **7B Context-Aware Interactive AI Q&A Assistant**: i_service.py (nswer_chart_question with Gemini 2.0 Flash context-aware prompt, 3-section structured response, secure .env key loading), POST /api/v1/ai-chat, AIAssistant.jsx/css interactive assistant with prompt chips.
  - **7C Tajika Varshapal (Annual Solar Return)**: arshapal_engine.py (Binary search Solar Return JD, Varsha Pravesh IST, Varsha Lagna, Muntha Progression & Lord, 360-day Mudda Dasha timeline), POST /api/v1/varshapal, VarshapalTab.jsx/css 8th tab in Kundali report with interactive year switcher.

* **Phase 6: Gemstone Engine, Dual Panchang & Kaal Sarp Variants**
  - **6A Gemstone & Rudraksha Engine**: gemstone_engine.py (Life, Fortune, Intellect, Career stones with Dusthana contraindications & Rudraksha pairing), GemstonePanel.jsx/css in DoshasTab.jsx.
  - **6B Dual Panchang Architecture**: panchang_engine.py (5 Limbs: Tithi, Vara, Nakshatra, Yoga, Karana; Brahma/Abhijit Muhurtas, Rahu Kaal, Day Choghadiya, Daily Deity & Mantra), GET /api/v1/panchang, PanchangPage.jsx/css standalone page, PanchangTab.jsx 6th tab in Kundali report with Short / Full Detail toggle.
  - **6C 12 Kaal Sarp Variants**: yoga_engine.py enhanced with classical names (Anant, Kulik, Vasuki, Shankhpal, Padma, Mahapadma, Takshak, Karkotak, Shankachood, Ghatak, Vishdhar, Sheshnag).

* **Phase 5: Real-Time Transits, All-in-One PDF & Bulk Compatibility**
  - **5A Transits & Sade Sati**: 	ransit_engine.py (live Gochara for 9 grahas, 3 Sade Sati phases, Dhaiya, Jupiter Gochara), GET /api/v1/transits/live, TransitTracker.jsx full view on OverviewTab & compact badge on ProfileCard.
  - **5B Client-Side PDF Export**: pdfExport.js + ExportPDFButton.jsx in KundaliReport header, data-pdf-section across all 5 tabs exporting a single comprehensive high-resolution parchment PDF.
  - **5C Multi-Profile Bulk Match Matrix**: POST /api/v1/match-bulk (opposite-gender automated scoring against all candidates), BulkMatchMatrix.jsx leaderboard modal with score progress bars & direct match links, '⚡ Match All' trigger on ProfileCard in ProfilesPage.

* **Phase 1: Gender Toggle, Profile Auto-Fill & Match Redesign** (`7cf6e52`)
  - Thin SQLite schema, typeahead search, `GenderToggle`, `PartnerSlot` redesign with instant swap.
* **Phase 2: Profile Dashboard Hub** (`a740f38`)
  - `ProfilesPage` full rewrite, live stats bar, tag filtering, `ProfileCard`, Quick Match Tray.
* **Phase 3: 5-Tab Modular Kundali Report** (`fffe9bd`)
  - Tabbed architecture: Overview, Planets & Strength, Dasha & Predictions, Doshas & Remedies, Health & Wellness.
* **Phase 4: Antardasha Tree, Classical Yogas & Ashtakvarga** (`4518cd3`, `a63a622`)
  - `dasha.py` Antardasha proportional calculator, `yoga_engine.py` (12 classical yogas/doshas), `ashtakvarga_engine.py` (SAV + BAV), lazy BAV loader with `report.person` backend injection.

---

### 🚀 Phase 5: Transits, PDF Export & Bulk Match (✅ COMPLETED)

#### Stream 5A: Sade Sati & Gochara Transit Tracker
* **Algorithm**:
  - Phase 1 (Rising): Saturn in (Moon - 1) % 12
  - Phase 2 (Peak): Saturn in Moon sign
  - Phase 3 (Setting): Saturn in (Moon + 1) % 12
  - Dhaiya (Small Panoti): Saturn in 4th or 8th house from Moon
  - Jupiter Gochara: Favorable in 2nd, 5th, 7th, 9th, 11th houses from Moon
* **Backend**: `kundali_backend/app/transit_engine.py` (`TransitEngine.get_current_transits()`), route `GET /api/v1/transits/live?moon_sign_index=&lagna_sign_index=`, auto-injected into `build_report()` under `report["current_transits"]`.
* **Frontend**: `src/components/TransitTracker.jsx` with dual modes:
  - **Full Mode**: Rendered in `OverviewTab.jsx` with Sade Sati banner and 9-graha transit table.
  - **Compact Mode**: Rendered on `ProfileCard.jsx` as a real-time Sade Sati status badge.

#### Stream 5B: Professional Client-Side PDF Export
* **Design Decision**: All 5 tabs exported sequentially into a single comprehensive document.
* **Stack**: `jspdf` + `html2canvas` (client-side, offline-capable, renders exact parchment UI).
* **Implementation**: `src/utils/pdfExport.js`, `src/components/ExportPDFButton.jsx` in `KundaliReport` header, `data-pdf-section` attributes on tab blocks.

#### Stream 5C: Multi-Profile Bulk Compatibility Matrix
* **Backend**: `POST /api/v1/match-bulk` (takes `anchor_profile_id`, matches against all saved opposite-gender profiles, sorts descending by Guna score).
* **Frontend**: `src/components/BulkMatchMatrix.jsx` (sortable leaderboard with score bars, Manglik status, Papa Samyam differential), "Quick Match All" button on `ProfilesPage`.

---

### 🔮 Phase 6: Gemstone Engine, Dual Panchang & Kaal Sarp Variants (✅ COMPLETED)

* **6A: Gemstone & Rudraksha Recommendation Engine**:
  - `kundali_backend/app/gemstone_engine.py`: Maps Lagna lord (Life stone), 5th lord (Intellect stone), 9th lord (Fortune stone), 10th lord (Career stone) with dusthana/enemy sign safety contraindications.
  - `src/components/GemstonePanel.jsx`: Rendered inside `DoshasTab.jsx`.
* **6B: Dual Panchang Architecture**:
  - **Mode 1 (Standalone `/panchang`)**: Daily Hindu Panchang (Tithi, Vara, Nakshatra, Yoga, Karana), Brahma Muhurta, Abhijit, Rahu Kaal, Yamaganda, Gulika, daily deity and mantra.
  - **Mode 2 (6th Tab in Kundali)**: `PanchangTab.jsx` displaying Panchang at the exact time and place of birth with Short / Full Detail view toggle.
* **6C: Kaal Sarp 12 Variant Detection**:
  - Extends `yoga_engine.py` to identify specific variants (Anant, Kulik, Vasuki, Shankhpal, Padma, Mahapadma, Takshak, Karkotak, Shankachood, Ghatak, Vishdhar, Sheshnag) based on Rahu's sign.

---

### 🌌 Phase 7: KP Astrology, Interactive AI Assistant & Varshapal

* **7A: Krishnamurti Paddhati (KP System)**:
  - `kp_engine.py`: Unequal Placidus house cusps (`swe.houses(..., b'P')`), Nakshatra Star Lords, Sub Lords, and Sub-Sub Lords. `POST /api/v1/kp`, `KPTab.jsx`.
* **7B: Context-Aware Interactive AI Q&A Assistant**:
  - `POST /api/v1/ai-chat`: Stateless Q&A accepting `BirthDetails` + user question, providing astrological insights using Gemini 2.0 Flash.
  - `AIAssistant.jsx`: Collapsible floating chat panel in Kundali report.
  - **Security Rule**: `GEMINI_API_KEY` stored exclusively in gitignored `.env`.
* **7C: Varshapal (Annual Solar Return / Tajika)**:
  - `varshapal_engine.py`: Binary search for exact Sun return JD in target year, Varsha Lagna, Muntha sign progression, Patyayini Dasha. `VarshapalTab.jsx`.
* **7D: Expanded Multi-Language Localization**:
  - Extend `utils/i18n.js` to Hindi, Gujarati, Tamil, Telugu, Kannada, Bengali.

---

## 📜 Chronological Session & Phase Append Log

> Format for each append:
> ```markdown
> ### [YYYY-MM-DD HH:MM IST] — Session <Session_ID> / <Topic>
> - **Summary**: <One-line summary>
> - **Status**: <Completed / In-Progress / Decided>
> - **Files Modified / Created**: <List of files>
> - **Details & Decisions**: <Technical breakdown>
> ```

### [2026-08-29 11:16 IST] — Commit `7f5962c` / Core Engine Bugfixes, Planetary Dignity, Aspect Correction & Regression Test Suite
- **Summary**: Implemented all verified roadmap and audit fixes: Lagna index in technical profile, planetary dignity population, retrograde key mismatch fix, Jupiter 5/7/9 aspect correction, Panchang Rashi/Nakshatra clarification, seconds precision, node mode toggle, and CORS configuration.
- **Architectural & Calculation Fixes**:
  1. **Lagna Fix**: Added `lagna_sign_index` to `get_technical_profile()` in `astro_engine.py`. Prevents `AshtakvargaEngine`, `YogaEngine`, and `GemstoneEngine` from silently falling back to Aries (0).
  2. **Planetary Dignity**: Pre-computed `"dignity"` (`"Exalted"`, `"Debilitated"`, `"Own Sign"`, `"Neutral"`) in `astro_engine.py`, activating the Debilitated (Neecha) contraindication warning in `GemstoneEngine`.
  3. **Retrograde Key**: Corrected `gemstone_engine.py` to read `"retrograde"` instead of `"is_retrograde"`, restoring the `Retrograde ℞` badge.
  4. **Jupiter Aspects**: Fixed Jupiter aspect on Mars from `{4, 7, 9}` to classical Parashari special drishti `{5, 7, 9}` in `kundali_analyzer.py`.
  5. **Panchang Sun/Moon Output**: Corrected `panchang_engine.py` `sun_moon_timings` to return `sun_sign` (Rashi), `sun_nakshatra` (Nakshatra), `moon_sign` (Rashi), and `moon_nakshatra` (Nakshatra).
  6. **Seconds Precision**: Added `second: int = Field(default=0, ge=0, le=59)` to `BirthDetails`/`Person` and integrated `/ 3600.0` into `swe.julday()` calculation in `astro_engine.py`.
  7. **Node Mode**: Supported `NODE_MODE` environment variable (`TRUE` vs `MEAN` lunar node).
  8. **CORS Hardening**: Configured origin whitelist via `CORS_ORIGINS` with restricted HTTP methods.
  9. **Automated Regression Test Suite**: Created `tests/test_engines_regression.py` with 9 end-to-end tests (all 65 backend tests passing).
- **Status**: Completed & Verified.
- **Files Modified / Created**: `kundali_backend/app/astro_engine.py`, `kundali_backend/app/gemstone_engine.py`, `kundali_backend/app/kundali_analyzer.py`, `kundali_backend/app/panchang_engine.py`, `kundali_backend/app/models.py`, `kundali_backend/app/main.py`, `kundali_backend/tests/test_engines_regression.py`, `docs/PROJECT_STATUS.md`.

---

### [2026-08-28 14:04 IST] — Commit `e51c992` / Full-Suite Native Jyotish Multi-Language Translation Engine
- **Summary**: Implemented 100% complete native multi-language translation across all 8 Kundali tabs, Varshapal, Guna Milan, Doshas, Gemstones, and Vedic Guide in English, Marathi, Hindi, and Gujarati.
- **Architectural Enhancements**:
  1. Built `astroTranslations.js` mapping all 12 Classical Yogas, 12 Kaal Sarp variants, 12 Muntha house predictions, and 8 Ashtakoot Koota rules into authentic Sanskrit/regional terms.
  2. Built `guideTranslations.js` providing multi-lingual guidance for 12 Bhavas, 9 Grahas, and SAV benchmarks.
  3. Localized `YogaList.jsx`, `GemstonePanel.jsx`, `GunaMilanScorecard.jsx`, `KootaBar.jsx`, `VarshapalTab.jsx`, `OverviewTab.jsx`, and `GuidePage.jsx`.
  4. Tested and verified with 0 build errors (`npm run build` in 1.02s).
- **Status**: Completed & Verified.
- **Files Modified / Created**: `astroTranslations.js`, `guideTranslations.js`, `YogaList.jsx`, `GemstonePanel.jsx`, `GunaMilanScorecard.jsx`, `KootaBar.jsx`, `VarshapalTab.jsx`, `OverviewTab.jsx`, `GuidePage.jsx`, `astrology.js`, `docs/PROJECT_STATUS.md`.

---

### [2026-08-28 12:45 IST] — Commit `0ac8aa1` / Repository Hygiene & Architecture Diagram Integration
- **Summary**: Removed internal AI instructions, agent skills, internal scratch files, and planning notes from public Git tracking while keeping them intact locally. Integrated the full-stack architecture diagram into `README.md`.
- **Status**: Completed & Verified.
- **Files Modified**: `.gitignore`, `README.md`, `docs/PROJECT_STATUS.md`.

---

### [2026-08-28 12:38 IST] — Commit `8caa878` / Bugfix: KP Tab Significators TypeError (.length)
- **Summary**: Fixed uncaught `TypeError: Cannot read properties of undefined (reading 'length')` in `KPTab.jsx`.
- **Root Cause**: The offscreen full PDF renderer in `KundaliReport.jsx` renders all 8 tabs concurrently. `KPTab.jsx` was referencing `s.level_1.length` while the backend schema returns `level_1_star_of_occupant`, `level_2_occupant`, `level_3_star_of_lord`, and `level_4_lord`.
- **Fix**: Updated `KPTab.jsx` with correct backend key bindings and wrapped all 4-fold significator items in safe array formatting (`formatSignif`).
- **Files Touched**: `kundali_frontend/src/components/tabs/KPTab.jsx`, `docs/PROJECT_STATUS.md`.

---

### [2026-08-28 12:31 IST] — Commit `96e1d53` / Architecture: Global Error Boundary & Safe Report Rendering
- **Summary**: Integrated a top-level React `ErrorBoundary` and granular tab wrappers to completely eliminate white blank screen crashes across the entire suite.
- **Enhancements**:
  1. Built `ErrorBoundary.jsx` which catches any render-time exception and provides an informative error card with 'Try Again' and 'Back to Form' recovery buttons.
  2. Wrapped `AppRoutes`, `KundaliReport`, and `OverviewTab` inside `ErrorBoundary`.
  3. Added full defensive null-checks in `ReportHeader` (`profile?.name || 'Kundali'`, optional coordinates and timestamps) and `ManglikBadge` (`manglik || {}`).
- **Files Touched**: `kundali_frontend/src/components/ErrorBoundary.jsx`, `kundali_frontend/src/App.jsx`, `kundali_frontend/src/components/KundaliReport.jsx`, `kundali_frontend/src/components/ManglikBadge.jsx`, `docs/PROJECT_STATUS.md`.

---

### [2026-08-28 12:12 IST] — Commit `b0bca11` / Fix: Profile Selection & New User Blank Screen Crash
- **Summary**: Resolved blank screen crash occurring when transitioning between saved profile viewing (`/kundali?profileId=...`) and new user Kundali creation (`/kundali`).
- **Root Causes & Fixes**:
  1. Route Transition Stale State: Cleanly reset state (`status`, `person`, `report`) in `KundaliPage.jsx` when navigating from a profile URL to a new user URL.
  2. Added robust optional chaining and fallback dictionary extraction across `OverviewTab.jsx`, `DoshasTab.jsx`, and `HealthReport.jsx`.
- **Files Modified**: `kundali_frontend/src/pages/KundaliPage.jsx`, `kundali_frontend/src/components/tabs/OverviewTab.jsx`, `kundali_frontend/src/components/tabs/DoshasTab.jsx`, `kundali_frontend/src/components/HealthReport.jsx`, `docs/PROJECT_STATUS.md`.

---

### [2026-08-26 17:20 IST] — Commit `c346198` / Contextual Beginner Help Guides & Native Multi-Language AI
- **Summary**: Implemented contextual beginner & astrologer guide cards across all tabs and switched to a zero-overhead native multi-language architecture with multi-lingual Gemini AI responses.
- **Status**: Completed & Verified.
- **Files Modified / Created**:
  - `kundali_frontend/src/components/HelpAccordion.jsx` (Created)
  - `kundali_frontend/src/components/HelpAccordion.css` (Created)
  - `kundali_frontend/src/components/tabs/PlanetsTab.jsx` (Modified - added Dignities, Pada & SAV guide)
  - `kundali_frontend/src/components/tabs/DashaTab.jsx` (Modified - added Vimshottari & Raj Yoga guide)
  - `kundali_frontend/src/components/tabs/DoshasTab.jsx` (Modified - added Mangal Dosha & Papa Samyam guide)
  - `kundali_frontend/src/components/tabs/KPTab.jsx` (Modified - added KP Sub Lord & Placidus Cusps guide)
  - `kundali_frontend/src/components/tabs/VarshapalTab.jsx` (Modified - added Varsha Pravesh & Muntha guide)
  - `kundali_frontend/src/components/JyotishMatchMatrix.jsx` (Modified - added Sambandha house axes guide)
  - `kundali_frontend/src/components/Navbar.jsx` (Modified - removed Google script, added native language pills)
  - `kundali_frontend/src/components/AIAssistant.jsx` (Modified - passed active language to AI)
  - `kundali_backend/app/ai_service.py` (Modified - added multi-lingual prompt directives for Gemini 2.5 Flash)
  - `kundali_backend/app/main.py` & `models.py` (Modified - accepted language parameter in `/api/v1/ai-chat`)
- **Details & Decisions**:
  1. Per-Object Help: Added expandable `HelpAccordion` to all 8 tabs and match matrix so beginner users understand what numbers, bindus, and dignities mean without prior astrological knowledge.
  2. Native Zero-Overhead Localization: Eliminated external Google Translate iframe/script overhead, removing the intrusive top bar overlay and ensuring 100% authentic Vedic terms.
  3. Multi-Lingual AI: Gemini generates executive summaries and astrological readings directly in Marathi, Hindi, Gujarati, or English based on the active language pill.

---

### [2026-08-26 16:50 IST] — Commit `d107084` / Real-Time Full-Site Google Translation Integration
- **Summary**: Tested Google Translate Element integration; identified script overhead, tracking, and top banner overlay issues that led to building the native Vedic dictionary + multi-lingual Gemini AI architecture in `c346198`.
- **Status**: Completed & Subsequently Optimized.
- **Files Modified / Created**: `kundali_frontend/src/components/GoogleTranslate.jsx/css`, `kundali_frontend/src/components/Navbar.jsx`.

---

### [2026-08-26 16:45 IST] — Commit `6b8e4f5` & `217c4e9` / Phase 10: Full-Suite Deep Multi-Language Translation
- **Summary**: Implemented dynamic 8-tab report localization and expanded `i18n.js` with full English, Marathi, Hindi (`hi`), and Gujarati (`gu`) dictionaries.
- **Status**: Completed & Verified.
- **Files Modified**:
  - `kundali_frontend/src/components/ReportTabs.jsx` (Localized all 8 tabs via `useLang()`)
  - `kundali_frontend/src/utils/i18n.js` (Expanded with Planet table headers, 9 Dignities, 27 Nakshatras, 12 Signs, Form inputs, and Guna Milan scores)
- **Details & Decisions**:
  - Tab keys (`tab.overview`, `tab.planets`, `tab.dasha`, `tab.doshas`, `tab.panchang`, `tab.kp`, `tab.varshapal`, `tab.health`) dynamically translated.
  - Planet table column headers translated into Devanagari and Gujarati.

---

### [2026-08-26 16:40 IST] — Commit `a0a0b3b` / Fix: String Coordinates in Panchang Location Search
- **Summary**: Resolved blank screen crash when selecting a searched city from the Panchang dropdown.
- **Status**: Completed & Verified.
- **Root Cause**: Geocoding results from OpenStreetMap/Nominatim return `lat` and `lon` as strings (e.g. `'19.0760'`), which caused `.toFixed(2)` in React JSX to throw `TypeError: currentCity.lat.toFixed is not a function`.
- **Fix**: Wrapped coordinates in `parseFloat()` in `handleSelectLocation` and `displayLat`/`displayLon` helpers; added safety checks for all Panchang sub-objects.
- **Files Modified**: `kundali_frontend/src/pages/PanchangPage.jsx`.

---

### [2026-08-26 15:58 IST] — Commit `dd85039` / Panchang Precision & Location Event Fix
- **Summary**: Upgraded Panchang engine to Swiss Ephemeris astronomical calculations and improved dropdown click handling.
- **Status**: Completed & Verified.
- **Files Modified**:
  - `kundali_backend/app/panchang_engine.py`: Replaced fixed hour approximations with Swiss Ephemeris `swe.rise_trans` for exact local astronomical Sunrise, Sunset, Brahma Muhurta, Abhijit, and Choghadiya calculations worldwide.
  - `kundali_frontend/src/pages/PanchangPage.jsx`: Used `onMouseDown` for search dropdown item selection to prevent blur dismissal before state update.
- **Verification**: Verified via Python client across Pune (06:19 AM - 06:52 PM), New York (06:18 AM - 07:36 PM), London (06:04 AM - 07:58 PM), and Dubai (05:58 AM - 06:43 PM).

---

### [2026-08-26 15:50 IST] — Commit `6b9ca5b` / Phase 9: Dynamic Panchang, Astro Guide & Jyotish Match Matrix
- **Summary**: Implemented all 3 Phase 9 streams: Dynamic Panchang Location Geocoding with City Presets (9A), Vedic Knowledge Base & Contextual Tooltips (9B), and Professional Jyotish Matchmaking Deep-Dive with Sambandha axes (9C).
- **Status**: Completed & Verified end-to-end.
- **Files Modified / Created**:
  - `kundali_frontend/src/pages/PanchangPage.jsx/css` (Modified - dynamic location search & 10 preset cities)
  - `kundali_frontend/src/components/AstroTooltip.jsx/css` (Created - interactive `?` popovers)
  - `kundali_frontend/src/pages/GuidePage.jsx/css` (Created - Vedic Knowledge Center at `/guide`)
  - `kundali_frontend/src/components/JyotishMatchMatrix.jsx/css` (Created - professional comparative matchmaking matrix)
  - `kundali_frontend/src/pages/MatchPage.jsx` (Modified - rendered JyotishMatchMatrix)
  - `kundali_frontend/src/components/tabs/OverviewTab.jsx` (Modified - attached AstroTooltips)
  - `kundali_frontend/src/components/Navbar.jsx` (Modified - added Guide link)
  - `kundali_frontend/src/App.jsx` (Modified - added `/guide` route)

---

### [2026-08-26 15:30 IST] — Commit `d7176a1` / Phase 8: 3-Way Regional Charts, Multi-Language i18n, Match PDF/AI
- **Summary**: Implemented all 3 Phase 8 streams: East Indian (Bengali/Odia) SVG Chart and 3-way chart style switcher (8A), Expanded 4-Language Localization for English, Marathi, Hindi, Gujarati (8B), and Matchmaking PDF export + AI compatibility reading (8C).
- **Status**: Completed & Verified end-to-end.
- **Files Modified / Created**:
  - `kundali_frontend/src/components/EastIndianChart.jsx/css` (Created)
  - `kundali_frontend/src/components/ChartGrid.jsx` (Modified - 3-way chart style switcher)
  - `kundali_frontend/src/utils/i18n.js` (Modified - added Hindi, Gujarati, and chart labels)
  - `kundali_frontend/src/components/Navbar.jsx` (Modified - 4-language toggle buttons)
  - `kundali_frontend/src/pages/MatchPage.jsx` (Modified - added PDF export, AI narrative, and localization)

---

### [2026-08-25 18:45 IST] — Commit `c70b5c5` & `f75d6bf` / Phase 7: Advanced Astrological Systems (KP System, AI Q&A, Varshapal)
- **Summary**: Implemented all 3 Phase 7 streams: KP System with Placidus Cusps & Sub Lords (7A), Context-Aware Interactive AI Q&A Assistant with Gemini 2.5 Flash (7B), and Tajika Varshapal with Annual Solar Return & Muntha Progression (7C).
- **Status**: Completed & Verified.
- **Files Created / Modified**:
  - `kundali_backend/app/kp_engine.py` (Created - Placidus cusps, Sub Lords, Ruling Planets, Significators)
  - `kundali_backend/app/varshapal_engine.py` (Created - Solar Return binary search, Muntha, Mudda Dasha)
  - `kundali_backend/app/ai_service.py` (Modified - context-aware chart Q&A prompts)
  - `kundali_backend/app/main.py` (Added `/api/v1/kp`, `/api/v1/ai-chat`, `/api/v1/varshapal`)
  - `kundali_frontend/src/components/tabs/KPTab.jsx/css` (Created - 7th tab)
  - `kundali_frontend/src/components/tabs/VarshapalTab.jsx/css` (Created - 8th tab)
  - `kundali_frontend/src/components/AIAssistant.jsx/css` (Created - interactive chat drawer)
  - `kundali_frontend/src/components/KundaliReport.jsx` & `ReportTabs.jsx` (Updated to 8-tab suite)

---

### [2026-08-25 15:30 IST] — Commit `0b75fdc` / Phase 5 & Phase 6: Transits, PDF Export, Bulk Match, Gemstones, Dual Panchang & Kaal Sarp
- **Summary**: Implemented Phase 5 (Real-time Transits/Sade Sati, Client-side PDF Export, Bulk Match Matrix) and Phase 6 (Gemstone/Rudraksha Recommendation Engine, Dual Panchang Architecture, 12 Kaal Sarp Variants).
- **Status**: Completed & Verified.
- **Files Created / Modified**:
  - `kundali_backend/app/transit_engine.py` (Created - live Gochara & Sade Sati)
  - `kundali_backend/app/gemstone_engine.py` (Created - Lagna/5th/9th/10th stones & Rudraksha)
  - `kundali_backend/app/panchang_engine.py` (Created - 5 Limbs, Muhurtas, Choghadiya)
  - `kundali_backend/app/yoga_engine.py` (Updated - 12 Kaal Sarp variants)
  - `kundali_backend/app/main.py` (Added `/transits/live`, `/match-bulk`, `/panchang`)
  - `kundali_frontend/src/utils/pdfExport.js` (Created - multi-tab high-resolution PDF generator)
  - `kundali_frontend/src/components/ExportPDFButton.jsx/css` (Created)
  - `kundali_frontend/src/components/TransitTracker.jsx/css` (Created)
  - `kundali_frontend/src/components/BulkMatchMatrix.jsx/css` (Created)
  - `kundali_frontend/src/components/GemstonePanel.jsx/css` (Created)
  - `kundali_frontend/src/pages/PanchangPage.jsx/css` (Created)
  - `kundali_frontend/src/components/tabs/PanchangTab.jsx` (Created - 6th tab)

---

### [2026-08-25 12:15 IST] — Session `bb79b74f` / Phase 5-7 Roadmap Lock & Status Directives
- **Summary**: Confirmed user decisions on PDF export, dual Panchang, transit tracker locations, and gitignored AI keys; initialized `.agents` directives and living status ledger.
- **Status**: Completed & Ready for Phase 5 Execution.
- **Files Modified / Created**:
  - `.agents/skills/project-status-sync/SKILL.md` (Created)
  - `.agents/rules/status-tracking.md` (Created)
  - `GEMINI.md` (Created)
  - `docs/PROJECT_STATUS.md` (Updated & Expanded)
- **Details & Decisions**:
  1. PDF Export confirmed as single comprehensive document including all tabs.
  2. Panchang confirmed as dual-mode: standalone daily `/panchang` page + tab in Kundali report with Short/Full toggle.
  3. Transit Tracker confirmed for both Overview tab (detailed) and Profile Card (compact real-time badge).
  4. Created Antigravity customization skill and rules to enforce append-only status logging on every future change.

---

### [2026-08-25 10:47 IST] — Commit `a63a622` / Fix Ashtakvarga BAV Button
- **Summary**: Resolved 422 validation error when clicking "Load Full Ashtakvarga (7-Planet BAV Tables)".
- **Status**: Completed & Verified.
- **Files Modified**:
  - `kundali_backend/app/main.py`
  - `kundali_backend/app/astro_engine.py`
  - `kundali_frontend/src/components/tabs/PlanetsTab.jsx`
  - `kundali_frontend/src/components/AshtakvargaGrid.jsx`
  - `kundali_frontend/src/components/AshtakvargaGrid.css`
  - `kundali_frontend/src/pages/KundaliPage.jsx`
- **Details**:
  - Injected `report["person"] = request.person.model_dump()` into backend `/api/v1/kundali` response.
  - Frontend `PlanetsTab` passes `report.person` directly into `AshtakvargaGrid` for on-demand BAV fetching.
  - Added visible `bavError` alert below button if API fails.

---

### [2026-08-24 18:30 IST] — Commit `4518cd3` / Phase 4: Antardasha, Yogas & Ashtakvarga
- **Summary**: Implemented 9-fold Antardashas, 12 classical Vedic yogas & doshas, and full BPHS Ashtakvarga.
- **Status**: Completed.
- **Files Created / Modified**:
  - `kundali_backend/app/dasha.py`
  - `kundali_backend/app/yoga_engine.py`
  - `kundali_backend/app/ashtakvarga_engine.py`
  - `kundali_backend/app/main.py`
  - `kundali_frontend/src/components/DashaTree.jsx/css`
  - `kundali_frontend/src/components/YogaList.jsx/css`
  - `kundali_frontend/src/components/AshtakvargaGrid.jsx/css`

---

### [2026-08-24 16:00 IST] — Commit `3773ee0` / Critical Fix: Profiles Persistence
- **Summary**: Prevented profiles from being wiped on backend server restart.
- **Status**: Completed.
- **Files Modified**: `kundali_backend/app/database.py`
- **Details**: Removed `DROP TABLE IF EXISTS profiles` from `init_db()`. Switched to `CREATE TABLE IF NOT EXISTS` with safe `ALTER TABLE` column migrations.

---

### [2026-08-24 15:10 IST] — Commit `a740f38` / Phase 2: Profile Dashboard Hub
- **Summary**: Rewrote `ProfilesPage` into a full-featured dashboard with stats bar, gender tabs, tag filters, and match tray.
- **Status**: Completed.
- **Files Created / Modified**:
  - `kundali_frontend/src/pages/ProfilesPage.jsx/css`
  - `kundali_frontend/src/components/ProfileCard.jsx/css`
  - `kundali_frontend/src/components/TagBadge.jsx/css`

---

### [2026-08-24 14:00 IST] — Commit `fffe9bd` / Phase 3: 5-Tab Kundali Report
- **Summary**: Transformed monolithic Kundali report into a modern 5-tab interface.
- **Status**: Completed.
- **Files Created / Modified**:
  - `kundali_frontend/src/components/ReportTabs.jsx/css`
  - `kundali_frontend/src/components/tabs/OverviewTab.jsx`
  - `kundali_frontend/src/components/tabs/PlanetsTab.jsx`
  - `kundali_frontend/src/components/tabs/DashaTab.jsx`
  - `kundali_frontend/src/components/tabs/DoshasTab.jsx`
  - `kundali_frontend/src/components/tabs/HealthTab.jsx`

---

### [2026-08-24 12:30 IST] — Commit `7cf6e52` / Phase 1: Gender, Typeahead & Match Redesign
- **Summary**: Implemented strict male/female gender toggle, typeahead search auto-fill, and dual `PartnerSlot` matchmaker.
- **Status**: Completed.
- **Files Created / Modified**:
  - `kundali_frontend/src/components/GenderToggle.jsx/css`
  - `kundali_frontend/src/components/BirthDetailsForm.jsx/css`
  - `kundali_frontend/src/components/PartnerSlot.jsx/css`
  - `kundali_frontend/src/components/SaveProfileButton.jsx/css`
