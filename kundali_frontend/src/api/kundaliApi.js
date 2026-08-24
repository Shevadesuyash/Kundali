const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...options.headers },
    ...options,
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

async function postJSON(path, body) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function patchJSON(path, body) {
  return request(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
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

// ---------------------------------------------------------------------------
// Kundali & Match
// ---------------------------------------------------------------------------
export function getKundali(person, includeAiReading = false) {
  return postJSON('/api/v1/kundali', { person, include_ai_reading: includeAiReading });
}

export function getAshtakvarga(person) {
  return postJSON('/api/v1/ashtakvarga', { person });
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

/** Save a new birth profile. */
export function saveProfile(person, gender, birthPlace, tag = 'self') {
  return postJSON('/api/v1/profiles', {
    person,
    gender,
    birth_place: birthPlace || null,
    tag,
  });
}

/** Full paginated profile list with optional filters. */
export function searchProfiles({ q = '', gender = '', tag = '', page = 1, perPage = 20 } = {}) {
  const params = new URLSearchParams();
  if (q)      params.set('q',        q);
  if (gender) params.set('gender',   gender);
  if (tag)    params.set('tag',      tag);
  params.set('page',     String(page));
  params.set('per_page', String(perPage));
  return fetch(`${API_BASE}/api/v1/profiles?${params}`, {
    headers: { Accept: 'application/json' },
  }).then((r) => r.json());
}

/**
 * Lightweight typeahead search — returns minimal profile fields
 * for populating the auto-fill dropdown in the birth details form.
 */
export function searchProfilesTypeahead(q, limit = 5) {
  const params = new URLSearchParams({ q, limit: String(limit) });
  return fetch(`${API_BASE}/api/v1/profiles/search?${params}`, {
    headers: { Accept: 'application/json' },
  }).then((r) => (r.ok ? r.json() : []));
}

/** Get a single full profile by ID. */
export function getProfile(id) {
  return fetch(`${API_BASE}/api/v1/profiles/${id}`, {
    headers: { Accept: 'application/json' },
  }).then((r) => r.json());
}

/** Partially update a saved profile. Only supplied fields are changed. */
export function updateProfile(id, fields) {
  return patchJSON(`/api/v1/profiles/${id}`, fields);
}

/** Hard-delete a saved profile by ID. */
export function deleteProfile(id) {
  return request(`/api/v1/profiles/${id}`, { method: 'DELETE' });
}

/** Run Guna Milan for two saved profiles by ID. */
export function matchSaved(boyId, girlId, includeAiReading = false) {
  return postJSON('/api/v1/match-saved', {
    boy_id: boyId,
    girl_id: girlId,
    include_ai_reading: includeAiReading,
  });
}
