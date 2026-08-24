# Kundali App — Comprehensive Enhancement Plan (Updated)

> **Last updated:** 2026-08-23 · All open questions resolved — plan is finalized and ready to execute.

---

## Resolved Design Decisions

| # | Decision | Resolution |
|---|---|---|
| **DB Migration** | Start fresh or migrate? | **Fresh start** — wipe `profiles.db`. DB stores only birth info (name, gender, DOB, place, lat/lon, tz). Kundali is always re-computed on demand. |
| **Gender values** | `boy/girl` vs `male/female` | **`male` / `female` only.** Drop `boy`, `girl`, `other` entirely. |
| **Ashtakvarga scope** | SAV only vs full BAV? | **Lazy on-demand BAV.** Initial Kundali shows SAV table only. User clicks `[Load Full Ashtakvarga ▾]` to trigger a second API request for all 7 BAV grids. No extra computation unless explicitly requested. |
| **PDF Export** | `window.print()` vs `jsPDF`? | **Deferred to Phase 5** — implement basic `window.print()` first; evaluate jsPDF after seeing the output. Not a blocking priority. |
| **Phase order** | Sequential vs prioritised? | **Dependency-driven order** (1→3→2→4→5). Phase 3 cleanup is done before Phase 2 dashboard so the card components built in Phase 3 are reused in Phase 2. Each phase gets its own detailed sub-plan before execution starts. |

---

## Architecture Principles (Locked In)

- **DB is thin.** `profiles` table stores only: `id`, `name`, `gender`, `year`, `month`, `day`, `hour`, `minute`, `lat`, `lon`, `timezone_str`, `birth_place`, `moon_sign`, `nakshatra`, `lagna`, `is_manglik`, `active_dasha`, `tag`, `created_at`. No chart blobs, no full report JSON.
- **Compute on demand.** Every `/api/v1/kundali` call re-runs the Swiss Ephemeris. No caching of Kundali reports.
- **On-demand BAV.** A separate endpoint `POST /api/v1/ashtakvarga` accepts birth details and returns full BAV + SAV. The frontend calls this only when the user requests it.
- **No stuck phases.** Each phase starts with a sub-plan artifact before code is written. If a phase hits a blocker, it parks the specific item and continues the rest.

---

## Execution Order (Dependency-Driven)

```
Phase 1  →  Phase 3  →  Phase 2  →  Phase 4  →  Phase 5
  │              │              │              │              │
Gender +      Report        Dashboard      Antardasha     Transits +
Auto-fill     Cleanup +     Hub using      + Yoga +       PDF +
+ Match       Tabs          Phase-3        Ashtakvarga    Backup
Redesign      Components    cards          (lazy BAV)
```

**Why 1→3→2→4→5?**
- Phase 3 produces `PlanetChip`, `DignityChip`, `ReportTabs`, tab sub-components → these are consumed by Phase 2 dashboard cards.
- Phase 2 dashboard needs the profile CRUD endpoints finalized (done in Phase 1).
- Phase 4 depends on Phase 3's tab structure (Dasha tab, Planets tab slots are already there).
- Phase 5 is additive (transits, export) with no upstream dependencies.

---

## Phase 1 — Gender Selection, Profile Auto-Fill & Match Redesign

### Goal
Implement `male`/`female` gender toggle on all forms, typeahead name→profile auto-fill with an override badge system, and redesign `MatchPage` with dual `PartnerSlot` cards and a Swap button.

### Backend Changes

#### [MODIFY] [`models.py`](file:///c:/Users/sheva/antigravity/Kundali/kundali_backend/app/models.py)
- Change `SaveProfileRequest.gender` → `Literal["male", "female"]` (remove `"boy"`, `"girl"`, `"other"`)
- Add `lagna: Optional[str]` to `ProfileSummary` and `ProfileDetail`
- Add `active_dasha: Optional[str]` to `ProfileSummary` and `ProfileDetail`
- Add `tag: Optional[str]` to `ProfileSummary` and `ProfileDetail`

