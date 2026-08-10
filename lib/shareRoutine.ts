import { Platform, Share } from 'react-native';

import { SHARE_BASE_URL } from '@/constants/appInfo';
import { isSupabaseConfigured, supabase } from '@/constants/supabase';
import {
  buildRoutineShareSnapshot,
  formatSharedRoutineTitle,
} from '@/lib/shareRoutineSnapshot';
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
  sharedByFirstName?: string;
  includeDescription?: boolean;
  includeStepNotes?: boolean;
}): Promise<{ url: string; shareId: string; title: string } | { error: string }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Sharing needs an online connection.' };
  }

  const snapshot = buildRoutineShareSnapshot(
    input.routine,
    input.products,
    { firstName: input.sharedByFirstName },
    {
      includeDescription: input.includeDescription,
      includeStepNotes: input.includeStepNotes,
    },
  );
  const title = formatSharedRoutineTitle(snapshot.name, snapshot.sharedByFirstName);
  const shareId = createShareId();

  const { error } = await supabase.from('shared_routines').insert({
    id: shareId,
    routine_id: input.routine.id,
    user_id: input.userId,
    snapshot,
  });

  if (error) {
    return { error: error.message ?? 'Could not create share link.' };
  }

  return { url: buildRoutineShareUrl(shareId), shareId, title };
}

export async function fetchSharedRoutineSnapshot(
  shareId: string,
): Promise<SharedRoutineSnapshot | null> {
  if (!isSupabaseConfigured() || !shareId.trim()) return null;

  const { data, error } = await supabase.rpc('get_shared_routine', {
    share_id: shareId.trim(),
  });

  if (error || !data) return null;
  return data as SharedRoutineSnapshot;
}

function createShareId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // RFC4122 v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * iOS: share URL only so Messages shows one link card (not title text + URL twice).
 * Android: message body includes the title + URL.
 * Card title/description come from Open Graph tags on myflowr.co.
 */
export async function shareRoutineLink(url: string, title: string): Promise<void> {
  if (Platform.OS === 'ios') {
    await Share.share({ url, title });
    return;
  }

  await Share.share({
    message: `${title}\n${url}`,
    title,
  });
}

export type { SharedRoutineRow };
