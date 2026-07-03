import { supabase, isSupabaseConfigured } from '@/constants/supabase';

export async function checkOnline(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.auth.getSession();
    return !error;
  } catch {
    return false;
  }
}
