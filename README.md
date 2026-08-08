# ✦ Kundali Milan — Vedic Astrology & Matchmaking Suite

A modern, high-precision Vedic Astrology (Jyotish) application built with **FastAPI**, **Swiss Ephemeris (`pyswisseph`)**, **React**, and **Vite**. Features precise sidereal planetary calculations, dual chart rendering (North Indian Diamond & South Indian Grid), Ashtakoot Guna Milan (36 points), health & disease analysis, automatic village-level birthplace geocoding, and complete **English / Marathi (मराठी)** bilingual support.

---

## 🤖 Built with Antigravity AI

This project was created and evolved using **Google Antigravity**, exploring and growing with state-of-the-art AI technology. By combining agentic AI pair-programming with deep domain engineering, this application was built iteratively — from complex astronomical C-bindings (`pyswisseph`) to custom SVG chart rendering, health analysis engines, and full Devanagari / English bilingual localization.

---

## ✨ Features

- **🎯 Astronomical Precision**: Powered by the **Swiss Ephemeris** using the Lahiri Ayanamsha for exact sidereal planetary positions, house cusps, and nakshatra pada calculations.
- **🗺️ Village & City Geocoding**: Search any village, town, or city in India and worldwide to automatically fetch latitude, longitude, and IANA timezone via OpenStreetMap Nominatim API.
- **🎨 Dual Chart Rendering**:
  - **North Indian (Diamond)**: Dynamic SVG diamond layout where House 1 (Lagna) is fixed at the top-middle and sign numbers/grahas rotate counter-clockwise.
  - **South Indian (Grid)**: Fixed 4x4 sign layout with clockwise house progression and Lagna markers.
  - Supports **D1 (Lagna)**, **D9 (Navamsha)**, and **Chandra (Moon)** charts.
- **🌐 Full English & Marathi (मराठी) Bilingual Support**: Instantly toggle between English and Marathi across all UI elements, chart sign names (मेष, वृष...), planet abbreviations (सू, चं, मं...), nakshatras, dignities, and report sections.
- **🌿 Health & Disease Analysis Engine**:
  - Body constitution (Prakriti: Vata, Pitta, Kapha) & Ascendant organ susceptibility.
  - **Fever & Inflammation Assessment**: Risk level derived from Mars house placement, retrograde state, and Sun afflictions.
  - 6th & 8th house planet disease indicators, mental health insights (Moon/Saturn/Rahu dynamics), and Vedic remedies.
- **❤️ Ashtakoot Guna Milan & Manglik Dosha**:
  - Full 36-point compatibility scorecard evaluating all 8 Kootas (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi).
  - Detailed Manglik status assessment for both charts with cancellation rules.
- **🎨 Vedic Parchment Aesthetic**: Rich, warm parchment background, saffron & copper accents, custom HSL typography, and responsive micro-animations.

---

## 🏗️ Architecture & Stack

| Layer | Technology |
|---|---|
| **AI Pair Programming** | Google Antigravity |
| **Backend API** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **Ephemeris Engine** | `pyswisseph` (Swiss Ephemeris C-library wrapper), `pytz` |
| **Frontend Framework**| React 18, Vite, React Router DOM v6 |
| **Styling & UI** | Vanilla CSS with Design System Tokens, Custom SVG Charts |
| **Geocoding** | OpenStreetMap Nominatim API (Free, no API key required) |
| **Testing** | Pytest (Backend API test suite), Postman Collection |

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Python** (v3.10 or higher)
- **Node.js** (v18.0 or higher) & `npm`

---

### 2. Backend Setup (`kundali_backend`)

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd kundali_backend
   ```

2. Create and activate a virtual environment (optional but recommended):
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --port 8000 --reload
   ```

5. Verify backend health:
   Open [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) in your browser. You should see:
   ```json
   { "status": "ok" }
   ```

---

### 3. Frontend Setup (`kundali_frontend`)

1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd kundali_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser:
   👉 **[http://localhost:5173](http://localhost:5173)**

---

## 📡 API Endpoints

### 1. Health Check
- `GET /health`
- **Response**: `{ "status": "ok" }`

### 2. Calculate Individual Kundali
- `POST /api/v1/kundali`
- **Request Body**:
  ```json
  {
    "name": "Sunita",
    "year": 1995,
    "month": 8,
    "day": 15,
    "hour": 14,
    "minute": 30,
    "lat": 18.5204,
    "lon": 73.8567,
    "timezone_str": "Asia/Kolkata"
  }
  ```

### 3. Ashtakoot Guna Milan (Matchmaking)
- `POST /api/v1/match`
- **Request Body**:
  ```json
  {
    "boy": {
      "name": "Rahul",
      "year": 1992, "month": 5, "day": 10,
      "hour": 8, "minute": 15,
      "lat": 19.0760, "lon": 72.8777,
      "timezone_str": "Asia/Kolkata"
    },
    "girl": {
      "name": "Priya",
      "year": 1995, "month": 8, "day": 15,
      "hour": 14, "minute": 30,
      "lat": 18.5204, "lon": 73.8567,
      "timezone_str": "Asia/Kolkata"
    }
  }
  ```

---

## 📁 Repository Structure

```
Kundali/
├── README.md                      # Complete Project Documentation
├── kundali_backend/               # FastAPI Backend Service
│   ├── app/
│   │   ├── main.py                # FastAPI Application & Routes
│   │   ├── schemas.py             # Pydantic Input/Output Schemas
│   │   └── services/              # Swisseph & Ashtakoot Calculation Engines
│   ├── tests/                     # Pytest Unit & Integration Tests
│   ├── requirements.txt           # Python Dependencies
│   └── Kundali_API.postman_collection.json # Postman Test Suite
└── kundali_frontend/              # React + Vite Frontend App
    ├── src/
    │   ├── api/                   # Axios / Fetch API Client
    │   ├── components/            # React Components (Charts, Tables, Health, Search)
    │   ├── context/               # Language Context (EN / Marathi)
    │   ├── pages/                 # Home, Individual Kundali, Match Pages
    │   ├── styles/                # CSS Design Tokens & Themes
    │   └── utils/                 # i18n Dictionary & Astrological Utilities
    ├── package.json
    └── vite.config.js
```

---

## 🧪 Testing

### Backend Unit Tests
```bash
cd kundali_backend
pytest
```

### Postman Collection
Import `kundali_backend/Kundali_API.postman_collection.json` into Postman to test all API endpoints with pre-configured sample payloads.

---

## 📜 Disclaimer
This software calculates sidereal planetary positions using standard astronomical algorithms (Swiss Ephemeris with Lahiri Ayanamsha). Interpretations and health suggestions are based on classical Vedic Jyotish literature and are intended for educational and informational purposes only.
