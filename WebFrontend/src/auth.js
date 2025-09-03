const AUTH_TOKEN_KEY = 'bugflow.auth.token';
const AUTH_USER_KEY = 'bugflow.auth.user';

// PUBLIC_INTERFACE
export function saveAuth({ access_token, user, token_type = 'bearer' }) {
  /** Persist authentication info (token and basic user) to localStorage. */
  if (!access_token) return;
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ access_token, token_type }));
    if (user !== undefined) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
  } catch {
    // ignore storage errors
  }
}

// PUBLIC_INTERFACE
export function getAuthToken() {
  /** Returns the access token string or null if not available. */
  try {
    const raw = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token || null;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function getAuthHeaderValue() {
  /** Returns header value "Bearer <token>" if token present, else null. */
  try {
    const raw = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const token = parsed?.access_token;
    const type = (parsed?.token_type || 'bearer').toLowerCase();
    if (!token) return null;
    const scheme = type === 'bearer' ? 'Bearer' : type.charAt(0).toUpperCase() + type.slice(1);
    return `${scheme} ${token}`;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function isAuthenticated() {
  /** Boolean: whether a token exists. */
  return !!getAuthToken();
}

// PUBLIC_INTERFACE
export function clearAuth() {
  /** Remove all saved auth info. */
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export function getAuthUser() {
  /** Get the saved user object or null. */
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
