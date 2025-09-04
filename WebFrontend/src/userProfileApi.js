import { apiGet } from './api';
import { getAuthUser } from './auth';

// PUBLIC_INTERFACE
export async function getCurrentUserProfile() {
  /** Calls backend GET /users/me to resolve current user's display_name from public.profiles.
   * Sends user_id as a query parameter when available and includes Authorization header via apiGet helper.
   */
  const authUser = getAuthUser();
  const user_id = authUser?.id || null;
  const params = {};
  if (user_id) params.user_id = user_id; // pass as query param when available
  return apiGet('/users/me', params);
}

// PUBLIC_INTERFACE
export async function getCurrentUserProfileWithUserId(userId) {
  /** Calls backend GET /users/me explicitly passing user_id as a query parameter.
   * This guarantees that the actual network request URL includes ?user_id=<id>.
   * Authorization header is still included by apiGet.
   */
  const params = {};
  if (userId) params.user_id = userId;
  return apiGet('/users/me', params);
}

// PUBLIC_INTERFACE
export async function fetchAndStoreDisplayName(saveAuthFunc, userId) {
  /** Convenience helper: fetches current user's display_name and saves it with saveAuth. */
  try {
    // Prefer explicit userId when provided to ensure ?user_id=<id> is sent
    const me = userId ? await getCurrentUserProfileWithUserId(userId) : await getCurrentUserProfile();
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
