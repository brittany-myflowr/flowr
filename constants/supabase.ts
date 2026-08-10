import { createClient, type SupportedStorage, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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

/** SecureStore rejects very large values; chunk session JSON across keys when needed. */
const CHUNK_SIZE = 1800;

const ExpoSecureStoreAdapter: SupportedStorage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') return null;
    const value = await SecureStore.getItemAsync(key);
    if (value != null) return value;

    const countRaw = await SecureStore.getItemAsync(`${key}__chunk_count`);
    const count = countRaw ? Number.parseInt(countRaw, 10) : 0;
    if (!count || Number.isNaN(count)) return null;

    const parts: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const part = await SecureStore.getItemAsync(`${key}__chunk_${index}`);
      if (part == null) return null;
      parts.push(part);
    }
    return parts.join('');
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') return;
    await clearChunked(key);
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const chunks = Math.ceil(value.length / CHUNK_SIZE);
    await SecureStore.setItemAsync(`${key}__chunk_count`, String(chunks));
    for (let index = 0; index < chunks; index += 1) {
      const chunk = value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE);
      await SecureStore.setItemAsync(`${key}__chunk_${index}`, chunk);
    }
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') return;
    await SecureStore.deleteItemAsync(key);
    await clearChunked(key);
  },
};

async function clearChunked(key: string) {
  const countRaw = await SecureStore.getItemAsync(`${key}__chunk_count`);
  const count = countRaw ? Number.parseInt(countRaw, 10) : 0;
  if (countRaw) {
    await SecureStore.deleteItemAsync(`${key}__chunk_count`);
  }
  if (!count || Number.isNaN(count)) return;
  for (let index = 0; index < count; index += 1) {
    await SecureStore.deleteItemAsync(`${key}__chunk_${index}`);
  }
}

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
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: isSupabaseConfigured(),
      persistSession: isSupabaseConfigured(),
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  },
);

export const PASSWORD_RESET_REDIRECT_URL = 'com.brittanytheodore.flowr://reset-password';
