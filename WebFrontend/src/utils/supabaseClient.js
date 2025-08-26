import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

let client = null;

export function getSupabaseClient() {
  if (!client) {
    if (!supabaseUrl || !supabaseKey) {
      // We keep this lazy and do not throw immediately to avoid crashing the app if envs are missing.
      // Consumers should ensure envs are provided before using this client.
      console.warn('Supabase env vars are missing. Provide REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY to use Supabase from frontend.');
    }
    client = createClient(supabaseUrl || '', supabaseKey || '');
  }
  return client;
}
