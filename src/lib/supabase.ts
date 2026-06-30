import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live data.');
}

if (import.meta.env.VITE_SUPABASE_SERVICE_KEY) {
  throw new Error('Security error: never expose SUPABASE_SERVICE_ROLE_KEY through VITE_* frontend variables.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Backwards-compatible alias for pages that still import supabaseAdmin.
// It intentionally uses the anon key so browser code can never bypass RLS.
export const supabaseAdmin = supabase;
