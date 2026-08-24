# Kundali App — Complete Handoff & Roadmap

> **Written:** 2026-08-24  
> **Purpose:** Full context document so any developer or AI can continue this project  
> **Conversation ID:** `bb79b74f-2de2-4a74-b1e3-645fe2bfffd6`  
> **Git branch:** `main`

---

## 1. Project Overview

A **Vedic Astrology Kundali web application** built with:
- **Backend:** Python + FastAPI + `pyswisseph` (Swiss Ephemeris) — port `8000`
- **Frontend:** React + Vite — port `5173`
- **Database:** SQLite via `sqlite3` stdlib — file `profiles.db` in `kundali_backend/`

The app generates Vedic birth charts (Kundali), performs Guna Milan matchmaking, stores user birth profiles, and displays astrological analysis across 5 tabs.

---

## 2. Repository Structure

```
Kundali/
├── kundali_backend/
│   ├── app/
│   │   ├── main.py              — FastAPI routes (16 endpoints)
│   │   ├── database.py          — SQLite layer: profiles + geocode cache
│   │   ├── models.py            — Pydantic schemas
│   │   ├── astro_engine.py      — Swiss Ephemeris wrapper
│   │   ├── kundali_analyzer.py  — Report builder (build_report)
│   │   ├── chart_engine.py      — D1/D9 house chart builder
│   │   ├── dasha.py             — Vimshottari Dasha calculator
│   │   ├── matchmaker.py        — Guna Milan + Papa Samyam
│   │   └── kundali_analyzer.py  — main analysis orchestrator
│   ├── profiles.db              — SQLite database (persists across restarts)
│   └── requirements.txt
├── kundali_frontend/
│   ├── src/
│   │   ├── api/kundaliApi.js    — All API calls
│   │   ├── pages/
│   │   │   ├── KundaliPage.jsx  — Birth form + Kundali report
│   │   │   ├── MatchPage.jsx    — Dual PartnerSlot matchmaking
│   │   │   └── ProfilesPage.jsx — Dashboard hub
│   │   └── components/
│   │       ├── BirthDetailsForm.jsx
│   │       ├── GenderToggle.jsx
│   │       ├── KundaliReport.jsx    — 5-tab report container
│   │       ├── tabs/
│   │       │   ├── OverviewTab.jsx
│   │       │   ├── PlanetsTab.jsx
│   │       │   ├── DashaTab.jsx
│   │       │   ├── DoshasTab.jsx
│   │       │   └── HealthTab.jsx
│   │       ├── ProfileCard.jsx
│   │       ├── TagBadge.jsx
│   │       ├── SaveProfileButton.jsx
│   │       └── PartnerSlot.jsx
│   ├── package.json
│   └── vite.config.js
└── docs/
    ├── BUGFIXES_AND_NOTES.md    — Bug history and astrological notes
    └── HANDOFF_AND_ROADMAP.md   — This file
```

---

## 3. How to Run

```powershell
# Terminal 1 — Backend
cd c:\Users\sheva\antigravity\Kundali\kundali_backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd c:\Users\sheva\antigravity\Kundali\kundali_frontend
npm run dev
```

Open: http://localhost:5173

---

## 4. Git History (Phases Completed)

```
3773ee0  CRITICAL FIX: profiles no longer wiped on server restart
a740f38  Phase 2: Profile Dashboard Hub (ProfilesPage full rewrite)
1288a2a  Phase 2 prep: ProfileCard, TagBadge components
0695ed3  Bug fixes: gender state retention, report badge, SaveProfileButton sync
fffe9bd  Phase 3: 5-tab Kundali report layout
7cf6e52  Phase 1: Gender toggle, profile auto-fill, PartnerSlot match redesign
```

---

## 5. Phases Complete / Pending

| Phase | Status | Summary |
|---|---|---|
| **Phase 1** | ✅ Done | Gender toggle, profile typeahead auto-fill, PartnerSlot match redesign, fresh DB schema |
| **Phase 3** | ✅ Done | 5-tab Kundali report (Overview/Planets/Dasha/Doshas/Health), ReportTabs component |
| **Phase 2** | ✅ Done | Profile Dashboard Hub: stats bar, gender+tag filters, ProfileCard grid, match tray |
| **Bug Fixes** | ✅ Done | Gender state stale closure, report gender badge, SaveProfileButton sync, DB wipe on restart |
| **Phase 4** | 🔲 NEXT | Antardasha tree, Yoga detection, Ashtakvarga (lazy BAV) |
| **Phase 5** | 🔲 Pending | Current transits (Sade Sati), PDF export, JSON backup/restore |

