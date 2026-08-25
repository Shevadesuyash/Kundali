# Kundali Milan — Living Project Status

> **Rule:** Update this file in EVERY commit. Append a new row to the Append Log and update Current State as needed.
>
> **Last Updated:** 2026-08-25
> **Branch:** main
> **Repo:** https://github.com/Shevadesuyash/Kundali

---

## Current State (2026-08-25)

### Servers
| Service | Port | Start Command |
|---|---|---|
| Backend (FastAPI + Uvicorn) | 8000 | `uvicorn app.main:app --reload --port 8000` (from kundali_backend/) |
| Frontend (React + Vite) | 5173 | `npm run dev` (from kundali_frontend/) |

---

## Commit History

`
4df6453  chore: remove superseded root plan files
1af232a  docs: update README.md for Phases 1-4
a63a622  Fix: Load Full Ashtakvarga (BAV) button now works
f835710  Update docs to mark Phase 4 complete
4518cd3  Phase 4: Antardasha Tree, Yoga Detection, Ashtakvarga (SAV+BAV)
3748c20  Add comprehensive handoff docs and roadmap
3773ee0  Critical fix: profiles no longer wiped on restart
a740f38  Phase 2: Profile Dashboard Hub
1288a2a  Phase 2 prep: ProfileCard, TagBadge
0695ed3  Fix gender state, report badge, SaveProfileButton, PATCH integrity
fffe9bd  Phase 3: 5-tab Kundali report layout
7cf6e52  Phase 1: Gender toggle, profile auto-fill, PartnerSlot, fresh DB schema
630d0bc  Refactor Manglik, Papa Samyam, Bhakoot 5/9
51ff1f1  User profile registry + 3-tier location cache
a0e22ff  Ashtakoot + Mangal Dosha accuracy upgrade
7418299  Initial commit: Kundali Milan App
`

---

## Backend — File Map

Directory: kundali_backend/app/

| File | What It Does |
|---|---|
| main.py | FastAPI app, all 11 REST endpoints, CORS, engine singletons |
| models.py | Pydantic v2: Person, BirthDetails, KundaliRequest, MatchRequest, SaveProfileRequest, ProfileSummary, ProfileDetail, ProfileTypeahead, MatchSavedRequest |
| astro_engine.py | Swiss Ephemeris wrapper — sidereal Lahiri positions, Ascendant, house placements, Nakshatra/Pada, D9, get_technical_profile() |
| kundali_analyzer.py | build_report() orchestrator — astro + dasha + yoga + ashtakvarga + charts + check_manglik() + Papa Samyam |
| dasha.py | VimshottariCalculator — 9 Mahadashas + 9 Antardashas each. Proportional sub-period calculation |
| yoga_engine.py | YogaEngine.detect_yogas() — 10 benefic yogas + 4 malefic doshas (see list below) |
| ashtakvarga_engine.py | BPHS BAV for 7 planets x 8 refs x 12 signs. calculate_sav() in report, calculate_full() on-demand |
| chart_engine.py | ChartEngine — D1 Lagna, D9 Navamsa, Chandra Rasi 12-house grids |
| matchmaker.py | MatchMaker.match_profiles() — delegates to ashtakoot.py |
| ashtakoot.py | Full 8-Koota Guna Milan (36-pt) + Papa Samyam weighted score |
| database.py | SQLite CRUD — profiles table, 3-tier geocode cache, safe ALTER migrations |
| geocode_service.py | Location search wrapper (memory L1 -> SQLite L2 -> Nominatim L3) |
| ai_service.py | Optional AI reading generation |

---

## SQLite Database Schema (profiles.db)

`sql
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
    tag          TEXT DEFAULT 'self',  -- self|family|friend|partner|client
    created_at   TEXT NOT NULL
);
`

IMPORTANT: DROP TABLE was removed in 3773ee0. Profiles persist across restarts.

---

