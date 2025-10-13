const LS_KEY = 'bugflow.apiBaseUrl';

// Prefer environment variable if provided at build time, else default to localhost
const ENV_URL = process.env.REACT_APP_API_BASE_URL;
const DEFAULT_URL_RAW =
  ENV_URL && typeof ENV_URL === 'string' && ENV_URL.trim()
    ? ENV_URL.trim()
    : 'http://localhost:3001';

/**
 * INTERNAL: Returns true if hostname is a local/dev host.
 */
function isLocalHostname(h) {
  if (!h) return false;
  const s = String(h).toLowerCase();
  return (
    s === 'localhost' ||
    s === '127.0.0.1' ||
    s === '::1' ||
    s.endsWith('.local')
  );
}

/**
 * INTERNAL: Attempts to secure a base URL when the app is running over HTTPS.
 * If the base URL uses http:// and is not a localhost-style host, we promote it to https://
 * to avoid mixed-content blocking in browsers.
 * We DO NOT upgrade localhost hosts to https to preserve local dev behavior.
 */
function trySecure(url) {
  let u = String(url || '').trim();
  if (!u) return DEFAULT_URL_RAW;

  // Ensure parseable scheme
  if (!/^https?:\/\//i.test(u)) {
    // Default to https scheme if app is served via https; otherwise http.
    const preferHttps =
      typeof window !== 'undefined' &&
      window.location &&
      window.location.protocol === 'https:';
    u = (preferHttps ? 'https://' : 'http://') + u;
  }

  try {
    const parsed = new URL(u);
    const isHttpsOrigin =
      typeof window !== 'undefined' &&
      window.location &&
      window.location.protocol === 'https:';

    if (isHttpsOrigin && parsed.protocol === 'http:' && !isLocalHostname(parsed.hostname)) {
      // Promote to https to avoid mixed content in production
      parsed.protocol = 'https:';
    }
    // Return normalized origin without trailing slash
    return parsed.origin;
  } catch {
    // If URL couldn't be parsed, fall back to a trimmed string without trailing slashes
    return u.replace(/\/+$/, '');
  }
}

function normalizeBaseUrl(url) {
  const base = url && typeof url === 'string' ? url.trim() : DEFAULT_URL_RAW;
  let normalized = base.replace(/\/+$/, '');
  normalized = trySecure(normalized);
  return normalized;
}

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the current API base URL from memory, falling back to localStorage then default. */
  return apiConfig.currentBaseUrl;
}

// PUBLIC_INTERFACE
export function setApiBaseUrl(newUrl) {
  /** Sets the API base URL (normalized) and persists to localStorage. */
  const normalized = normalizeBaseUrl(newUrl);
  apiConfig.currentBaseUrl = normalized;
  try {
    localStorage.setItem(LS_KEY, normalized);
  } catch {
    // ignore storage errors
  }
  return normalized;
}

// PUBLIC_INTERFACE
export function loadApiBaseUrlFromStorage() {
  /** Loads the API base URL from localStorage into memory; returns the effective value. */
  let fromStorage = null;
  try {
    fromStorage = localStorage.getItem(LS_KEY);
  } catch {
    // ignore
  }
  // If nothing stored, fall back to DEFAULT_URL_RAW and attempt to secure it when on HTTPS origins
  const effective = normalizeBaseUrl(fromStorage || DEFAULT_URL_RAW);
  apiConfig.currentBaseUrl = effective;
  return effective;
}

// PUBLIC_INTERFACE
export async function pingHealth(signal) {
  /** Performs a GET fetch to the backend root "/" to determine online status. Returns boolean. */
  const base = getApiBaseUrl();
  try {
    const resp = await fetch(`${base}/`, { method: 'GET', signal });
    return resp.ok;
  } catch {
    return false;
  }
}

// Keep current URL in module memory for fast reads
const apiConfig = {
  currentBaseUrl: normalizeBaseUrl(DEFAULT_URL_RAW),
};

// Initialize from storage on import (this may override currentBaseUrl if stored)
loadApiBaseUrlFromStorage();

export default {
  getApiBaseUrl,
  setApiBaseUrl,
  loadApiBaseUrlFromStorage,
  pingHealth,
};