---

## 6. Completed Work Details

### Phase 1 — Done
**Backend:** `models.py`, `database.py`, `main.py` rewritten  
**Frontend:** `GenderToggle`, `BirthDetailsForm` (typeahead, auto-fill), `PartnerSlot`, `MatchPage`, `KundaliPage`, `SaveProfileButton`, `KundaliReport` (birth place header)  
**Key APIs added:** `GET /api/v1/profiles/search` (typeahead), `PATCH /profiles/:id`, `DELETE /profiles/:id`

### Phase 3 — Done
**Frontend:** `ReportTabs.jsx/css`, `tabs/OverviewTab`, `tabs/PlanetsTab`, `tabs/DashaTab`, `tabs/DoshasTab`, `tabs/HealthTab`, `tabs/tabs.css`  
**KundaliReport.jsx** fully refactored to 5-tab layout  
**DoshasTab** includes Papa Samyam breakdown table and Kaal Sarp auto-detection

### Phase 2 — Done
**Frontend:** `ProfileCard.jsx/css`, `TagBadge.jsx/css`, full `ProfilesPage.jsx` + `ProfilesPage.css` rewrite  
**Features:** Stats bar (total/male/female counts), gender tabs, tag filter chips (Self/Family/Friend/Partner/Client), integrated Match Tray with "Open in Match ↗" button, inline delete with 2-click confirm

### Bug Fixes Applied
1. **DB wipe on restart** — `database.py` `init_db()` had `DROP TABLE` on every startup → changed to `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE` migrations
2. **Gender state lost on name type** — stale `useCallback([], [])` closure in `BirthDetailsForm` → changed to plain functions
3. **Gender not shown in Kundali report** — added `data.gender` to report object in `KundaliPage`, added gender badge to `KundaliReport` header
4. **Save Profile re-asked gender** — `SaveProfileButton` now syncs via `useEffect` on `propGender`
5. **Profile update failed** — `main.py` `patch_profile` now filters empty strings; `BirthDetailsForm` falls back to saved gender on update
6. **Manglik Dosha** — Changed `MANGLIK_MODE` from `SOUTH` (6 houses: 1,2,4,7,8,12) to `STANDARD` (5 houses: 1,4,7,8,12 per Parashara)

---

## 7. Database Schema (Current)

```sql
CREATE TABLE profiles (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    gender       TEXT    NOT NULL DEFAULT 'male',   -- 'male' | 'female' only
    year         INTEGER NOT NULL,
    month        INTEGER NOT NULL,
    day          INTEGER NOT NULL,
    hour         INTEGER NOT NULL,
    minute       INTEGER NOT NULL,
    lat          REAL    NOT NULL,
    lon          REAL    NOT NULL,
    timezone_str TEXT    NOT NULL,
    birth_place  TEXT,                              -- human-readable place label
    moon_sign    TEXT,                              -- computed on save
    nakshatra    TEXT,                              -- computed on save
    lagna        TEXT,                              -- computed on save
    is_manglik   INTEGER NOT NULL DEFAULT 0,        -- computed on save
    active_dasha TEXT,                              -- computed on save
    tag          TEXT    NOT NULL DEFAULT 'self',   -- 'self'|'family'|'friend'|'partner'|'client'
    created_at   TEXT    NOT NULL
);
```

**Kundali is NOT stored** — it is always recomputed on demand by calling the API.

---

## 8. Key API Endpoints

```
POST /api/v1/kundali                         — Generate Kundali from birth details
POST /api/v1/match                           — Match two people from raw birth details
POST /api/v1/match-saved                     — Guna Milan for two saved profile IDs

GET  /api/v1/profiles                        — List profiles (q, gender, tag, page, per_page)
POST /api/v1/profiles                        — Save a new profile
GET  /api/v1/profiles/search?q=&limit=       — Typeahead search (minimal fields)
GET  /api/v1/profiles/{id}                   — Get single profile
PATCH /api/v1/profiles/{id}                  — Partial update (recomputes astro if birth fields change)
DELETE /api/v1/profiles/{id}                 — Hard delete

GET  /api/v1/geocode?q=                      — Place search (cached: seeded → DB → Nominatim)
GET  /health                                 — Health check
```

---

## 9. Phase 4 — Next to Implement

