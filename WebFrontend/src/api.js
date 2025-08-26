import { apiUrl } from './config';

/**
 * Normalize an error message from common FastAPI error payloads.
 * - Supports {detail: "..."} string
 * - Supports {detail: [{msg: "..."}]} validation errors
 * - Falls back to {message} or a default fallback
 * @param {any} data
 * @param {string} fallback
 * @returns {string}
 */
function readErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data.detail === 'string' && data.detail.trim()) {
    return data.detail;
  }
  if (Array.isArray(data.detail) && data.detail.length) {
    // Join validation messages
    const msgs = data.detail
      .map((d) => (d?.msg ? String(d.msg) : ''))
      .filter(Boolean);
    if (msgs.length) return msgs.join('; ');
  }
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }
  return fallback;
}

// PUBLIC_INTERFACE
/**
 * Perform user login against backend /login.
 * On success, persists access_token and refresh_token to localStorage.
 * @param {{email: string, password: string}} payload
 * @returns {Promise<{user_id?: string, access_token?: string, refresh_token?: string, message: string}>}
 */
export async function login(payload) {
  const res = await fetch(apiUrl('/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = readErrorMessage(data, 'Login failed');
    throw new Error(message);
  }

  // Persist tokens if present
  try {
    if (data?.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    if (data?.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
  } catch {
    // ignore storage failures
  }

  return data;
}

// PUBLIC_INTERFACE
/**
 * Perform user signup against backend /signup.
 * On success, persists access_token and refresh_token to localStorage if provided.
 * @param {{email: string, password: string, full_name?: string}} payload
 * @returns {Promise<{user_id?: string, access_token?: string, refresh_token?: string, message: string}>}
 */
export async function signup(payload) {
  const res = await fetch(apiUrl('/signup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = readErrorMessage(data, 'Signup failed');
    throw new Error(message);
  }

  // Persist tokens if present (some backends may auto-login after signup)
  try {
    if (data?.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    if (data?.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
  } catch {
    // ignore storage failures
  }

  return data;
}
