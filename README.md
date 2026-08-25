# ✦ Kundali Milan — Vedic Astrology, Ashtakvarga & Matchmaking Suite

A modern, high-precision Vedic Astrology (Jyotish) application built with **FastAPI**, **Swiss Ephemeris (`pyswisseph`)**, **React**, and **Vite**. Features precise sidereal planetary calculations, interactive 5-tab Kundali analysis, Antardasha sub-period tree, automated classical Vedic Yoga detection, Ashtakvarga (SAV & on-demand BAV), Ashtakoot Guna Milan (36 points), profile registry hub with SQLite persistence, and complete **English / Marathi (मराठी)** bilingual support.

---

## 🤖 Built with Antigravity AI

This project was engineered and evolved using **Google Antigravity**, exploring and growing with state-of-the-art AI technology. By combining agentic AI pair-programming with deep domain engineering, this application was built iteratively — from complex astronomical C-bindings (`pyswisseph`) to custom SVG chart rendering, classical Vedic algorithms, and a modular tabbed web application.

---

## ✨ Features & Capabilities

### 1. 🪐 5-Tab Deep Kundali Analysis
- **Tab 1: Overview & Charts**: Birth summary, classification cards (Varna, Gana, Nadi, Moon sign lord), interactive chart selector for **D1 Rāśi (Lagna)**, **D9 Navāṁśa**, and **Chandra Rāśi (Moon Chart)** in North Indian Diamond & South Indian Grid layouts.
- **Tab 2: Planets & Strength**: Full planetary positions table with exact degrees, retrograde flags, classical dignities (Exalted, Own, Debilitated, Combust, Neutral), plus the **Sarvashtakvarga (SAV)** 12-house scorecard and **On-Demand Bhinnashtakvarga (BAV)** 7-graha bindu breakdown.
- **Tab 3: Dasha & Predictions**: Interactive **Vimshottari Dasha Tree** displaying all 9 Mahadashas and their 9-fold Antardashas with elapsed progress bars and live active indicators, followed by automated **Classical Vedic Yoga Detection**.
- **Tab 4: Doshas & Remedies**: Standard Parashari **Mangal (Kuja) Dosha** evaluation across Lagna, Moon, and Venus charts with **Papa Samyam** weighted scoring, plus automated detection of **Kaal Sarp Yoga**, **Guru Chandal Yoga**, **Kemadruma Yoga**, and **Pitra Dosha**.
- **Tab 5: Health & Wellness**: Ayurvedic body constitution (**Prakriti: Vata, Pitta, Kapha**), fever & inflammation susceptibility derived from Mars and Sun placements, 6th/8th house health indicators, and psychological wellness markers.

### 2. 🌳 Antardasha Tree & Sub-Period Analysis
- Classical proportional sub-period calculation:
  $$\text{Antardasha Years} = \frac{\text{Mahadasha Total Years} \times \text{Sub-Planet Years}}{120}$$
- Interactive accordion view with active sub-period highlight, percentage elapsed progress bar, and exact start/end calendar dates.

### 3. ✨ Automated Classical Vedic Yoga Engine
- Detects 12 classical benefic yogas and malefic doshas:
  - **Benefic Yogas**: *Gaja Kesari Yoga*, *Budhaditya Yoga*, *Pancha Mahapurusha Yogas (Ruchaka, Bhadra, Hamsa, Malavya, Shasha)*, *Chandra-Mangala Yoga*, *Amala Yoga*, *Kendra-Trikona Raja Yoga*.
  - **Malefic Factors & Doshas**: *Kemadruma Yoga* (with cancellation check), *Kaal Sarp Yoga*, *Guru Chandal Yoga*, *Surya Grahan / Pitra Dosha*.

### 4. 📊 Ashtakvarga Engine (SAV + On-Demand BAV)
- **Sarvashtakvarga (SAV)**: 12-house strength heatmap based on classical BPHS 337/338 benefic points ($\ge 28$ Strong, $25-27$ Average, $< 25$ Low).
- **On-Demand Bhinnashtakvarga (BAV)**: 1-click on-demand expansion of complete $8 \times 12$ bindu contribution matrices for all 7 planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) from all 8 reference points.

### 5. 🗃️ Profile Registry & Dashboard Hub
- **Profile Hub (`/profiles`)**: Live stats bar (Total, ♂ Male, ♀ Female counts), gender tabs, and relationship tag filters (*Self*, *Family*, *Friend*, *Partner*, *Client*).
- **Rich Profile Cards**: Quick glance at Lagna, Rāśi, Nakshatra, Active Mahadasha, and Manglik status.
- **Match Tray**: Pick Groom and Bride directly from profile cards for instant inline Guna Milan comparison or navigation to Matchmaker.
- **Typeahead Auto-Fill**: Name search auto-completes birth details across forms with an override badge system.
- **SQLite Persistence**: Safe schema migrations ensuring saved profiles persist reliably across server restarts.

### 6. ❤️ Ashtakoot Guna Milan (36 Points) & Matchmaking
- Full 36-point compatibility scorecard evaluating all 8 Kootas (*Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi*).
- Dual `PartnerSlot` interface supporting both saved profile selection and manual birth detail input with instant partner swapping (`⇅ Swap`).

### 7. 🌐 Bilingual Support & Localization
- Complete **English & Marathi (मराठी)** bilingual toggle across all UI elements, chart glyphs, planet names, nakshatras, and report interpretations.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **AI Pair Programming** | Google Antigravity |
| **Backend API** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **Ephemeris Engine** | `pyswisseph` (Swiss Ephemeris C-bindings), `pytz` |
| **Astrology Engines** | Custom Dasha, Yoga, Ashtakvarga, Chart, and Papa Samyam engines |
| **Database** | SQLite3 (`profiles.db` with WAL mode and safe ALTER migrations) |
| **Frontend Framework** | React 18, Vite, React Router DOM v6 |
| **Styling & UI** | Vanilla CSS Design System with Tokens, Custom SVG Charts |
| **Geocoding** | 3-tier Geocoding (In-memory L1 cache → SQLite L2 cache → OpenStreetMap Nominatim L3) |

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Python** (v3.10 or higher)
- **Node.js** (v18.0 or higher) & `npm`