### 9.1 Summary
Add **Antardasha sub-periods**, **automated Yoga detection** (12 classical Yogas), and **Ashtakvarga scoring** (BAV on-demand only).

### 9.2 Backend — Step by Step

#### Step 1: Extend Dasha with Antardashas — `kundali_backend/app/dasha.py`

Find `VimshottariCalculator.calculate_dasha_periods()`. Currently returns:
```python
[{ "planet", "start_date", "end_date", "total_years", "is_current" }]
```

Add `"antardashas"` key to each period:
```python
# Antardasha formula:
# antardasha_years = (mahadasha_planet_years × sub_planet_years) / 120
# DASHA_YEARS = {'Sun':6,'Moon':10,'Mars':7,'Rahu':18,'Jupiter':16,'Saturn':19,'Mercury':17,'Ketu':7,'Venus':20}
# Sub-periods cycle in the same order starting from the Mahadasha lord

def _calculate_antardashas(self, mahadasha_planet, maha_start, maha_end):
    """Calculate 9 Antardasha sub-periods within a Mahadasha."""
    maha_years = DASHA_YEARS[mahadasha_planet]
    total_days = (maha_end - maha_start).days
    
    # Start sub-period cycle from the mahadasha lord
    lords = list(DASHA_YEARS.keys())
    start_idx = lords.index(mahadasha_planet)
    order = lords[start_idx:] + lords[:start_idx]
    
    antardashas = []
    current = maha_start
    for sub_planet in order:
        sub_years = DASHA_YEARS[sub_planet]
        sub_days = (maha_years * sub_years / 120) * 365.25
        sub_end = current + timedelta(days=sub_days)
        if sub_end > maha_end:
            sub_end = maha_end
        now = datetime.now()
        antardashas.append({
            "planet": sub_planet,
            "start_date": current.strftime("%Y-%m-%d"),
            "end_date": sub_end.strftime("%Y-%m-%d"),
            "total_years": round(sub_years * maha_years / 120, 4),
            "is_current": current <= now < sub_end,
        })
        current = sub_end
    return antardashas
```

Then in `calculate_dasha_periods()`, add `"antardashas": self._calculate_antardashas(...)` to each period dict.

#### Step 2: Yoga Engine — NEW `kundali_backend/app/yoga_engine.py`

Create new file. Implement `detect_yogas(technical_profile) -> list[dict]`.

The `technical_profile` dict (from `VedicAstrologyEngine.get_technical_profile()`) contains:
- `technical_profile["planets"]` — dict keyed by planet name: `{ sign_index, house_from_lagna, longitude, ... }`
- `technical_profile["lagna_sign_index"]` — int 0-11
- `technical_profile["moon_sign_index"]` — int 0-11

