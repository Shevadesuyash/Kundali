const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function postJSON(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    const message = normalizeApiError(data) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }
  return data;
}

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

/**
 * The backend returns either {"detail": "string"} (400/500) or
 * {"detail": [{"loc": [...], "msg": "..."}]} (422 Pydantic errors).
 * This flattens both into one readable string for the UI.
 */
function normalizeApiError(data) {
  if (!data || !data.detail) return null;
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((e) => {
        const field = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : 'field';
        return `${field}: ${e.msg}`;
      })
      .join(' · ');
  }
  return null;
}

export function getKundali(person, includeAiReading = false) {
  return postJSON('/api/v1/kundali', { person, include_ai_reading: includeAiReading });
}

export function getMatch(boy, girl, includeAiReading = false) {
  return postJSON('/api/v1/match', { boy, girl, include_ai_reading: includeAiReading });
}

export function checkHealth() {
  return fetch(`${API_BASE}/health`).then((r) => r.ok);
}

// ---------------------------------------------------------------------------
// Geocoding — 3-tier cached via backend
// ---------------------------------------------------------------------------
export function geocodeSearch(query) {
  return fetch(`${API_BASE}/api/v1/geocode?q=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/json' },
  }).then((r) => (r.ok ? r.json() : []));
}

// ---------------------------------------------------------------------------
// Profile API
// ---------------------------------------------------------------------------
export function saveProfile(person, gender, birthPlace) {
  return postJSON('/api/v1/profiles', {
    person,
    gender,
    birth_place: birthPlace || null,
  });
}

export function searchProfiles({ q = '', gender = '', page = 1, perPage = 20 } = {}) {
  const params = new URLSearchParams();
  if (q)      params.set('q',        q);
  if (gender) params.set('gender',   gender);
  params.set('page',     String(page));
  params.set('per_page', String(perPage));
  return fetch(`${API_BASE}/api/v1/profiles?${params}`, {
    headers: { Accept: 'application/json' },
  }).then((r) => r.json());
}

export function getProfile(id) {
  return fetch(`${API_BASE}/api/v1/profiles/${id}`, {
    headers: { Accept: 'application/json' },
  }).then((r) => r.json());
}

export function matchSaved(boyId, girlId, includeAiReading = false) {
  return postJSON('/api/v1/match-saved', {
    boy_id: boyId,
    girl_id: girlId,
    include_ai_reading: includeAiReading,
  });
}
