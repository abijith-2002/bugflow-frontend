import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

let client = null;

// PUBLIC_INTERFACE
/**
 * Get a singleton Supabase client instance for the frontend.
 * This function lazily initializes the client so the app won't crash if env
 * variables are missing. Consumers should ensure the following env vars are set:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_KEY
 *
 * Returns:
 *   SupabaseClient instance. If envs are missing, a client is still created with empty strings
 *   so that importing this module does not break the build; actual calls will fail
 *   and the console will warn about missing envs.
 */
export function getSupabaseClient() {
  if (!client) {
    if (!supabaseUrl || !supabaseKey) {
      // We keep this lazy and do not throw immediately to avoid crashing the app if envs are missing.
      // Consumers should ensure envs are provided before using this client.
      // eslint-disable-next-line no-console
      console.warn(
        'Supabase env vars are missing. Provide REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY to use Supabase from frontend.'
      );
    }
    client = createClient(supabaseUrl || '', supabaseKey || '');
  }
  return client;
}
