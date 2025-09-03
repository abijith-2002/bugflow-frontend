//
// Lightweight Supabase client initialization and display-name fetch helper.
// Uses environment variables provided to the WebFrontend container.
//
// Environment variables required:
// - REACT_APP_SUPABASE_URL
// - REACT_APP_SUPABASE_ANON_KEY (preferred) or REACT_APP_SUPABASE_KEY (fallback)
//
// PUBLIC_INTERFACE
export async function fetchDisplayNameByUserId(userId) {
  /** Fetches the user's display name from Supabase using the provided user id.
   * Returns a string display name or null if not found.
   *
   * Data sources priority:
   * - Profiles table (common pattern): profiles.display_name or profiles.username or profiles.full_name
   * - auth.users.user_metadata: full_name or name or username
   *
   * Notes:
   * - This function performs direct Supabase REST calls via fetch to avoid adding extra deps.
   * - It uses the anon key from env which must have RLS policies that allow reading the needed data.
   */
  if (!userId) return null;

  const url = process.env.REACT_APP_SUPABASE_URL;
  const anon = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_KEY;

  if (!url || !anon) {
    // Environment must be configured by the orchestrator; avoid throwing to keep UX stable.
    console.warn(
      'Supabase env vars are missing. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.'
    );
    return null;
  }

  // Helper to perform a GET on the Supabase REST endpoint with anon key.
  async function supaGet(path, { headers, query } = {}) {
    const u = new URL(`${url.replace(/\/+$/, '')}/rest/v1${path}`);
    if (query && typeof query === 'object') {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) u.searchParams.append(k, String(v));
      });
    }
    const resp = await fetch(u.toString(), {
      method: 'GET',
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        ...(headers || {}),
      },
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      const msg = text || `Supabase request failed (${resp.status})`;
      const err = new Error(msg);
      err.status = resp.status;
      throw err;
    }
    return resp.json();
  }

  // 1) Try to read from a typical "profiles" table if present:
  //    profiles: id (uuid, PK) -> fields: display_name/username/full_name
  try {
    const profiles = await supaGet('/profiles', {
      headers: { Accept: 'application/json' },
      query: {
        select: 'display_name,username,full_name',
        id: `eq.${userId}`,
        limit: 1,
      },
    });
    if (Array.isArray(profiles) && profiles.length > 0) {
      const p = profiles[0] || {};
      const n =
        (typeof p.display_name === 'string' && p.display_name.trim()) ||
        (typeof p.username === 'string' && p.username.trim()) ||
        (typeof p.full_name === 'string' && p.full_name.trim()) ||
        null;
      if (n) return n;
    }
  } catch (e) {
    // If table missing or RLS denies access, silently fall back to auth.users.user_metadata
    // console.warn('Profiles lookup failed:', e?.message);
  }

  // 2) Fallback to auth.users view via the Supabase "auth.v1" REST endpoint is not exposed by anon REST.
  //    However, we can use the Edge function-like auth endpoint "auth.admin" only with service key (not allowed here).
  //    So as a secondary approach, attempt to fetch a "public_profiles" (if exists).
  try {
    const publicProfiles = await supaGet('/public_profiles', {
      headers: { Accept: 'application/json' },
      query: {
        select: 'display_name,username,full_name',
        user_id: `eq.${userId}`,
        limit: 1,
      },
    });
    if (Array.isArray(publicProfiles) && publicProfiles.length > 0) {
      const p = publicProfiles[0] || {};
      const n =
        (typeof p.display_name === 'string' && p.display_name.trim()) ||
        (typeof p.username === 'string' && p.username.trim()) ||
        (typeof p.full_name === 'string' && p.full_name.trim()) ||
        null;
      if (n) return n;
    }
  } catch {
    // ignore and proceed to final fallback
  }

  // 3) If neither profile table is accessible, we cannot reach user_metadata from the browser using anon key safely.
  //    Return null and let the UI show a generic fallback.
  return null;
}
