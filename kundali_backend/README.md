# Kundali & Kundali Milan API

Vedic astrology backend: individual Kundali generation + Ashtakoot Guna
Milan (36-point) marriage matching. Python/FastAPI, Swiss Ephemeris,
Docker image ready for AWS Lambda. See **PLAN.md** for the full
phase-by-phase architecture and deployment guide.

## Quick start (local)

```bash
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs for interactive Swagger UI.

## Run tests

```bash
pytest tests/ -v
```

## Example: individual Kundali

```bash
curl -X POST http://localhost:8000/api/v1/kundali \
  -H "Content-Type: application/json" \
  -d '{
    "person": {
      "name": "Sunita", "year": 1982, "month": 7, "day": 20,
      "hour": 5, "minute": 5, "lat": 17.0, "lon": 74.0,
      "timezone_str": "Asia/Kolkata"
    },
    "include_ai_reading": false
  }'
```

## Example: matchmaking

```bash
curl -X POST http://localhost:8000/api/v1/match \
  -H "Content-Type: application/json" \
  -d '{
    "boy": {"name":"Saurabh","year":1997,"month":8,"day":15,"hour":4,"minute":17,"lat":18.5204,"lon":73.8567},
    "girl": {"name":"Apurva","year":2000,"month":8,"day":29,"hour":4,"minute":0,"lat":16.9125,"lon":74.1358},
    "include_ai_reading": false
  }'
```

## Enable AI readings (optional)

```bash
export GEMINI_API_KEY="your-key"
```
Then pass `"include_ai_reading": true` in either request. If the key is
missing or the call fails, `ai_reading` is simply `null` — the numeric
report is unaffected.

## Docker (Lambda image)

```bash
docker build -t kundali-api .
docker run -p 9000:8080 kundali-api
```
See **PLAN.md → Phase 9** for the full ECR/Lambda deployment steps.