#### [MODIFY] [`database.py`](file:///c:/Users/sheva/antigravity/Kundali/kundali_backend/app/database.py)
- **Drop and recreate `profiles` table** (fresh start — no migration needed)
- New schema adds: `lagna TEXT`, `active_dasha TEXT`, `tag TEXT DEFAULT 'self'`
- Gender `CHECK` constraint updated: `CHECK(gender IN ('male','female'))`
- Update `save_profile()` to accept `lagna`, `active_dasha`, `tag`
- Update `search_profiles()` to return all new columns + support `tag=` filter
- Update `get_profile_by_id()` to return all new columns
- Add `update_profile(id, **fields)` function for PATCH support
- Add `delete_profile(id)` function

#### [MODIFY] [`main.py`](file:///c:/Users/sheva/antigravity/Kundali/kundali_backend/app/main.py)
- `create_profile()`: extract `lagna` from `report["ascendant"]["sign"]`, `active_dasha` from current `dasha_periods` entry (`is_current=True`)
- `_row_to_detail()`: include `lagna`, `active_dasha`, `tag`
- **Add:** `GET /api/v1/profiles/search?q=<name>&limit=5` — lightweight typeahead endpoint returning only: `id, name, gender, year, month, day, hour, minute, lat, lon, timezone_str, birth_place, lagna, moon_sign`
- **Add:** `PATCH /api/v1/profiles/{id}` — partial update (birth details, tag)
- **Add:** `DELETE /api/v1/profiles/{id}` — hard delete
- `list_profiles()`: add `tag=` query param filter

---

### Frontend Changes

#### [NEW] `src/components/GenderToggle.jsx` + `GenderToggle.css`
Segmented button toggle:
- `♂ Male` | `♀ Female`
- Props: `value: "male"|"female"`, `onChange`
- Renders at top of every birth-details block

#### [MODIFY] [`BirthDetailsForm.jsx`](file:///c:/Users/sheva/antigravity/Kundali/kundali_frontend/src/components/BirthDetailsForm.jsx)
- Add `GenderToggle` above Name field (required field with visual error if empty on submit)
- **Typeahead name search:** as user types ≥2 chars in Name field, debounce-query `GET /api/v1/profiles/search?q=<name>&limit=5`, show floating dropdown (same UX as existing place-search dropdown)
- On profile pick: auto-fill all fields (name, gender, DOB, time, lat, lon, tz, birth_place display)
- Track `sourceProfileId` + `isModified` state
- Show `📝 Modified from Saved Profile` badge when any field changes post-fill
- Two action chips when modified: `[Save Changes]` → `PATCH /api/v1/profiles/:id` | `[Keep as One-Time]` → dismisses badge
- Update `makeEmptyPerson()` to include `gender: ''`

#### [NEW] `src/components/PartnerSlot.jsx` + `PartnerSlot.css`
One partner card (Groom / Bride). Contains:
- Role header: `PARTNER 1 — GROOM / MALE` or `PARTNER 2 — BRIDE / FEMALE`
- Mode toggle: `[Select Saved Profile ▾]` vs `[○ Enter New Details]`
- **Saved mode:** searchable profile dropdown (pre-filtered by expected gender), selected profile summary chip, `[✏️ Override]` button
- **New entry mode:** full `BirthDetailsForm`
- Both modes can show the `Modified from Saved Profile` badge

#### [MODIFY] [`MatchPage.jsx`](file:///c:/Users/sheva/antigravity/Kundali/kundali_frontend/src/pages/MatchPage.jsx)
- Replace two stacked `BirthDetailsForm` with two `PartnerSlot` components
- Add `⇅ Swap Partners` button between slots — swaps all field state including gender
- Accept `?partner1Id=` / `?partner2Id=` URL params (pre-fill from dashboard, Phase 2)

