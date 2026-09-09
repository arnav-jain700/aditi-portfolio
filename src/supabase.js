import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://beusyhhhafgtutzayniw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldXN5aGhoYWZndHV0emF5bml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NjkzMjgsImV4cCI6MjEwNDQ0NTMyOH0.5f-iy01qTHiqqWGCsWcaGqTZuM-DtHAzHlEHaKzQpGo';

const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const getStorage = (k) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null);

const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || getStorage('supabase_url') || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || getStorage('supabase_anon_key') || DEFAULT_SUPABASE_ANON_KEY;

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
