# Kundali Milan — Frontend Plan (React + Vite)

Stack: **React 19 (Vite) · react-router-dom · plain CSS with design tokens · fetch API**

Talks to the FastAPI backend from Iteration 1 (`/api/v1/kundali`, `/api/v1/match`).
No UI framework/Tailwind — a hand-built design system ("Night Chart" theme) so the
astrology domain drives the visuals rather than generic component defaults.

---

## Design plan (token system)

**Subject:** a Vedic astrology reading & matchmaking tool. Audience: people
requesting or reviewing a Kundali/match report (often on a phone, often
mid-conversation with family). Page's job: make dense astrological data
(27 nakshatras, 9 grahas, 8 kootas) fast to scan and trustworthy-looking,
without reading as either a mystical poster or a bare JSON dump.

- **Color** — `#0E1024` (night-sky background), `#171A38` (panel), `#E8B34C`
  (marigold gold — the traditional color of Indian ceremonial/astrological
  motifs, used as the primary accent), `#C4574A` (vermilion — warnings/doshas),
  `#5FA88A` (jade — favorable/auspicious), `#F2EFE9` (text).
- **Type** — `Fraunces` (display, high-contrast old-style serif — used
  restrainedly for headings) + `Sora` (body) + `IBM Plex Mono` (data: degrees,
  scores, coordinates — anything numeric/technical reads in mono to visually
  separate *measurement* from *narrative*).
- **Layout** — content-first single column pages per task (Home / Kundali /
  Match), panels with hairline gold borders on the dark background evoking
  an astronomical chart/instrument, not a generic SaaS dashboard.
- **Signature element** — the chart itself. Rather than a decorative hero
  graphic, the actual South-Indian-style fixed-sign 4×4 chart grid
  (`ChartGrid.jsx`) *is* the hero visual on the landing page (with sample
  data) and the real functional chart renderer on the report pages. The
  numbered "how it works" steps are used because the flow genuinely is a
  3-step sequence (enter details → compute → read result), not decoration.

---

## Pages

| Route | Component | Purpose |
|---|---|---|
| `/` | `pages/HomePage.jsx` | Landing hero + signature chart + 3-step explainer + CTAs to the two tools |
| `/kundali` | `pages/KundaliPage.jsx` | Individual Kundali: birth-details form → calls `POST /api/v1/kundali` → renders `KundaliReport` |
| `/match` | `pages/MatchPage.jsx` | Compatibility: boy+girl forms → calls `POST /api/v1/match` → renders `GunaMilanScorecard` + optional individual charts |

Each form page is a **single-route state machine** (`form → loading → result
| error`) rather than separate result routes — keeps the birth-details input
next to its own result without a page reload, and "← Edit details" just
flips the state back to `form` without re-fetching.

---

## Component inventory

