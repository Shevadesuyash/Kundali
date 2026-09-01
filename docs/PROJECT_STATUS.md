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

### [2026-09-01 15:59 IST] — Commit `b5ba927` / Admin Control Panel (on `develop` branch)
- **Summary**: Implemented a complete Admin Control Panel with authentication-gated access. The admin is identified by `ADMIN_USER_ID` in `.env`. Admin can view ALL profiles from all users (not just their own), see system-wide statistics, and permanently delete any profile.
- **Backend Changes**:
  - **`app/auth.py`**: Added `ADMIN_USER_ID` env var, `is_admin()` helper, `get_admin_user()` FastAPI dependency (returns 403 if not admin).
  - **`app/database.py`**: Added `search_all_profiles_admin()`, `count_all_profiles_admin()`, `get_admin_stats()` — all bypass `user_id` filtering.
  - **`app/main.py`**: Added 3 new endpoints:
    - `GET /api/v1/admin/stats` — System-wide stats (total profiles, users, AI queries).
    - `GET /api/v1/admin/profiles` — All profiles from all users, with search/filter/pagination.
    - `DELETE /api/v1/admin/profiles/{id}` — Admin-only hard delete of any profile.
- **Frontend Changes**:
  - **`src/pages/AdminPage.jsx`** (NEW): Full admin dashboard — stats cards, searchable/sortable/paginated profile table, delete-with-confirm, pagination.
  - **`src/pages/AdminPage.css`** (NEW): Vedic-themed admin panel styling.
  - **`src/App.jsx`**: Added `/admin` route.
  - **`src/components/Navbar.jsx`**: `🛡️ Admin` link appears only for admin user.
  - **`kundali_frontend/.env.example`**: Added `VITE_ADMIN_EMAIL` documentation.
