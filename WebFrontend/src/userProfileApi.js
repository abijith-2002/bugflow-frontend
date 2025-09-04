import { apiGet } from './api';

// PUBLIC_INTERFACE
export async function getCurrentUserProfile() {
  /** Calls backend GET /users/me to resolve current user's display_name from public.profiles. */
  return apiGet('/users/me');
}

// PUBLIC_INTERFACE
export async function fetchAndStoreDisplayName(saveAuthFunc, userId) {
  /** Convenience helper: fetches current user's display_name and saves it with saveAuth. */
  try {
    const me = await getCurrentUserProfile();
    const displayName = me?.display_name || null;
    // Build a user object with id + displayName if provided
    const userPayload = userId ? { id: userId, displayName } : { displayName };
    // saveAuthFunc should be saveAuth from auth.js
    if (typeof saveAuthFunc === 'function') {
      // This call assumes token is already stored separately by the caller
      saveAuthFunc({ access_token: null, user: userPayload });
    }
    return displayName;
  } catch (e) {
    return null;
  }
}
