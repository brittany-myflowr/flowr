import { Share } from 'react-native';

import { SHARE_BASE_URL } from '@/constants/appInfo';
import { isSupabaseConfigured, supabase } from '@/constants/supabase';
import { buildRoutineShareSnapshot } from '@/lib/shareRoutineSnapshot';
import type { Product, Routine } from '@/types';
import type { SharedRoutineRow, SharedRoutineSnapshot } from '@/types/share';

export function buildRoutineShareUrl(shareId: string): string {
  // Query form avoids a Vercel cleanUrls clash with /routine → routine.html.
  // Path form /routine/:id is still accepted by the preview page + deep link parser.
  return `${SHARE_BASE_URL}/shared-routine?id=${encodeURIComponent(shareId)}`;
}

export async function createRoutineShareLink(input: {
  routine: Routine;
  products: Product[];
  userId: string;
}): Promise<{ url: string; shareId: string } | { error: string }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Sharing needs an online connection.' };
  }

  const snapshot = buildRoutineShareSnapshot(input.routine, input.products);

  const { data, error } = await supabase
    .from('shared_routines')
    .insert({
      routine_id: input.routine.id,
      user_id: input.userId,
      snapshot,
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    return { error: error?.message ?? 'Could not create share link.' };
  }

  return { url: buildRoutineShareUrl(data.id), shareId: data.id };
}

export async function fetchSharedRoutineSnapshot(
  shareId: string,
): Promise<SharedRoutineSnapshot | null> {
  if (!isSupabaseConfigured() || !shareId.trim()) return null;

  const { data, error } = await supabase
    .from('shared_routines')
    .select('snapshot')
    .eq('id', shareId.trim())
    .maybeSingle();

  if (error || !data?.snapshot) return null;
  return data.snapshot as SharedRoutineSnapshot;
}

export async function shareRoutineLink(url: string, routineName: string): Promise<void> {
  await Share.share({
    message: `Check out this flowr routine: ${routineName}\n${url}`,
    url,
    title: 'Share this routine',
  });
}

export type { SharedRoutineRow };
