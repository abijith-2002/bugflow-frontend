const AUTH_TOKEN_KEY = 'bugflow.auth.token';
const AUTH_USER_KEY = 'bugflow.auth.user';

/**
 * Normalize various backend user payloads to a consistent shape we store in localStorage.
 * We prefer display name in this order:
 * - user.username
 * - user.name
 * - user.user_metadata.full_name
 * - user.user_metadata.name
 * - user.email (prefix before @)
 */
// PUBLIC_INTERFACE
export function saveAuth({ access_token, user, token_type = 'bearer' }) {
  /** Persist authentication info (token and basic user) to localStorage.
   * If `user.displayName` is provided (e.g., fetched from Supabase), it's stored and later preferred.
   */
  if (!access_token) return;
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ access_token, token_type }));
    if (user !== undefined) {
      const normalized = (() => {
        if (!user || typeof user !== 'object') return user;
        const u = { ...user };
        // Preserve provided displayName if any; otherwise compute a best-effort fallback.
        const pre = (typeof u.displayName === 'string' && u.displayName.trim()) || null;
        if (pre) return { ...u, displayName: pre };

        const meta = u.user_metadata || u.app_metadata || {};
        const email = typeof u.email === 'string' ? u.email : '';
        const emailName = email.includes('@') ? email.split('@')[0] : '';
        const displayName =
          (typeof u.username === 'string' && u.username.trim()) ||
          (typeof u.name === 'string' && u.name.trim()) ||
          (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
          (typeof meta.name === 'string' && meta.name.trim()) ||
          (emailName || null);

        return { ...u, displayName: displayName || null };
      })();

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalized));
    }
    // Notify current tab listeners immediately that auth changed
    try {
      const evt = new Event('bugflow:auth-changed');
      window.dispatchEvent(evt);
    } catch {
      // ignore
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
    // Emit change event so components can react (both same-tab and across tabs via 'storage')
    try {
      const evt = new Event('bugflow:auth-changed');
      window.dispatchEvent(evt);
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
}

/**
 * PUBLIC_INTERFACE
 */
export function getAuthUser() {
  /** Get the saved user object or null. */
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed || null;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function getDisplayName() {
  /** Returns a best-effort display name for the logged-in user using saved user info. */
  const user = getAuthUser();
  if (!user) return null;
  const meta = user.user_metadata || user.app_metadata || {};
  const email = typeof user.email === 'string' ? user.email : '';
  const emailName = email.includes('@') ? email.split('@')[0] : '';
  const name =
    (typeof user.displayName === 'string' && user.displayName.trim()) ||
    (typeof user.username === 'string' && user.username.trim()) ||
    (typeof user.name === 'string' && user.name.trim()) ||
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    (emailName || null);
  return name || null;
}
