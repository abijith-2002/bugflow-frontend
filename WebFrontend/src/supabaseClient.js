import { createClient } from '@supabase/supabase-js';

/**
 * PUBLIC_INTERFACE
 * Supabase client singleton for the frontend.
 * - Uses environment variables:
 *   - REACT_APP_SUPABASE_URL
 *   - REACT_APP_SUPABASE_ANON_KEY
 * - Persists session and auto-refreshes tokens.
 * If env variables are missing (e.g., during tests), a lightweight mock client is used.
 */
const url = process.env.REACT_APP_SUPABASE_URL;
const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;

let supabase;

/**
 * In CI/tests or local builds without env configured, createClient('','') may throw.
 * Provide a minimal mock that satisfies the auth API surface used by the app.
 */
if (!url || !anon) {
  // Minimal mock of Supabase auth API
  const listeners = new Set();
  const mockSession = null;
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: mockSession }, error: null }),
      onAuthStateChange: (callback) => {
        listeners.add(callback);
        const subscription = {
          unsubscribe: () => listeners.delete(callback),
        };
        return { data: { subscription } };
      },
      signInWithPassword: async () => ({ data: { session: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
  };
} else {
  supabase = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export { supabase };