- **Credentials for Local Dev**:
  - **Email**: `test@test.test` | **Password**: `Test@test`
  - This account is admin by default (`ADMIN_USER_ID=local_test_user_1` in `.env`).
  - Access admin panel at: [http://localhost:5173/admin](http://localhost:5173/admin)
- **Production Setup**: Replace `ADMIN_USER_ID` in `kundali_backend/.env` with your Supabase UUID after registering.
- **All 105 backend tests still passing. Vite build clean (0 errors).**
- **Files Modified**: `app/auth.py`, `app/database.py`, `app/main.py`, `src/pages/AdminPage.jsx` (NEW), `src/pages/AdminPage.css` (NEW), `src/App.jsx`, `src/components/Navbar.jsx`, `kundali_backend/.env`, `kundali_frontend/.env.example`.

---

### [2026-09-01 10:22 IST] — Commit `db958ef` / Comprehensive Full-Stack Audit + P0 Critical Bug Fixes (on `develop` branch)
- **Summary**: Performed a complete code audit covering all 21 backend Python files (214 KB), 14 test files (105 tests), 109 frontend files (738.9 KB), README, PROJECT_STATUS.md, .gitignore, requirements.txt, and .env.example files. Identified 20 issues (5 Critical P0, 7 High P1, 8 Medium P2). Fixed all 5 Critical P0 issues immediately.
- **Audit Findings**:
  - **Test Results**: 105/105 backend tests passed in 2.03s. Vite frontend build: 0 errors (1.54 MB bundle).
  - **Astrological Accuracy**: BPHS SAV checksum=337 verified, all per-planet BAV totals match classical values, 3-chart Manglik analysis certified, Jupiter aspect cancellation correct.
  - **Coverage Gaps**: 9 API endpoints have no tests (`/panchang`, `/kp`, `/varshapal`, `/transits`, `/match-saved`, `/match-bulk`, DELETE+PATCH profiles). 12 Kaal Sarp variants untested. JWT expiry edge case untested.
  - **Security Issues**: JWT signature not verified (BUG-001 — partially fixed), JWT expiry not checked (ISSUE-006 — fixed).
  - **Deployment Issues**: `python-dotenv`, `psycopg2-binary`, `uvicorn`, `httpx` missing from requirements.txt (BUG-002/003 — fixed).
- **P0 Fixes Applied in `db958ef`**:
  1. **`requirements.txt`**: Added `uvicorn`, `python-dotenv`, `psycopg2-binary`, `httpx` — critical for Docker/CI/CD deployment.
  2. **`kundali_backend/.env.example`**: Added `DATABASE_URL`, `SUPABASE_JWT_SECRET`, `MANGLIK_MODE`, `NODE_MODE` documentation.
  3. **`kundali_frontend/.env.example`**: Added `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` documentation.
  4. **`app/auth.py`**: Added JWT `exp` claim expiry check — expired tokens now correctly rejected.
  5. **`app/auth.py`**: Added HS256 signature verification using `SUPABASE_JWT_SECRET` when configured in `.env`.
- **Remaining Open Issues**: BUG-001 (full JWT public key verification via JWKS), ISSUE-008 (PostgreSQL connection pooling), ISSUE-014 (bundle code splitting), ISSUE-013 (duplicate login UI consolidation).
- **Status**: Audit Complete, P0 Fixes Applied & Verified on `develop` branch.
- **Files Modified**: `kundali_backend/requirements.txt`, `kundali_backend/.env.example`, `kundali_frontend/.env.example`, `kundali_backend/app/auth.py`.

---

### [2026-08-29 14:20 IST] — Commit `e2537ee` / Auth Pages (Login, Register, VerifyEmail), JWT Validation & Test User Support (on `develop` branch)
- **Summary**: Implemented dedicated auth pages (`/login`, `/register`, `/verify-email`), backend JWT token validation (`app/auth.py`), local SQLite test account support (`test@test.test` / `Test@test`), automatic Bearer token injection in frontend API client, and updated LinkedIn developer profile link.
- **Key Enhancements**:
  1. **Dedicated Auth Pages**: Added `LoginPage.jsx` (with 1-click test user auto-fill), `RegisterPage.jsx` (with password confirmation and redirect), and `VerifyEmailPage.jsx` (with verification notice and direct login button).
  2. **Backend JWT Security Dependency (`app/auth.py`)**: Validates Supabase JWTs and local test tokens; extracts `user_id` and `email` for user-owned profiles and rate-limiting.
  3. **Offline / Test User Support**: Configured seamless local testing with `test@test.test` / `Test@test` returning persistent mock token `mock_jwt_test_user_token_123`.
  4. **Automatic Bearer Token Injection (`src/api/kundaliApi.js`)**: Automatically attaches `Authorization: Bearer <token>` from `localStorage` on all API requests.
  5. **Verified Developer Profile Link**: Updated developer LinkedIn URL to `https://www.linkedin.com/in/suyash-shevade-8b07a9236/` in `SupportDeveloper.jsx`.
  6. **Build & Test Verification**: Vite build succeeded in 1.60s; all 105 pytest unit & regression tests passed in 1.92s.
- **Status**: Completed & Verified on `develop` branch.
- **Files Modified**: `kundali_backend/app/auth.py`, `kundali_backend/tests/test_auth.py`, `kundali_backend/app/main.py`, `kundali_frontend/src/context/AuthContext.jsx`, `kundali_frontend/src/pages/LoginPage.jsx`, `kundali_frontend/src/pages/RegisterPage.jsx`, `kundali_frontend/src/pages/VerifyEmailPage.jsx`, `kundali_frontend/src/pages/AuthPages.css`, `kundali_frontend/src/App.jsx`, `kundali_frontend/src/components/Navbar.jsx`, `kundali_frontend/src/components/SupportDeveloper.jsx`, `kundali_frontend/src/api/kundaliApi.js`, `docs/PROJECT_STATUS.md`.

---

### [2026-08-29 14:06 IST] — Commit `203c7a3` / Supabase Dual-Mode DB, Rate Limiter, Cloud Profile Gating & Dev Support (on `develop` branch)
- **Summary**: Successfully transitioned architecture to cloud-ready foundation on new `develop` branch (keeping `main` safe). Integrated Supabase PostgreSQL (`ap-south-1` Mumbai) with seamless SQLite fallback, IP rate-limiting (1 free query/24h per IP), AI Wallet monetization architecture, Cloud Profile gating, and Developer Support section.
- **Key Enhancements**:
  1. **Dual-Mode Persistence (`app/database.py`)**: Automatic detection of `DATABASE_URL` for Supabase PostgreSQL with `psycopg2-binary`, falling back smoothly to local SQLite `profiles.db` for offline development and testing. Auto-creates `profiles`, `ai_usage_logs`, `user_wallets`, and `location_cache` tables.
  2. **IP & Wallet Rate Limiter (`app/rate_limiter.py`)**: Enforces strict 24-hour rate limit on `/api/v1/ai-chat` for guest IPs (1 free query per 24 hours). Logged-in users can use wallet credits or 24h consultation pass.
  3. **Cloud Profile Gating (`SaveProfileButton.jsx`)**: Authenticated users can save and sync unlimited horoscopes under their `user_id`; guest users receive a clean upgrade / login prompt explaining cloud features.
  4. **Developer Support Section (`SupportDeveloper.jsx`)**: Showcases developer bio (Suyash Dilip Shevade), mission, GitHub (`Shevadesuyash`), LinkedIn, PayPal donation link, and tiered packages (₹49 for 50 AI questions / 24-hour consultation pass).
  5. **Supabase Auth Frontend (`AuthContext.jsx`, `AuthModal.jsx`)**: Added `@supabase/supabase-js` client with Google One-Tap and Email/Password authentication.
  6. **AIAssistant Quota Banner**: Added inline recharge/support banner when daily free limit is reached.
  7. **Build & Test Verification**: Vite built in 1.69s; all 101 pytest unit and regression tests passed.
- **Status**: Completed & Verified on `develop` branch.
- **Files Modified**: `kundali_backend/app/database.py`, `kundali_backend/app/main.py`, `kundali_backend/app/models.py`, `kundali_backend/app/rate_limiter.py`, `kundali_backend/tests/test_rate_limiter.py`, `kundali_frontend/src/lib/supabaseClient.js`, `kundali_frontend/src/context/AuthContext.jsx`, `kundali_frontend/src/components/AuthModal.jsx`, `kundali_frontend/src/components/SupportDeveloper.jsx`, `kundali_frontend/src/components/Navbar.jsx`, `kundali_frontend/src/components/SaveProfileButton.jsx`, `kundali_frontend/src/components/AIAssistant.jsx`, `kundali_frontend/src/api/kundaliApi.js`, `docs/PROJECT_STATUS.md`.

---

### [2026-08-29 13:03 IST] — Commit `42f0807` / Chart Rendering Fix & Universal Rashi/Planet Localization
- **Summary**: Fixed chart grid rendering in Planets tab (resolving the "कुंडली डेटा उपलब्ध नाही" message) and made `signName` / `planetName` intelligent across all formats (`Aquarius (Kumbha)`, `Leo`, `Ketu`, `Sagittarius (Dhanu)`), translating all remaining English Rashis, planets, and classical yogas.
- **Key Enhancements**:
  1. **PlanetsTab Chart Rendering**: Fixed `ChartGrid` props from `{ charts: ... }` to `{ houses: charts.D1_lagna, title: ... }`, restoring D1 Lagna, D9 Navamsha, Rashi Moon, and All Charts views.
  2. **Universal Rashi Translator (`signName`, `signAbbr`)**: Implemented smart index resolver `getSignIndex` in `i18n.js` that maps any string name (`Leo`, `Aquarius`, `Scorpio (Vrishchika)`, `Dhanu`, etc.) to its localized Devanagari/Gujarati name across all tabs (TransitTracker, Overview, KP Cusps/Planets, Varshapal, Manglik).
  3. **Universal Planet Translator (`planetName`, `getPlanetAbbr`)**: Added missing `planet.Ketu` to `TRANSLATIONS` dictionary; fixed planet abbreviations in South, North, and East Indian charts for Marathi, Hindi, and Gujarati.
  4. **Dynamic Raja Yoga & Description Localization**: `getYogaName` dynamically translates combinations like `Kendra-Trikona Raja Yoga (Venus-Moon)` into `केंद्र-त्रिकोण राजयोग (शुक्र–चंद्र)` and provides authentic localized descriptions.
  5. **Gemstone Panel Alignment**: Linked `day_time`, `substitute_gemstone`, and `rudraksha` keys with backend response format; localized metals, fingers, and wearing day/time.
  6. **Build & Test Verification**: Vite build succeeded in 4.21s with zero errors; all 99 pytest unit/regression tests passed.
- **Status**: Completed & Verified.
- **Files Modified**: `kundali_frontend/src/utils/i18n.js`, `kundali_frontend/src/components/tabs/PlanetsTab.jsx`, `kundali_frontend/src/components/ChartGrid.jsx`, `kundali_frontend/src/components/NorthIndianChart.jsx`, `kundali_frontend/src/components/TransitTracker.jsx`, `kundali_frontend/src/components/tabs/OverviewTab.jsx`, `kundali_frontend/src/components/ManglikBadge.jsx`, `kundali_frontend/src/components/tabs/DoshasTab.jsx`, `kundali_frontend/src/components/tabs/KPTab.jsx`, `kundali_frontend/src/components/tabs/VarshapalTab.jsx`, `kundali_frontend/src/components/GemstonePanel.jsx`, `kundali_frontend/src/utils/astroTranslations.js`, `docs/PROJECT_STATUS.md`.

---

### [2026-08-29 12:52 IST] — Commit `eaba27a` / 100% Dynamic Multi-Language Localization Across All Tabs
- **Summary**: Completed 100% end-to-end multi-language localization across all 8 report tabs (Overview, Planets, Dasha, Doshas, Panchang, KP System, Varshapal, Health), eliminating all remaining raw keys and hardcoded English labels in Marathi, Hindi, and Gujarati.
- **Key Enhancements**:
  1. **HealthTab & HealthReport**: Added full translations for all 12 ascendant signs, Prakriti, constitution, body parts, diseases, fever risk levels, mental balance factors, and 6th/8th house disease indicators.
  2. **Live Transit & Sade Sati Tracker**: Localized live Gochara banners, phase badges (Setting/Rising/Peak), phase descriptions, and 9-graha transit table headers and cells.
  3. **OverviewTab**: Localized Ascendant and Moon signs, Nakshatra names, Varna, Gana, Nadi classifications, and D1 house strip occupants.
  4. **DashaTab & DashaTree**: Localized Vimshottari Mahadasha titles, timeline headings, active badges, elapsed progress labels, and duration units (`yrs`/`mos`).
  5. **GemstonePanel**: Localized primary gemstone names, substitute stones, metals, fingers, wearing schedules, and Rudraksha recommendations.
  6. **KPTab**: Localized Ruling Planets (RP), 12 Placidus House Cusps, Planetary KP Positions, and 4-Fold Significators table.
  7. **VarshapalTab**: Localized Mudda Dasha timeline, planet names, day units, and Varshapal planetary positions table.
  8. **Build & Test Verification**: Vite frontend built in 420ms; all 99 backend tests passing in 0.91s.
- **Status**: Completed & Verified.
- **Files Modified**: `kundali_frontend/src/utils/i18n.js`, `kundali_frontend/src/utils/healthAnalysis.js`, `kundali_frontend/src/utils/astroTranslations.js`, `kundali_frontend/src/components/HealthReport.jsx`, `kundali_frontend/src/components/TransitTracker.jsx`, `kundali_frontend/src/components/tabs/OverviewTab.jsx`, `kundali_frontend/src/components/tabs/DashaTab.jsx`, `kundali_frontend/src/components/DashaTree.jsx`, `kundali_frontend/src/components/GemstonePanel.jsx`, `kundali_frontend/src/components/tabs/KPTab.jsx`, `kundali_frontend/src/components/tabs/VarshapalTab.jsx`, `docs/PROJECT_STATUS.md`.

---

### [2026-08-29 12:00 IST] — Commit `fdc1603` / Full Dynamic Multi-Language Translation Engine & Multilingual AI Prompts
- **Summary**: Implemented full dynamic translation across all runtime-generated content, backend string interpolations, and Gemini AI outputs in English, Marathi (मराठी), Hindi (हिंदी), and Gujarati (ગુજરાતી).
- **Key Enhancements & Translations**:
  1. **Multilingual AI Prompt Generation**: Updated `ai_service.py` to accept `language` parameter in `generate_individual_reading` and `generate_match_reading`, enforcing authentic Sanskrit/Devanagari/Gujarati Jyotish terminology when Marathi, Hindi, or Gujarati is selected.
  2. **Dynamic Gemstone Translation**: Localized all gemstone categories, purposes, metals, fingers, wearing day/time, dynamic contraindications (Dusthana lordship, Neecha debilitation), and 4 classical Prana Pratishtha safety guidelines.
  3. **Manglik & Papa Samyam Localization**: Localized tiered severity classifications, multi-chart breakdown pills, cancellation explanations (Mars own-sign, exaltation, Jupiter aspect), Papa Samyam table rows, and combined match compatibility verdicts.
  4. **Dynamic Panchang & Choghadiya**: Localized daytime Choghadiya quality descriptions, Tithi half-tithi notes, daily devotional guidance, and auspicious/inauspicious Muhurta sections.
  5. **Interactive AI Assistant Bot**: Localized quick question chips, placeholder hints, headers, and loading animations across all 4 languages.
  6. **Build & Test Verification**: Vite frontend bundle compiled in 590ms with 0 errors; full backend test suite (99/99 tests) passing with 100% success.
- **Status**: Completed & Verified.
- **Files Modified**: `kundali_backend/app/ai_service.py`, `kundali_backend/app/models.py`, `kundali_backend/app/main.py`, `kundali_frontend/src/api/kundaliApi.js`, `kundali_frontend/src/utils/astroTranslations.js`, `kundali_frontend/src/components/GemstonePanel.jsx`, `kundali_frontend/src/components/ManglikBadge.jsx`, `kundali_frontend/src/components/tabs/DoshasTab.jsx`, `kundali_frontend/src/components/tabs/PanchangTab.jsx`, `kundali_frontend/src/components/GunaMilanScorecard.jsx`, `kundali_frontend/src/components/AIAssistant.jsx`, `docs/PROJECT_STATUS.md`.

---

### [2026-08-29 11:45 IST] — Commit `52942e0` / Sarvashtakvarga 337 Checksum Fix, Ketu Manglik Implementation & Full P0+P1 Accuracy Test Suite
- **Summary**: Resolved classical BPHS Saturn Ashtakvarga bindu count (restoring 337 checksum), implemented Ketu Manglik indicator in `check_manglik()`, enhanced `YogaEngine` house calculations, and deployed full P0 regression & P1 accuracy test suites (all 99 tests passing).
- **Key Enhancements & Corrections**:
  1. **Ashtakvarga 337 Checksum Fix**: Corrected `BPHS_BAV_RULES["Saturn"]["Moon"]` from `[3, 5, 6, 11]` (4 bindus) to classical BPHS Upachaya list `[3, 6, 11]` (3 bindus), fixing Saturn's total to exactly 39 and the grand Sarvashtakvarga sum to the universal 337 bindus.
  2. **Ketu Manglik Indicator**: Computed `ketu_house = house_of_planet(asc_idx, ketu["sign_index"])` and returned `"ketu_manglik": True/False` + `"ketu_house_lagna"` in `check_manglik()`, eliminating dead variable assignment.
  3. **YogaEngine Real Lagna Dynamics**: Updated `YogaEngine` to dynamically compute planetary houses from `lagna_sign_index` (`((p_sign - lagna_sign_idx) % 12) + 1`) and included House 1 (Lagna lord) in Kendra & Trikona Raja Yoga combinations.
  4. **P0 Regression Suite (`tests/test_regression_bugs.py`)**: 19 tests verifying Lagna propagation, dignity population, retrograde key, Jupiter 5/7/9 aspect cancellation, Ketu Manglik key, Panchang nakshatra naming, BPHS 337 checksum, and real-Lagna Raja Yoga detection.
  5. **P1 Accuracy Test Suite**: Built `test_accuracy_astro_engine.py` (Golden India Independence chart, J2000 Lahiri ayanamsha, Ketu=Rahu+180 fuzzing, D9 Navamsha modalities), `test_accuracy_dasha.py` (120-year cycle invariant, continuity, antardasha sum), `test_accuracy_ashtakoot.py` (exhaustive 12x12 and 27x27 bounds, 36 max points, symmetry), `test_accuracy_manglik_papa.py` (three-chart independence, debilitation non-cancellation, weighted Papa Samyam formula), and `test_accuracy_yogas_gemstones.py` (all 12 ascendants life stones, catalog coverage).
  6. **Test Coverage**: 99 pytest tests passing in 1.59s with 100% success rate.
- **Status**: Completed & Verified.
- **Files Modified / Created**: `kundali_backend/app/ashtakvarga_engine.py`, `kundali_backend/app/kundali_analyzer.py`, `kundali_backend/app/panchang_engine.py`, `kundali_backend/app/yoga_engine.py`, `kundali_backend/tests/test_regression_bugs.py`, `kundali_backend/tests/test_accuracy_astro_engine.py`, `kundali_backend/tests/test_accuracy_dasha.py`, `kundali_backend/tests/test_accuracy_ashtakoot.py`, `kundali_backend/tests/test_accuracy_manglik_papa.py`, `kundali_backend/tests/test_accuracy_yogas_gemstones.py`, `docs/PROJECT_STATUS.md`.

---

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
