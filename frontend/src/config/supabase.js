import { createClient } from '@supabase/supabase-js';
import { isSupabaseAuth } from './authProvider';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (isSupabaseAuth && (!url || !publishableKey)) {
  throw new Error('Supabase authentication requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY');
}

export const supabase = isSupabaseAuth
  ? createClient(url, publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
