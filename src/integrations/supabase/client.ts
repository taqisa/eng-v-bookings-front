
// Supabase client configuration
// Uses environment variables for security - never hardcode credentials
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// These are PUBLIC keys (anon key) - safe for frontend but still better in env vars
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://majskvkyvflifttonwgr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hanNrdmt5dmZsaWZ0dG9ud2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNTQxNDEsImV4cCI6MjA2NDczMDE0MX0.PD5Pkuj1J-srAHdbY4hsU8vEvkSAuRNvn4PsUEJfUFk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