| Component | Responsibility |
|---|---|
| `Navbar.jsx` | Top nav: Home / Individual Kundali / Match Compatibility |
| `BirthDetailsForm.jsx` | Controlled form for one person's birth data; field names mirror the backend `BirthDetails` schema exactly (see mapping table). Exports `toApiPayload()` (string→number coercion) and `isPersonComplete()` (submit-button gating) |
| `ChartGrid.jsx` | **Signature element.** Fixed-sign (South Indian style) 4×4 grid chart. Sign→cell position is a hardcoded table; planets are placed by `sign_index`, which is valid because the backend uses whole-sign houses (a house's `occupants` **are** the planets in that sign) |
| `PlanetTable.jsx` | Full 9-graha data table (sign, degree, nakshatra, pada, house, sign lord, retrograde flag) |
| `ManglikBadge.jsx` | Color-coded Manglik status pill (jade = clear, gold = cancelled, vermilion = active) |
| `KootaBar.jsx` | One row of the Guna Milan scorecard: name, score/max, proportional bar, explanation text |
| `GunaMilanScorecard.jsx` | Score ring (CSS `conic-gradient`, no chart library needed), verdict, dosha flags, combined Manglik sentence, all 8 `KootaBar`s |
| `KundaliReport.jsx` | Composes profile summary + `ManglikBadge` + two `ChartGrid`s (D1, D9) + `PlanetTable`. Used standalone on `/kundali` and twice (compact, charts hidden) on `/match` |
| `StatusStates.jsx` | `LoadingState` (spinner + astrology-flavored copy) and `ErrorState` (backend error message + "Try again") |

---

## JSON → UI field mapping

### Request: `BirthDetailsForm` → `POST /api/v1/kundali` body

| Form field | API field (`BirthDetails`) | Notes |
|---|---|---|
| Full name | `name` | trimmed before send |
| Day / Month / Year inputs | `day`, `month`, `year` | separate number inputs, combined client-side only for display |
| Hour / Minute | `hour`, `minute` | 24-hour, matches backend `ge=0,le=23` / `ge=0,le=59` validation exactly so the browser's own `min`/`max` mirrors the API's Pydantic constraints |
| Latitude / Longitude | `lat`, `lon` | decimal degrees, step 0.0001 |
| Timezone dropdown | `timezone_str` | defaults to `Asia/Kolkata`; free list can be extended, backend validates via `pytz` regardless |
| — | wrapped as `{ "person": {...}, "include_ai_reading": false }` | `KundaliRequest` shape |

`MatchPage` sends the same shape twice under `{ "boy": {...}, "girl": {...} }` (`MatchRequest`).

### Response: `POST /api/v1/kundali` → `KundaliReport.jsx`

| JSON path | UI location |
|---|---|
| `profile.name`, `profile.local`, `profile.lat`, `profile.lon` | Summary block — name as heading, local birth time + coordinates in mono caption |
| `ascendant.sign`, `ascendant.degree_str` | "Ascendant (Lagna)" stat |
| `ascendant.sign_index` | Passed to `ChartGrid` to highlight the Lagna cell with a gold ring |
| `moon_sign` | "Moon sign (Rashi)" stat |
| `moon_nakshatra`, `moon_pada` | "Moon Nakshatra" stat |
| `classification.varna` / `.gana` / `.nadi` | Combined "Varna / Gana / Nadi" stat line |
| `classification.moon_sign_lord` | *(available, not separately displayed on this page — used internally for match scoring)* |
| `manglik_dosha.{is_manglik,is_cancelled,severity,mars_house,mars_sign}` | `ManglikBadge` — tone (jade/gold/vermilion) + label + "Mars in house N · Sign" caption |
| `planets.<Name>.{sign,degree_str,nakshatra,pada,house_from_lagna,sign_lord,retrograde}` | One row per planet in `PlanetTable`, iterated in a fixed Sun→Ketu order (not object key order, which JSON doesn't guarantee) |
| `charts.D1_lagna` (array of 12 `{house, sign_index, sign, occupants[]}`) | Left `ChartGrid`, titled "D1 — Lagna chart" |
| `charts.D9_navamsa` | Right `ChartGrid`, titled "D9 — Navamsha chart" |
| `charts.rashi_moon_chart` | *(returned by the API, not rendered in this iteration — natural next chart tab to add)* |
| `ai_reading` | *(if `include_ai_reading` is ever wired to `true` in the UI — not yet exposed as a toggle; render as a prose panel above the summary when present, `null`-check first)* |

### Response: `POST /api/v1/match` → `MatchPage.jsx`

| JSON path | UI location |
|---|---|
| `guna_milan.total_score` / `.total_max` | Score ring center number + `conic-gradient` fill percentage |
| `guna_milan.verdict` | Verdict heading next to the ring |
| `guna_milan.nadi_dosha`, `.bhakoot_dosha` | Warning pills under the verdict ("Nadi Dosha", "Bhakoot Dosha") or a single "No hard doshas" pill if both false |
| `guna_milan.kootas[]` (8× `{koota, max, score, detail}`) | One `KootaBar` per entry, in array order (already Varna→Nadi from the backend) |
| `manglik_analysis.combined_verdict` | Sentence banner below the score ring |
| `manglik_analysis.boy`, `.girl` | *(duplicated inside `boy.manglik_dosha` / `girl.manglik_dosha` below — not read separately)* |
| `boy` / `girl` (full `KundaliReport` shape each) | Rendered via two `KundaliReport` instances (`compact` — charts hidden, table shown) inside a collapsible "Show individual charts" section, so the primary scorecard isn't buried under two full reports by default |

### Error responses → `StatusStates.jsx` / inline validation

| Backend behavior | Frontend handling |
|---|---|
| `400 {"detail": "Invalid calendar date: ..."}` / `"Unknown timezone: ..."` | `ApiError.message` = the string directly; shown in `ErrorState` |
| `422 {"detail": [{"loc": [...], "msg": "..."}]}` (Pydantic) | `normalizeApiError()` in `kundaliApi.js` flattens to `"field: message · field: message"` |
| Network failure / non-JSON body | Falls back to `"Request failed (status)"` |
| Client-side | Number inputs already carry the same `min`/`max` as the Pydantic schema (hour 0–23, minute 0–59, lat -90..90, lon -180..180) so most 422s are prevented before submit; the submit button is disabled until `isPersonComplete()` passes |

---

## Running it

```bash
cd kundali_frontend
npm install
cp .env.example .env        # set VITE_API_BASE_URL if the backend isn't on localhost:8000
npm run dev                 # http://localhost:5173
```

Production build (already verified in this session — `npm run build` succeeds,
`npm run preview` serves the built bundle correctly):
```bash
npm run build
npm run preview
```

## What's deliberately not built yet (tell me if you want these next)

- No toggle in the UI for `include_ai_reading` (the field exists in the API
  client already — `getKundali(person, true)` — just not wired to a checkbox).
- `rashi_moon_chart` is returned by the backend but not yet given its own
  tab/view (would be a third `ChartGrid` next to D1/D9).
- No save/share/PDF export of a report — everything is session-only, matching
  the backend's own stateless, no-persistence design.
- No mobile hamburger menu — the two nav links currently just wrap; fine at
  two items, worth revisiting if more sections are added later.