## REST API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | / | App info |
| GET | /health | {status: ok} |
| POST | /api/v1/kundali | Full Kundali — planets, charts, dashas, yogas, SAV, manglik. Response includes 'person' key (echo of request for frontend BAV reuse) |
| POST | /api/v1/ashtakvarga | On-demand full BAV (7p x 8r x 12s) + SAV |
| POST | /api/v1/match | Guna Milan 36-pt + Papa Samyam for two BirthDetails |
| POST | /api/v1/match-saved | Same using two saved profile IDs |
| POST | /api/v1/profiles | Save new profile (recomputes astro at save time) |
| GET | /api/v1/profiles | List/search profiles (?q=&gender=&tag=&page=&per_page=), returns male_count+female_count |
| GET | /api/v1/profiles/search | Typeahead (?q=&limit=) min 2 chars — for form autofill |
| GET | /api/v1/profiles/{id} | Single profile detail |
| PATCH | /api/v1/profiles/{id} | Partial update — recomputes astro if birth fields change |
| DELETE | /api/v1/profiles/{id} | Hard delete |
| GET | /api/v1/geocode | Location search (?q=) — 3-tier cached |

---

## Frontend — File Map

Pages (src/pages/):
- HomePage.jsx — landing page
- KundaliPage.jsx — birth form + 5-tab Kundali report. Attaches data.raw_person = payload
- MatchPage.jsx — dual PartnerSlot, supports saved profile or manual entry
- ProfilesPage.jsx — dashboard hub: stats bar, gender tabs, tag filters, ProfileCard grid, Match Tray, delete

Key Components (src/components/):
- KundaliReport.jsx — 5-tab container
- ReportTabs.jsx — tab nav bar
- tabs/OverviewTab.jsx — birth summary, classification, D1/D9/Chandra chart selector
- tabs/PlanetsTab.jsx — planet table + chart + AshtakvargaGrid. Reads report.person -> report.raw_person -> profile fallback
- tabs/DashaTab.jsx — DashaTree accordion + YogaList (benefic)
- tabs/DoshasTab.jsx — Manglik card + YogaList (malefic only)
- tabs/HealthTab.jsx — HealthReport
- DashaTree.jsx — accordion: 9 Mahadashas + 9 Antardashas, progress bars, active indicator
- YogaList.jsx — yoga/dosha cards, filterType: 'benefic'|'malefic'
- AshtakvargaGrid.jsx — SAV heatmap always shown + lazy BAV load button. Shows bavError if fails
- ProfileCard.jsx — name, gender badge, Lagna/Rasi/Nakshatra, Dasha, Manglik, tag, match-checkbox
- BirthDetailsForm.jsx — typeahead name search, auto-fill, override badge
- PartnerSlot.jsx — saved profile selector or manual form, Swap button
- GenderToggle.jsx — male/female only
- SaveProfileButton.jsx — save/update from report, gender synced via useEffect
- NorthIndianChart.jsx — North Indian diamond SVG chart
- ChartGrid.jsx — chart renderer for D1/D9/Chandra

API (src/api/kundaliApi.js):
- getKundali, getAshtakvarga, getMatch, matchSaved, saveProfile, updateProfile, getProfiles, searchProfiles, deleteProfile, geocode

---

## Yoga Engine — Detected Yogas

Benefic:
1. Gaja Kesari — Jupiter in kendra (1,4,7,10) from Moon
2. Budhaditya — Sun + Mercury same sign
3. Ruchaka (Pancha Mahapurusha) — Mars own/exalt in kendra
4. Bhadra — Mercury own/exalt in kendra
5. Hamsa — Jupiter own/exalt in kendra
6. Malavya — Venus own/exalt in kendra
7. Shasha — Saturn own/exalt in kendra
8. Chandra-Mangala — Moon + Mars same sign
9. Amala — Benefic in 10th from Lagna or Moon
10. Kendra-Trikona Raja Yoga — Kendra lord + Trikona lord conjunct/aspect

