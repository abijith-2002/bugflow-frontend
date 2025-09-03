const LS_KEY = 'bugflow.apiBaseUrl';

// Prefer environment variable if provided at build time, else default to localhost
const ENV_URL = process.env.REACT_APP_API_BASE_URL;
const DEFAULT_URL = ENV_URL && typeof ENV_URL === 'string' && ENV_URL.trim()
  ? ENV_URL.trim()
  : 'http://localhost:3001';

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
  // If nothing stored, fall back to DEFAULT_URL which may come from REACT_APP_API_BASE_URL
  const effective = normalizeBaseUrl(fromStorage || DEFAULT_URL);
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

function normalizeBaseUrl(url) {
  if (!url || typeof url !== 'string') return DEFAULT_URL;
  let u = url.trim();
  // Remove trailing slash
  if (u.endsWith('/')) u = u.slice(0, -1);
  return u;
}

// Keep current URL in module memory for fast reads
const apiConfig = {
  currentBaseUrl: DEFAULT_URL,
};

// Initialize from storage on import
loadApiBaseUrlFromStorage();

export default {
  getApiBaseUrl,
  setApiBaseUrl,
  loadApiBaseUrlFromStorage,
  pingHealth,
};
