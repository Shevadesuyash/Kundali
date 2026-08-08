# Kundali Milan — Frontend

React (Vite) frontend for the Kundali & Kundali Milan backend. See
**FRONTEND_PLAN.md** for the full design plan, page/component breakdown,
and JSON request/response → UI field mapping.

## Quick start

```bash
npm install
cp .env.example .env      # point VITE_API_BASE_URL at your backend if not localhost:8000
npm run dev                # http://localhost:5173
```

Make sure the backend (`kundali_backend/`, from Iteration 1) is running on
the URL set in `.env` — by default `http://localhost:8000`.

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Pages

- `/` — landing page
- `/kundali` — individual Kundali report
- `/match` — Ashtakoot Guna Milan compatibility check