#### [MODIFY] [`kundaliApi.js`](file:///c:/Users/sheva/antigravity/Kundali/kundali_frontend/src/api/kundaliApi.js)
- `searchProfilesTypeahead(q, limit)` → `GET /api/v1/profiles/search`
- `updateProfile(id, payload)` → `PATCH /api/v1/profiles/:id`
- `deleteProfile(id)` → `DELETE /api/v1/profiles/:id`

#### [MODIFY] [`KundaliReport.jsx`](file:///c:/Users/sheva/antigravity/Kundali/kundali_frontend/src/components/KundaliReport.jsx)
- Display birth location in header: `🌐 Pune, Maharashtra, India · Lat: 18.52 · Lon: 73.86`

---

### Phase 1 Verification
- [ ] Name typeahead shows matching profiles after 2+ chars
- [ ] Selecting a profile auto-fills all fields including gender toggle
- [ ] Modifying any field shows "Modified" badge
- [ ] "Save Changes" PATCH updates DB, refreshes badge
- [ ] Swap button correctly exchanges both partner slots
- [ ] `GET /api/v1/profiles` returns `lagna`, `active_dasha`, `tag` in response
- [ ] `DELETE /api/v1/profiles/:id` removes profile correctly

---

## Phase 3 — Report Cleanup & Tabbed Kundali Layout

*(Executed before Phase 2 so tab sub-components are ready for dashboard card reuse)*

### Goal
Fix all formatting issues and restructure `KundaliReport` from a single scroll page into a **5-tab layout** that becomes the foundation for Phase 2 and Phase 4 additions.

---

### Backend Changes

#### [MODIFY] [`kundali_analyzer.py`](file:///c:/Users/sheva/antigravity/Kundali/kundali_backend/app/kundali_analyzer.py)
Add `dignity` and `strength_score` to each planet entry in `technical_profile["planets"]`:

| Dignity | Condition |
|---|---|
| `exalted` | Planet in classical exaltation sign |
| `own` | Planet in own sign (mooltrikona / swakshetra) |
| `debilitated` | Planet in fall (neecha) sign |
| `combust` | Within combust degree of Sun (planet-specific threshold) |
| `neutral` | All other cases |