---

### 2. Backend Setup (`kundali_backend`)

```bash
cd kundali_backend

# Create and activate virtual environment (optional)
python -m venv venv
# Windows: .\venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --port 8000 --reload
```

Verify backend health at: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### 3. Frontend Setup (`kundali_frontend`)

```bash
cd kundali_frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open the application at: **[http://localhost:5173](http://localhost:5173)**

---

## 📡 API Endpoints Reference

### Core Astrology Endpoints
- `POST /api/v1/kundali` — Generates complete 5-tab Kundali report (planets, dignities, D1/D9 charts, Antardashas, yogas, SAV, health).
- `POST /api/v1/ashtakvarga` — On-demand full Bhinnashtakvarga (7 grahas $\times$ 8 references $\times$ 12 signs) and SAV calculation.
- `POST /api/v1/match` — Ashtakoot Guna Milan (36-point match) + Papa Samyam for two birth detail sets.
- `POST /api/v1/match-saved` — Guna Milan for two saved profile IDs.

### Profile Management Endpoints
- `GET /api/v1/profiles` — List saved profiles with pagination, search query, gender filter, and tag filter.
- `POST /api/v1/profiles` — Save a new birth profile.
- `GET /api/v1/profiles/search?q=&limit=` — Lightweight typeahead search for form auto-completion.
- `GET /api/v1/profiles/{id}` — Get single profile details.
- `PATCH /api/v1/profiles/{id}` — Partial profile update (re-computes astrological summary on birth change).
- `DELETE /api/v1/profiles/{id}` — Delete profile.

### Utility Endpoints
- `GET /api/v1/geocode?q=` — 3-tier cached location search (pre-seeded Indian cities/villages + SQLite cache + live Nominatim).
- `GET /health` — Health check endpoint.

---

## 📁 Repository Structure

```
Kundali/
├── README.md                      # Comprehensive Project Documentation
├── docs/
│   ├── BUGFIXES_AND_NOTES.md      # Bug fix ledger & astrological rules reference
│   └── HANDOFF_AND_ROADMAP.md     # Full development handoff & Phase roadmap
├── kundali_backend/               # FastAPI Backend Service
│   ├── app/
│   │   ├── main.py                # FastAPI Application & REST Endpoints
│   │   ├── models.py              # Pydantic v2 Schemas & Data Models
│   │   ├── database.py            # SQLite Persistence Layer & Migrations
│   │   ├── astro_engine.py        # Swiss Ephemeris Core Wrapper & Technical Profile
│   │   ├── kundali_analyzer.py    # Report Orchestrator
│   │   ├── dasha.py               # Vimshottari Mahadasha & Antardasha Engine
│   │   ├── yoga_engine.py         # Classical Vedic Yoga & Dosha Detector
│   │   ├── ashtakvarga_engine.py  # BPHS Ashtakvarga (SAV & BAV) Engine
│   │   ├── chart_engine.py        # D1, D9, and Chandra Chart Grid Builder
│   │   ├── matchmaker.py          # Ashtakoot Guna Milan & Papa Samyam Engine
│   │   ├── health_analyzer.py     # Ayurvedic Prakriti & Health Engine
│   │   └── geocode_service.py     # 3-Tier Geocoding Service
│   ├── profiles.db                # SQLite Database (Persisted)
│   └── requirements.txt           # Backend Dependencies
└── kundali_frontend/              # React 18 + Vite Frontend App
    ├── src/
    │   ├── api/kundaliApi.js      # REST API Client
    │   ├── pages/
    │   │   ├── KundaliPage.jsx    # Birth Form & Tabbed Report Page
    │   │   ├── MatchPage.jsx      # Dual PartnerSlot Matchmaking Page
    │   │   └── ProfilesPage.jsx   # Profile Registry Dashboard Hub
    │   ├── components/
    │   │   ├── KundaliReport.jsx  # Main 5-Tab Report Container
    │   │   ├── ReportTabs.jsx     # 5-Tab Navigation Component
    │   │   ├── tabs/              # Tab Panels (Overview, Planets, Dasha, Doshas, Health)
    │   │   ├── DashaTree.jsx      # Interactive Mahadasha/Antardasha Tree
    │   │   ├── YogaList.jsx       # Benefic Yogas & Malefic Doshas Cards
    │   │   ├── AshtakvargaGrid.jsx# SAV Heatmap & Lazy BAV Matrix Expander
    │   │   ├── ProfileCard.jsx    # Rich Dashboard Profile Card
    │   │   ├── TagBadge.jsx       # Relationship Tag Pills
    │   │   ├── BirthDetailsForm.jsx# Auto-fill Birth Form with Typeahead
    │   │   └── PartnerSlot.jsx    # Dual-mode Match Partner Card
    │   ├── context/               # Language Context (English / Marathi)
    │   └── styles/                # Design System CSS Tokens
    ├── package.json
    └── vite.config.js
```

---

## 📜 Astrological Disclaimer
This software computes astronomical and sidereal planetary coordinates using high-precision ephemeris algorithms (Swiss Ephemeris with Lahiri Ayanamsha). Interpretations, yogas, doshas, and wellness recommendations are based on classical Vedic Jyotish literature and are intended for educational, cultural, and informational purposes.