```python
KENDRA_HOUSES = {1, 4, 7, 10}

EXALTATION = {
    'Sun': 0,      # Aries
    'Moon': 1,     # Taurus
    'Mars': 9,     # Capricorn
    'Mercury': 5,  # Virgo
    'Jupiter': 3,  # Cancer
    'Venus': 11,   # Pisces
    'Saturn': 6,   # Libra
}
OWN_SIGNS = {
    'Sun': {4},
    'Moon': {3},
    'Mars': {0, 7},
    'Mercury': {2, 5},
    'Jupiter': {8, 11},
    'Venus': {1, 6},
    'Saturn': {9, 10},
}

def is_in_kendra_from_moon(planet_sign, moon_sign):
    diff = (planet_sign - moon_sign) % 12
    return (diff + 1) in KENDRA_HOUSES  # houses are 1-based

def is_in_kendra_from_lagna(planet_house):
    return planet_house in KENDRA_HOUSES

def is_exalted_or_own(planet, sign_index):
    return sign_index == EXALTATION.get(planet) or sign_index in OWN_SIGNS.get(planet, set())

YOGAS = [
    {
        "name": "Gaja Kesari",
        "type": "benefic",
        "description": "Jupiter in a Kendra (1/4/7/10) from Moon — brings wisdom, wealth, and fame.",
        "check": lambda p, lagna, moon: is_in_kendra_from_moon(p['Jupiter']['sign_index'], moon)
    },
    {
        "name": "Budhaditya",
        "type": "benefic",
        "description": "Sun and Mercury conjunct — sharp intellect, communication skills.",
        "check": lambda p, lagna, moon: p['Sun']['house_from_lagna'] == p['Mercury']['house_from_lagna']
    },
    {
        "name": "Hamsa",
        "type": "benefic",
        "description": "Jupiter exalted or in own sign in a Kendra — moral authority and spiritual power.",
        "check": lambda p, lagna, moon: is_exalted_or_own('Jupiter', p['Jupiter']['sign_index']) and is_in_kendra_from_lagna(p['Jupiter']['house_from_lagna'])
    },
    {
        "name": "Malavya",
        "type": "benefic",
        "description": "Venus exalted or in own sign in a Kendra — beauty, luxury, and charisma.",
        "check": lambda p, lagna, moon: is_exalted_or_own('Venus', p['Venus']['sign_index']) and is_in_kendra_from_lagna(p['Venus']['house_from_lagna'])
    },
    {
        "name": "Ruchaka",
        "type": "benefic",
        "description": "Mars exalted or in own sign in a Kendra — courage, military leadership.",
        "check": lambda p, lagna, moon: is_exalted_or_own('Mars', p['Mars']['sign_index']) and is_in_kendra_from_lagna(p['Mars']['house_from_lagna'])
    },
    {
        "name": "Bhadra",
        "type": "benefic",
        "description": "Mercury exalted or in own sign in a Kendra — intelligence, eloquence.",
        "check": lambda p, lagna, moon: is_exalted_or_own('Mercury', p['Mercury']['sign_index']) and is_in_kendra_from_lagna(p['Mercury']['house_from_lagna'])
    },
    {
        "name": "Shasha",
        "type": "benefic",
        "description": "Saturn exalted or in own sign in a Kendra — discipline, longevity, authority.",
        "check": lambda p, lagna, moon: is_exalted_or_own('Saturn', p['Saturn']['sign_index']) and is_in_kendra_from_lagna(p['Saturn']['house_from_lagna'])
    },
    {
        "name": "Kemadruma",
        "type": "malefic",
        "description": "No planets in 2nd or 12th from Moon — isolation, struggle despite efforts.",
        "check": lambda p, lagna, moon: not any(
            (p[pl]['sign_index'] - moon) % 12 in {1, 11}
            for pl in ['Sun','Mars','Mercury','Jupiter','Venus','Saturn']
        )
    },
    {
        "name": "Kaal Sarp",
        "type": "malefic",
        "description": "All planets trapped between Rahu and Ketu — karmic intensity, obstacles then breakthroughs.",
        "check": lambda p, lagna, moon: _check_kaal_sarp(p)
    },
]

def _check_kaal_sarp(planets):
    CLASSICAL = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']
    rahu_lon = planets['Rahu']['longitude']
    ketu_lon = planets['Ketu']['longitude']
    def in_arc(lon, f, t):
        n = (lon - f) % 360
        a = (t - f) % 360
        return 0 < n < a
    all_fwd = all(in_arc(planets[p]['longitude'], rahu_lon, ketu_lon) for p in CLASSICAL)
    all_bwd = all(in_arc(planets[p]['longitude'], ketu_lon, rahu_lon) for p in CLASSICAL)
    return all_fwd or all_bwd

def detect_yogas(technical_profile):
    planets = technical_profile.get('planets', {})
    lagna = technical_profile.get('lagna_sign_index', 0)
    moon = planets.get('Moon', {}).get('sign_index', 0)
    results = []
    for yoga in YOGAS:
        try:
            is_present = yoga['check'](planets, lagna, moon)
        except Exception:
            is_present = False
        results.append({
            "name": yoga["name"],
            "type": yoga["type"],
            "description": yoga["description"],
            "is_present": is_present,
        })
    return results
```

#### Step 3: Add `yogas` to report — `kundali_backend/app/kundali_analyzer.py`

In `build_report()`, after building `_technical_profile`:
```python
from .yoga_engine import detect_yogas
# ...
report["yogas"] = detect_yogas(_technical_profile)
```

#### Step 4: Ashtakvarga Engine — NEW `kundali_backend/app/ashtakvarga_engine.py`

This is the most complex piece. SAV (Sarvashtakvarga) is the sum of all 7 planet BAVs per house.

The classical Ashtakvarga assigns points (0 or 1) based on a planet's position relative to each other planet and the Ascendant. There are fixed tables per planet — implement as lookup tables.

**Simplified SAV formula** (for implementation):
- For each of the 7 planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn):
  - Each planet contributes 1 point to a house if the target house is in a set of "beneficial" positions from that planet's natal position
  - The beneficial positions vary per planet (classical tables from Brihat Parashara Hora Shastra)