- `strength_score`: float 0.0–1.0 (exalted=1.0, own=0.8, neutral=0.5, debilitated=0.2, combust=0.1)
- Ensure `HealthReport` title is not in the report JSON (it's a frontend concern)

---

### Frontend Changes

#### [NEW] `src/components/ReportTabs.jsx` + `ReportTabs.css`
Tab bar: `Overview & Charts` | `Planets & Strength` | `Dasha & Predictions` | `Doshas & Remedies` | `Health & Wellness`
- Keyboard navigable (arrow keys)
- Active tab persists in URL hash (`#overview`, `#planets`, etc.)
- Mobile: horizontal scroll tab bar

#### [NEW] `src/components/tabs/OverviewTab.jsx`
- Birth details header with location string
- Classification cards: Varna, Gana, Nadi
- Chart selector + D1 / D9 / Chandra Kundali charts
- *(Panchang block — Phase 4 addition slot)*

#### [NEW] `src/components/tabs/PlanetsTab.jsx`
- Full `PlanetTable` with dignity chips + strength meter bars
- *(Ashtakvarga SAV table — Phase 4 addition slot)*
- *(`[Load Full Ashtakvarga ▾]` lazy-load button — Phase 4)*

#### [NEW] `src/components/tabs/DashaTab.jsx`
- Current Dasha highlight card (planet name + date range + % elapsed progress bar)
- Flat `DashaTable` for now (upgraded to accordion tree in Phase 4)
- *(Yoga list — Phase 4 addition slot)*
- *(Current Transits card — Phase 5 addition slot)*

#### [NEW] `src/components/tabs/DoshasTab.jsx`
- **Rebuilt Manglik section:**
  - Primary badge only: `✅ Not Manglik` / `⚠️ Manglik — Primary` / `🟡 Cancelled`
  - Secondary descriptive note: *"Mars occupies the 8th house from Lagna. From Moon chart: 3rd house (non-Manglik)."*
  - Papa Samyam breakdown table (Lagna / Moon / Venus scores + total)
- *(Secondary Doshas — Kaal Sarp, Pitra — Phase 4 addition slot)*
- Remedies placeholder section (gemstone, mantra — static text for now)

#### [NEW] `src/components/tabs/HealthTab.jsx`
- Moved `HealthReport` component here
- Medical disclaimer banner at top
- *(Ayurvedic Prakriti — Phase 5 addition slot)*

#### [NEW] `src/components/PlanetChip.jsx` + `PlanetChip.css`
Color-coded planet name badge. Fixed color per graha (Sun=gold, Moon=silver, Mars=red, Mercury=green, Jupiter=yellow, Venus=pink, Saturn=indigo, Rahu=dark grey, Ketu=brown).

#### [NEW] `src/components/DignityChip.jsx`
Badge for dignity: `Exalted` (green) / `Own Sign` (teal) / `Debilitated` (red) / `Combust` (orange) / `Neutral` (grey).

#### [MODIFY] [`PlanetTable.jsx`](file:///c:/Users/sheva/antigravity/Kundali/kundali_frontend/src/components/PlanetTable.jsx)
- Replace raw `abbr` strings with `<PlanetChip>` components
- Add `Dignity` column using `<DignityChip>`
- Add `Strength` column with a narrow horizontal progress bar

#### [MODIFY] [`ManglikBadge.jsx`](file:///c:/Users/sheva/antigravity/Kundali/kundali_frontend/src/components/ManglikBadge.jsx)
- Single primary badge, secondary note text — no duplicate badge rows

#### [MODIFY] [`KundaliReport.jsx`](file:///c:/Users/sheva/antigravity/Kundali/kundali_frontend/src/components/KundaliReport.jsx)
- Replace single-scroll layout with `<ReportTabs>` container
- Remove standalone Health section title (now inside `HealthTab`)
- Remove or hide House Summary Strip by default (convert to `<details>` accordion if desired)
- Keep `compact` prop mode (used in `MatchPage` individual charts) that bypasses tabs and shows a summary view

---

### Phase 3 Verification
- [ ] All 5 tabs render correct sections without page reload
- [ ] No duplicate "Health & Disease Insights" header
- [ ] Planet table shows `PlanetChip` names — no raw `Mo Ke` or `RahuACTIVE` strings
- [ ] Dignity column shows correct labels (verify known chart: exalted Mars in Capricorn, etc.)
- [ ] Manglik tab shows single badge + secondary note only
- [ ] House strip hidden/collapsed by default
- [ ] Tab state reflects in URL hash and is bookmarkable
- [ ] `compact` mode still works in MatchPage

---

## Phase 2 — User Dashboard & Profile Hub

*(Requires Phase 1 CRUD endpoints and Phase 3 card components)*

### Goal
Transform `ProfilesPage` from a pick-for-match list into a rich **Profile Management Hub** with rich cards, tag filters, and quick-action navigation.

---

### Backend Changes

*(All endpoints already added in Phase 1 — no additional backend work required for Phase 2.)*

Only addition: `list_profiles()` must support `tag=` filter — confirm this was included in Phase 1 (yes, it is).

---

### Frontend Changes

#### [MODIFY] [`ProfilesPage.jsx`](file:///c:/Users/sheva/antigravity/Kundali/kundali_frontend/src/pages/ProfilesPage.jsx)
Full redesign into **Dashboard Hub**:

**Stats Bar (header):**
- `{total} Profiles` · `{male_count} ♂ Male` · `{female_count} ♀ Female`
- `[+ Add New Profile]` → navigate to `/kundali` (opens fresh form)

**Filter Bar:**
- Gender tabs: `All` | `Male` | `Female`
- Tag filter chips: `All` | `Self` | `Family` | `Friend` | `Partner` | `Client`

**Profile Cards Grid:**
Each card shows:
- Name · Gender pill (`♂ Male` blue / `♀ Female` pink)
- DOB + Birth Place
- Moon Sign badge · Nakshatra badge · Lagna badge
- Active Dasha badge: `⏳ Rahu Mahadasha`
- Manglik status pill
- Tag chip (editable inline)

**Quick Actions per card:**
- `[🔭 View Kundali]` → `/kundali?profileId={id}` (auto-fills + auto-submits)
- `[💞 Match Profile]` → `/match?partner1Id={id}` (pre-fills Partner 1 slot)
- `[✏️ Edit]` → inline edit for name / tag / birth details
- `[🗑️ Delete]` → confirmation popover then `DELETE`

**Match Tray (secondary feature):**
- `[Compare Two Profiles]` toggle shows the existing pick-boy/pick-girl tray + `Run Guna Milan` button

#### [NEW] `src/components/ProfileCard.jsx` + `ProfileCard.css`
Extracted profile card component with all badges, quick actions, and inline tag editor.

#### [NEW] `src/components/TagBadge.jsx`
Tag chip with distinct color per tag value:
- `self` = purple · `family` = blue · `friend` = green · `partner` = pink · `client` = orange

#### [MODIFY] [`KundaliPage.jsx`](file:///c:/Users/sheva/antigravity/Kundali/kundali_frontend/src/pages/KundaliPage.jsx)
- On mount: read `?profileId=` URL param → `GET /api/v1/profiles/:id` → auto-fill form + auto-submit Kundali

#### [MODIFY] `MatchPage.jsx` *(addendum from Phase 1)*
- Already reads `?partner1Id=` / `?partner2Id=` — ensure pre-fill + Saved Profile mode activates automatically

#### [MODIFY] [`ProfilesPage.css`](file:///c:/Users/sheva/antigravity/Kundali/kundali_frontend/src/pages/ProfilesPage.css)
Full overhaul — responsive card grid, stat bar layout, tag chip colors, action button styles.

---

### Phase 2 Verification
- [ ] Stats bar counts update correctly on filter change
- [ ] Tag filter chips narrow grid to correct profiles
- [ ] `[View Kundali]` auto-fills and submits the Kundali form
- [ ] `[Match Profile]` opens match form with Partner 1 pre-filled in Saved Profile mode
- [ ] Delete shows confirmation, removes card, updates count
- [ ] Tag edit in-card saves via PATCH immediately

---

## Phase 4 — Antardasha Tree, Yoga Detection & Ashtakvarga (Lazy BAV)

### Goal
Add Antardasha sub-periods, automated Vedic Yoga detection, and the Ashtakvarga scoring system. BAV computation is **on-demand only** (user-triggered).

---

### Backend Changes

#### [MODIFY] [`dasha.py`](file:///c:/Users/sheva/antigravity/Kundali/kundali_backend/app/dasha.py)
Extend `VimshottariCalculator.calculate_dasha_periods()` to include Antardasha:
- For each Mahadasha `i`, compute all 9 sub-periods:
  `antardasha_years = (mahadasha_total_years × sub_planet_years) / 120`
- Each Antardasha entry: `{ planet, start_date, end_date, is_current }`
- Shape: `dasha_periods[i]["antardashas"] = [...]`
- Backward compatible — top-level `dasha_periods` shape unchanged

#### [NEW] `app/yoga_engine.py`
`YogaEngine.detect_yogas(technical_profile) -> List[Dict]`

Detects 12 classical Yogas:

| Yoga | Condition | Type |
|---|---|---|
| Gaja Kesari | Jupiter in Kendra (1/4/7/10) from Moon | Benefic |
| Budhaditya | Sun + Mercury conjunct | Benefic |
| Hamsa | Jupiter exalted/own in Kendra | Benefic |
| Malavya | Venus exalted/own in Kendra | Benefic |
| Ruchaka | Mars exalted/own in Kendra | Benefic |
| Bhadra | Mercury exalted/own in Kendra | Benefic |
| Shasha | Saturn exalted/own in Kendra | Benefic |
| Raja Yoga | 9th + 10th lord conjunction / mutual aspect | Benefic |
| Dhana Yoga | 2nd + 11th lord association | Benefic |
| Kaal Sarp | All planets between Rahu–Ketu axis | Malefic |
| Pitra Dosha | Sun + Rahu/Ketu conjunct or Sun in 9H with malefics | Malefic |
| Kemadruma | No planets in 2nd/12th from Moon | Malefic |

Returns `[{ name, type, description, planets_involved, is_present }]`

#### [NEW] `app/ashtakvarga_engine.py`
Two-tier computation:

**SAV (always computed, included in main kundali response):**
`AshtakvargaEngine.calculate_sav(technical_profile) -> { sav: [int × 12], sav_total: int }`

**Full BAV (on-demand only, separate endpoint):**
`AshtakvargaEngine.calculate_full(technical_profile) -> { bav: { Sun: [...], Moon: [...], ...}, sav: [...] }`

#### [MODIFY] [`kundali_analyzer.py`](file:///c:/Users/sheva/antigravity/Kundali/kundali_backend/app/kundali_analyzer.py)
- Call `YogaEngine.detect_yogas()` → add `yogas` to report
- Call `AshtakvargaEngine.calculate_sav()` → add `ashtakvarga_sav` to report
- Update `dasha_periods` to use extended tree with `antardashas`

#### [MODIFY] [`main.py`](file:///c:/Users/sheva/antigravity/Kundali/kundali_backend/app/main.py)
- **Add:** `POST /api/v1/ashtakvarga` — accepts `BirthDetails` payload, returns full BAV + SAV. Called only when user clicks the button.

---

### Frontend Changes

#### [MODIFY] `src/components/tabs/DashaTab.jsx`
- Replace flat table with `<DashaTree>` accordion component
- Active Mahadasha auto-expanded; active Antardasha highlighted within it

#### [NEW] `src/components/DashaTree.jsx` + `DashaTree.css`
Interactive accordion tree:
- Mahadasha row: planet glyph + name + date range + progress bar (% elapsed for current)
- Expand chevron → reveals 9 Antardasha rows
- Current Antardasha: pulsing dot indicator + highlighted row
- Collapse all others on expand

#### [NEW] `src/components/YogaList.jsx` + `YogaList.css`
Added below Dasha tree in `DashaTab`:
- Section: **✨ Active Benefic Yogas** | **⚠️ Active Doshas**
- Each Yoga: expandable card with name, type badge, planet chips, description
- Only `is_present: true` Yogas shown (collapsed by default)

#### [MODIFY] `src/components/tabs/PlanetsTab.jsx`
**SAV Grid:**
- 12-house table with SAV score per house
- Color coded: ≥28 = green (strong) · 25–27 = amber (neutral) · <25 = red (weak)

**Lazy BAV Button:**
```
[ Load Full Ashtakvarga (7-Planet BAV) ▾ ]
```
- On click: call `POST /api/v1/ashtakvarga` with current birth details
- Show loading spinner while computing
- On success: expand to show 7 individual planet BAV grids in a scrollable section
- Button re-labels to `[ Hide Full Ashtakvarga ▲ ]`

#### [NEW] `src/components/AshtakvargaGrid.jsx` + `AshtakvargaGrid.css`
SAV summary row + optional BAV grid per planet (shown only after lazy load).

#### [MODIFY] `src/components/tabs/DoshasTab.jsx`
- Add **Kaal Sarp Dosha** card: axis description (e.g., Rahu in Gemini → Ketu in Sagittarius), Anuloma/Viloma type, trapped planets list
- Add **Pitra Dosha** indicator card: trigger condition description

---

### Phase 4 Verification
- [ ] Antardasha list visible on expanding a Mahadasha row
- [ ] Current Antardasha highlighted and date-accurate (validate with reference chart)
- [ ] Gaja Kesari detected correctly when Jupiter is in Kendra from Moon
- [ ] Kaal Sarp detected when all planets fall between Rahu–Ketu axis
- [ ] SAV scores sum to ≈337 across 12 houses
- [ ] `[Load Full Ashtakvarga]` button fires second API call and renders 7 BAV grids
- [ ] First Kundali load time not increased (BAV not computed on initial request)

---

## Phase 5 — Current Transits, PDF Export & JSON Backup

### Goal
Add Gochara (transit) overlay, print export, and local JSON profile backup/restore.

---

### Backend Changes

#### [NEW] `app/transit_engine.py`
`TransitEngine.get_current_transits(natal_technical_profile) -> Dict`

- Compute today's sidereal planetary positions (00:00 UTC)
- Compare Saturn, Jupiter, Rahu/Ketu, Mars against natal Moon sign and natal Lagna
- **Sade Sati:** Saturn in 12th/1st/2nd from natal Moon → phase `Rising`/`Peak`/`Setting`
- **Jupiter transit:** house from natal Moon and Lagna, flag as favorable if 2/5/7/9/11
- **Rahu/Ketu:** transit house from natal Moon
- Returns: `{ sade_sati: { active, phase, description }, jupiter: { house_from_moon, house_from_lagna, is_favorable }, transits: [{ planet, current_sign, house_from_moon, house_from_lagna }] }`

#### [MODIFY] [`kundali_analyzer.py`](file:///c:/Users/sheva/antigravity/Kundali/kundali_backend/app/kundali_analyzer.py)
- Add `"transits": TransitEngine.get_current_transits(technical_profile)` to report

#### [MODIFY] [`main.py`](file:///c:/Users/sheva/antigravity/Kundali/kundali_backend/app/main.py)
- **Add:** `GET /api/v1/profiles/export` → returns all profiles as JSON array
- **Add:** `POST /api/v1/profiles/import` → accepts JSON array, bulk-inserts, skips duplicates (match by name + DOB)

---

### Frontend Changes

#### [MODIFY] `src/components/tabs/DashaTab.jsx`
Add `<TransitCard>` below `<YogaList>`:

**Sade Sati card:**
- Badge: `🪐 Sade Sati — Peak Phase` (red) / `Rising Phase` (amber) / `Setting Phase` (yellow) / `✅ Not in Sade Sati` (green)
- Description text with Saturn's current position

**Jupiter Transit card:**
- `♃ Jupiter in 5th from Moon (Favorable)` green / unfavorable red
- House from Lagna also shown

**All Transits table:**
- Planet · Current Sign · House from Moon · House from Lagna

#### [NEW] `src/components/ExportButton.jsx`
`[↓ Download PDF]` button in report header using `window.print()`:
- Print CSS (`@media print`) hides navbar, tabs, all buttons
- Prints all 5 tab sections sequentially in a clean A4 layout
- *jsPDF upgrade can be revisited after first-pass review*

#### [NEW] `src/pages/BackupPage.jsx` + route `/backup`
- `[📦 Export Profiles (.json)]` → `GET /api/v1/profiles/export` → browser file download
- `[📂 Import Profiles]` → file picker → reads JSON → `POST /api/v1/profiles/import`
- Import result summary: `X profiles imported · Y duplicates skipped`

#### [MODIFY] [`Navbar.jsx`](file:///c:/Users/sheva/antigravity/Kundali/kundali_frontend/src/components/Navbar.jsx)
Add `Backup` nav link.

#### [MODIFY] `App.jsx`
Add `/backup` route.

---

### Phase 5 Verification
- [ ] Sade Sati correctly active for natal Moon sign where Saturn currently transits ±1 sign
- [ ] Jupiter transit house displayed and favorable flag correct
- [ ] `[↓ Download PDF]` triggers print dialog with clean A4 layout (no nav/buttons)
- [ ] `GET /api/v1/profiles/export` returns valid JSON array
- [ ] Import from exported JSON restores all profiles without errors
- [ ] Duplicate import skips correctly without creating duplicate rows

---

## Global Verification Commands

```bash
# Backend tests
cd kundali_backend
python -m pytest tests/ -v --tb=short

# Frontend build check
cd kundali_frontend
npm run build

# Dev run
cd kundali_backend && uvicorn app.main:app --reload
cd kundali_frontend && npm run dev
```

### Reference Test Chart
All verification uses: **Suyash Dilip Shevade · 30-03-2000 · 22:10 · Pune, Maharashtra, India (Lat: 18.5204, Lon: 73.8567, IST)**

---

## File Change Index

| File | Phase | Change Type |
|---|---|---|
| `app/models.py` | 1 | MODIFY |
| `app/database.py` | 1 | MODIFY (fresh schema) |
| `app/main.py` | 1, 4, 5 | MODIFY + new endpoints |
| `app/kundali_analyzer.py` | 3, 4, 5 | MODIFY |
| `app/dasha.py` | 4 | MODIFY |
| `app/yoga_engine.py` | 4 | NEW |
| `app/ashtakvarga_engine.py` | 4 | NEW |
| `app/transit_engine.py` | 5 | NEW |
| `src/api/kundaliApi.js` | 1 | MODIFY |
| `src/components/GenderToggle.jsx/.css` | 1 | NEW |
| `src/components/PartnerSlot.jsx/.css` | 1 | NEW |
| `src/components/BirthDetailsForm.jsx` | 1 | MODIFY |
| `src/pages/MatchPage.jsx` | 1, 2 | MODIFY |
| `src/pages/KundaliPage.jsx` | 2 | MODIFY |
| `src/components/KundaliReport.jsx` | 3 | MODIFY |
| `src/components/ManglikBadge.jsx` | 3 | MODIFY |
| `src/components/PlanetTable.jsx` | 3 | MODIFY |
| `src/components/PlanetChip.jsx/.css` | 3 | NEW |
| `src/components/DignityChip.jsx` | 3 | NEW |
| `src/components/ReportTabs.jsx/.css` | 3 | NEW |
| `src/components/tabs/OverviewTab.jsx` | 3 | NEW |
| `src/components/tabs/PlanetsTab.jsx` | 3, 4 | NEW + MODIFY |
| `src/components/tabs/DashaTab.jsx` | 3, 4, 5 | NEW + MODIFY |
| `src/components/tabs/DoshasTab.jsx` | 3, 4 | NEW + MODIFY |
| `src/components/tabs/HealthTab.jsx` | 3 | NEW |
| `src/pages/ProfilesPage.jsx` | 2 | MODIFY |
| `src/pages/ProfilesPage.css` | 2 | MODIFY |
| `src/components/ProfileCard.jsx/.css` | 2 | NEW |
| `src/components/TagBadge.jsx` | 2 | NEW |
| `src/components/DashaTree.jsx/.css` | 4 | NEW |
| `src/components/YogaList.jsx/.css` | 4 | NEW |
| `src/components/AshtakvargaGrid.jsx/.css` | 4 | NEW |
| `src/components/ExportButton.jsx` | 5 | NEW |
| `src/pages/BackupPage.jsx` | 5 | NEW |
| `src/components/Navbar.jsx` | 5 | MODIFY |
| `src/App.jsx` | 5 | MODIFY |
