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
export function getKundali(person, includeAiReading = false, language = 'en') {
  return postJSON('/api/v1/kundali', { person, include_ai_reading: includeAiReading, language });
}

export function getAshtakvarga(person) {
  return postJSON('/api/v1/ashtakvarga', { person });
}


export function getMatch(boy, girl, includeAiReading = false, language = 'en') {
  return postJSON('/api/v1/match', { boy, girl, include_ai_reading: includeAiReading, language });
}

export function checkHealth() {
  return fetch(`${API_BASE}/health`).then((r) => r.ok);
}

// ---------------------------------------------------------------------------
// Geocoding — 3-tier cached via backend
// ---------------------------------------------------------------------------
export function geocodeSearch(query) {
  return fetch(`${API_BASE}/api/v1/geocode?q=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/json', ...(localStorage.getItem('kundali_auth_token') ? { Authorization: `Bearer ${localStorage.getItem('kundali_auth_token')}` } : {}) },
  }).then((r) => (r.ok ? r.json() : []));
}

// ---------------------------------------------------------------------------
// Profile API
// ---------------------------------------------------------------------------

/** Save a new birth profile. */
export function saveProfile(person, gender, birthPlace, tag = 'self', userId = null) {
  return postJSON('/api/v1/profiles', {
    person,
    gender,
    birth_place: birthPlace || null,
    tag,
    user_id: userId || null,
  });
}

/** Full paginated profile list with optional filters. */
export function searchProfiles({ q = '', gender = '', tag = '', page = 1, perPage = 20, userId = null } = {}) {
  const params = new URLSearchParams();
  if (q)      params.set('q',        q);
  if (gender) params.set('gender',   gender);
  if (tag)    params.set('tag',      tag);
  if (userId) params.set('user_id',  userId);
  params.set('page',     String(page));
  params.set('per_page', String(perPage));
  return fetch(`${API_BASE}/api/v1/profiles?${params}`, {
    headers: { Accept: 'application/json', ...(localStorage.getItem('kundali_auth_token') ? { Authorization: `Bearer ${localStorage.getItem('kundali_auth_token')}` } : {}) },
  }).then((r) => r.json());
}

/**
 * Lightweight typeahead search — returns minimal profile fields
 * for populating the auto-fill dropdown in the birth details form.
 */
export function searchProfilesTypeahead(q, limit = 5) {
  const params = new URLSearchParams({ q, limit: String(limit) });
  return fetch(`${API_BASE}/api/v1/profiles/search?${params}`, {
    headers: { Accept: 'application/json', ...(localStorage.getItem('kundali_auth_token') ? { Authorization: `Bearer ${localStorage.getItem('kundali_auth_token')}` } : {}) },
  }).then((r) => (r.ok ? r.json() : []));
}

/** Get a single full profile by ID. */
export function getProfile(id) {
  return fetch(`${API_BASE}/api/v1/profiles/${id}`, {
    headers: { Accept: 'application/json', ...(localStorage.getItem('kundali_auth_token') ? { Authorization: `Bearer ${localStorage.getItem('kundali_auth_token')}` } : {}) },
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
export function matchSaved(boyId, girlId, includeAiReading = false, language = 'en') {
  return postJSON('/api/v1/match-saved', {
    boy_id: boyId,
    girl_id: girlId,
    include_ai_reading: includeAiReading,
    language,
  });
}

// ---------------------------------------------------------------------------
// Phase 5A: Live Transits / Sade Sati
// ---------------------------------------------------------------------------
export function getLiveTransits(moonSignIndex, lagnaSignIndex) {
  return fetch(`${API_BASE}/api/v1/transits/live?moon_sign_index=${moonSignIndex}&lagna_sign_index=${lagnaSignIndex}`, {
    headers: { Accept: 'application/json', ...(localStorage.getItem('kundali_auth_token') ? { Authorization: `Bearer ${localStorage.getItem('kundali_auth_token')}` } : {}) },
  }).then((r) => r.json());
}

// ---------------------------------------------------------------------------
// Phase 5C: Multi-Profile Bulk Matching
// ---------------------------------------------------------------------------
export function matchBulk(anchorProfileId, candidateIds = null) {
  return postJSON('/api/v1/match-bulk', {
    anchor_profile_id: anchorProfileId,
    ...(candidateIds && { candidate_ids: candidateIds }),
  });
}

// ---------------------------------------------------------------------------
// Phase 6B: Daily Hindu Panchang
// ---------------------------------------------------------------------------
export function getPanchang({ date = '', lat = 18.5204, lon = 73.8567, tz = 'Asia/Kolkata' } = {}) {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  params.set('lat', String(lat));
  params.set('lon', String(lon));
  params.set('tz', tz);

  return fetch(`${API_BASE}/api/v1/panchang?${params}`, {
    headers: { Accept: 'application/json', ...(localStorage.getItem('kundali_auth_token') ? { Authorization: `Bearer ${localStorage.getItem('kundali_auth_token')}` } : {}) },
  }).then((r) => r.json());
}

// ---------------------------------------------------------------------------
// Phase 7A: KP Astrology System
// ---------------------------------------------------------------------------
export function getKPSystem(person) {
  return postJSON('/api/v1/kp', { person });
}

// ---------------------------------------------------------------------------
// Phase 7B: Context-Aware Interactive AI Assistant
// ---------------------------------------------------------------------------
export function askAIChat(report, question, language = 'en', userId = null) {
  return postJSON('/api/v1/ai-chat', { report, question, language, user_id: userId });
}

// ---------------------------------------------------------------------------
// Phase 7C: Varshapal (Annual Solar Return / Tajika System)
// ---------------------------------------------------------------------------
export function getVarshapal(person, targetYear) {
  return postJSON('/api/v1/varshapal', {
    person,
    target_year: targetYear,
  });
}



