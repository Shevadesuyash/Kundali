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
