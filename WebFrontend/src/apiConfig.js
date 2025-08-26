const LS_KEY = 'bugflow.apiBaseUrl';
const DEFAULT_URL = 'http://localhost:3001';

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
