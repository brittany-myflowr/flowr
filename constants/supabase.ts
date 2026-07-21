import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

/**
 * Placeholder values keep createClient from throwing at module load.
 * Real credentials must be set in EAS production env for App Store builds —
 * missing EXPO_PUBLIC_* vars caused Apple's blank-screen-at-launch rejection
 * (unhandled "supabaseUrl is required" → iOS 26 TurboModule fatal).
 */
const SAFE_URL = 'https://placeholder.supabase.co';
const SAFE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

if (!isSupabaseConfigured()) {
  console.warn(
    'Supabase credentials missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in EAS production environment (and .env for local).',
  );
}

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : SAFE_URL,
  isSupabaseConfigured() ? supabaseAnonKey : SAFE_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: isSupabaseConfigured(),
      persistSession: isSupabaseConfigured(),
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  },
);

export const PASSWORD_RESET_REDIRECT_URL = 'com.brittanytheodore.flowr://reset-password';