Malefic:
11. Kemadruma — no planets in 2nd or 12th from Moon (with cancellation check)
12. Kaal Sarp — all 7 planets between Rahu and Ketu
13. Guru Chandal — Jupiter conjunct Rahu or Ketu
14. Pitra Dosha — Sun conjunct Rahu or Ketu

---

## Design Decisions & Rules

| Rule | Detail |
|---|---|
| Gender | 'male' / 'female' ONLY — no boy/girl/other |
| DB | CREATE TABLE IF NOT EXISTS — no DROP on startup |
| Kundali compute | Always recomputed live — DB stores summary only |
| BAV | Not in default Kundali response — on-demand via button |
| report.person | Backend echoes BirthDetails in every /api/v1/kundali response for frontend reuse |
| Manglik school | Standard Parashara (1,4,7,8,12) — NOT South Indian 6-house; Mars in H2 is NOT Manglik |
| Ayanamsha | Lahiri (Chitrapaksha) |
| Ephemeris | Moshier built-in (no .se1 files) — accurate to arc-seconds for Rashi/Nakshatra |
| Test chart | Suyash Shevade 30-Mar-2003 22:10 Chiplun: SAV=338, 1 Yoga (Budhaditya) |

---

## Known Issues

- [x] Profiles wiped on restart — Fixed 3773ee0
- [x] SaveProfileButton gender not syncing — Fixed 0695ed3
- [x] BAV button 422 error (missing year/month fields) — Fixed a63a622
- [ ] No unit tests for Phase 3/4 frontend components

---

## Next — Phase 5

Stream A: Sade Sati & Gochara Transit Tracker
  - New: kundali_backend/app/transit_engine.py
  - New endpoint: GET /api/v1/transits/{profile_id}
  - New: src/components/TransitTracker.jsx
  - Modify: OverviewTab.jsx (add TransitTracker at bottom)

Stream B: PDF Export (client-side)
  - Install: npm install jspdf html2canvas
  - New: src/utils/pdfExport.js
  - New: src/components/ExportPDFButton.jsx
  - Modify: KundaliReport.jsx (data-pdf-section attributes + button)

Stream C: Bulk Compatibility Matrix
  - New endpoint: POST /api/v1/match-bulk
  - New model: BulkMatchRequest in models.py
  - New: src/components/BulkMatchMatrix.jsx
  - Modify: ProfilesPage.jsx (Quick Match All button)

---

## Append Log (newest first)

| Date | Commit | What Changed |
|---|---|---|
| 2026-08-25 | — | Decisions confirmed: PDF=all tabs; Panchang=dual mode; Transit=both locations; AI key gitignored |
| 2026-08-25 | 4df6453 | Removed stale PLAN.md, FRONTEND_PLAN.md, implementation_plan phase new.md |
| 2026-08-25 | 1af232a | Full README.md rewrite — all Phases 1-4 features documented |
| 2026-08-25 | a63a622 | BAV fix — report.person injected in backend; PlanetsTab uses it; bavError shown to user |
| 2026-08-24 | 4518cd3 | Phase 4 — DashaTree, YogaList, AshtakvargaGrid, yoga_engine, ashtakvarga_engine, Antardashas, /api/v1/ashtakvarga |
| 2026-08-24 | 3773ee0 | Critical: removed DROP TABLE — profiles persist across restarts |
| 2026-08-24 | a740f38 | Phase 2 — ProfilesPage hub, ProfileCard, TagBadge, Match Tray, gender stats bar |
| 2026-08-24 | 0695ed3 | Bug fixes — gender state, report badge, SaveProfileButton sync, PATCH integrity, Manglik mode |
| 2026-08-24 | fffe9bd | Phase 3 — 5-tab layout: ReportTabs + 5 tab panels |
| 2026-08-24 | 7cf6e52 | Phase 1 — GenderToggle, BirthDetailsForm typeahead, PartnerSlot, fresh thin DB schema |