- SAV[house] = sum of all 7 planet BAVs for that house

**Minimum viable implementation** — use the verified Parashara tables:

```python
# Beneficial houses from each reference point (1-indexed, relative to that planet/lagna)
# Source: Brihat Parashara Hora Shastra
BAV_TABLES = {
    'Sun':     {
        'Sun':     {1,2,4,7,8,9,10,11},
        'Moon':    {3,6,10,11},
        'Mars':    {1,2,4,7,8,9,10,11},
        'Mercury': {3,5,6,9,10,11,12},
        'Jupiter': {5,6,9,11},
        'Venus':   {6,7,12},
        'Saturn':  {1,2,4,7,8,9,10,11},
        'Lagna':   {3,4,6,10,11,12},
    },
    # ... (fill in for Moon, Mars, Mercury, Jupiter, Venus, Saturn)
}
```

> **Note:** The full table data is available in any standard Jyotish reference. For the MVP, implement the Sun BAV table as shown above and stub the others to return 4 points per house (neutral) until the full tables are verified.

**On-demand endpoint in `main.py`:**
```python
@app.post("/api/v1/ashtakvarga")
def get_ashtakvarga(request: BirthDetailsRequest):
    person = request.person.to_person()
    tech = _astro_engine.get_technical_profile(person)
    bav = AshtakvargaEngine.calculate_full(tech)
    return bav
```

### 9.3 Frontend — Step by Step

#### Step 5: DashaTree component — NEW `src/components/DashaTree.jsx`

Replace the flat `DashaTable` in `DashaTab.jsx` with an accordion:

```jsx
// DashaTree.jsx
export default function DashaTree({ periods }) {
  const [expanded, setExpanded] = useState(
    periods.findIndex(p => p.is_current)  // auto-expand active
  );
  
  return (
    <div className="dasha-tree">
      {periods.map((p, i) => (
        <div key={i} className={`dasha-row ${p.is_current ? 'is-active' : ''}`}>
          <button onClick={() => setExpanded(i === expanded ? -1 : i)}>
            <span className="dasha-planet">{p.planet}</span>
            <span className="dasha-dates">{formatDate(p.start_date)} → {formatDate(p.end_date)}</span>
            {p.is_current && <ProgressBar elapsed={calcElapsed(p)} />}
            <span className="dasha-chevron">{expanded === i ? '▲' : '▼'}</span>
          </button>
          
          {expanded === i && p.antardashas && (
            <div className="antardasha-list">
              {p.antardashas.map((a, j) => (
                <div key={j} className={`antardasha-row ${a.is_current ? 'is-active' : ''}`}>
                  <span>{a.planet}</span>
                  <span>{formatDate(a.start_date)} → {formatDate(a.end_date)}</span>
                  {a.is_current && <span className="pulse-dot" />}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

Update `tabs/DashaTab.jsx` to import and use `DashaTree` instead of `DashaTable`.

#### Step 6: YogaList component — NEW `src/components/YogaList.jsx`

Add below DashaTree in DashaTab:
```jsx
export default function YogaList({ yogas }) {
  const benefic = yogas.filter(y => y.is_present && y.type === 'benefic');
  const malefic = yogas.filter(y => y.is_present && y.type === 'malefic');
  
  if (!benefic.length && !malefic.length) return null;
  
  return (
    <div className="yoga-list">
      {benefic.length > 0 && (
        <>
          <p className="yoga-list__title">✨ Active Benefic Yogas</p>
          {benefic.map(y => <YogaCard key={y.name} yoga={y} />)}
        </>
      )}
      {malefic.length > 0 && (
        <>
          <p className="yoga-list__title">⚠️ Active Doshas & Malefic Yogas</p>
          {malefic.map(y => <YogaCard key={y.name} yoga={y} />)}
        </>
      )}
    </div>
  );
}
```

#### Step 7: SAV Grid + Lazy BAV Button in `PlanetsTab.jsx`

After the PlanetTable, add:
```jsx
// SAV summary (always shown — from main kundali response)
<div className="sav-grid">
  {Array.from({length: 12}, (_, i) => (
    <div key={i} className={`sav-cell ${savColorClass(sav[i])}`}>
      <span>H{i+1}</span>
      <strong>{sav[i]}</strong>
    </div>
  ))}
</div>

// Lazy BAV load button
<button onClick={handleLoadBAV}>
  {bavLoaded ? '▲ Hide Full Ashtakvarga' : '▾ Load Full Ashtakvarga (7-Planet BAV)'}
