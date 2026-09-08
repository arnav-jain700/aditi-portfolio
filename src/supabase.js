import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url') || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || '';

export let supabase = null;

export function initSupabase(url = SUPABASE_URL, key = SUPABASE_ANON_KEY) {
  if (url && key && url.startsWith('http')) {
    try {
      supabase = createClient(url, key);
      return supabase;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      supabase = null;
      return null;
    }
  }
  supabase = null;
  return null;
}

// Initial attempt
initSupabase();

export function isSupabaseConfigured() {
  return !!supabase;
}
