import { getApiBaseUrl } from './apiConfig';

// PUBLIC_INTERFACE
export async function apiPost(path, body) {
  /** Sends a JSON POST request to the backend and returns parsed JSON or throws an error with message. */
  const base = getApiBaseUrl();
  const resp = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });

  const text = await resp.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // ignore parse errors, will handle below
  }

  if (!resp.ok) {
    const message =
      (data && (data.detail || data.message || data.error)) ||
      `Request failed with status ${resp.status}`;
    const error = new Error(message);
    error.status = resp.status;
    error.data = data;
    throw error;
  }
  return data;
}

// PUBLIC_INTERFACE
export function buildUrl(path) {
  /** Returns the full URL for the given API path using the current base. */
  const base = getApiBaseUrl();
  return `${base}${path}`;
}