</button>
{bavLoaded && <BAVGrids bav={bavData} />}
```

---

## 10. Phase 5 — Future Plan

### 10.1 Current Transits (Sade Sati, Jupiter)
**Backend:** New `transit_engine.py` using pyswisseph to compute today's planetary positions.

```python
def get_current_transits(natal_tech_profile) -> dict:
    today = datetime.now(timezone.utc)
    # Get current positions
    current_positions = compute_current_positions(today)
    
    natal_moon_sign = natal_tech_profile['moon_sign_index']
    
    # Sade Sati: Saturn in 12th, 1st, or 2nd from natal Moon
    saturn_sign = current_positions['Saturn']['sign_index']
    sati_offset = (saturn_sign - natal_moon_sign) % 12
    sade_sati = {
        'active': sati_offset in {11, 0, 1},
        'phase': {11: 'Rising', 0: 'Peak', 1: 'Setting'}.get(sati_offset),
    }
    
    return {'sade_sati': sade_sati, 'transits': current_positions}
```

**Frontend:** Add `TransitCard` component in `DashaTab.jsx` below YogaList.

### 10.2 PDF Export
Add `ExportButton.jsx` using `window.print()`. Add print CSS (`@media print`) that hides nav, tabs, buttons and renders all sections sequentially.

### 10.3 Backup/Restore
- `GET /api/v1/profiles/export` → returns JSON array of all profiles
- `POST /api/v1/profiles/import` → bulk insert, skip duplicates by name+DOB
- New page `BackupPage.jsx` at route `/backup`
- Add `Backup` link to `Navbar.jsx`

---

## 11. Astrological Rules Reference

### Mangal Dosha (Standard Parashara)
- Manglik houses from Lagna/Moon/Venus: **1, 4, 7, 8, 12** (NOT house 2)
- House 2 is South Indian (Kerala) rule — not used in this app
- MANGLIK_MODE env var: `STANDARD` (default) | `SOUTH`
- Papa Samyam formula: `Total = S_Lagna + (0.75 × S_Moon) + (0.50 × S_Venus)`
- Manglik threshold: Total > 2.5 from any chart = Manglik

### Planet Dignities
| Planet | Exaltation | Own Signs | Debilitation |
|---|---|---|---|
| Sun | Aries (0) | Leo (4) | Libra (6) |
| Moon | Taurus (1) | Cancer (3) | Scorpio (7) |
| Mars | Capricorn (9) | Aries(0), Scorpio(7) | Cancer (3) |
| Mercury | Virgo (5) | Gemini(2), Virgo(5) | Pisces (11) |
| Jupiter | Cancer (3) | Sagittarius(8), Pisces(11) | Capricorn (9) |
| Venus | Pisces (11) | Taurus(1), Libra(6) | Virgo (5) |
| Saturn | Libra (6) | Capricorn(9), Aquarius(10) | Aries (0) |

### Vimshottari Dasha Years
Sun=6, Moon=10, Mars=7, Rahu=18, Jupiter=16, Saturn=19, Mercury=17, Ketu=7, Venus=20  
Total = 120 years. Start from Ketu.

---

## 12. Known Issues / TODOs

1. **Profile tag editing inline** — not yet implemented (planned: click TagBadge → opens inline select)
2. **Antardasha** — backend not yet extended; DashaTab shows flat table still
3. **Ashtakvarga** — not computed; PlanetsTab shows only planet table and charts
4. **Yoga detection** — no `yogas` key in report yet
5. **Transit overlay** — no Sade Sati / Jupiter transit analysis yet
6. **PrintCSS / PDF export** — not done
7. **Backup/Restore page** — not done
8. **`?partner2Id=` in MatchPage** — PartnerSlot 2 (bride) URL param not yet auto-triggering saved mode (partner1Id works)

---

## 13. Quick Command Reference

```powershell
# Start backend
cd kundali_backend
uvicorn app.main:app --reload --port 8000

# Start frontend
cd kundali_frontend
npm run dev

# Build frontend
npm run build

# Backend import test (verify app loads without error)
python -c "from app.main import app; print('App OK')"

# Check DB profile count
python -c "from app.database import search_profiles; r=search_profiles(); print(f'{r[\"total\"]} profiles in DB')"

# Smoke test API
python -c "
import httpx
r = httpx.get('http://localhost:8000/health')
print('Backend:', r.json())
"
```
