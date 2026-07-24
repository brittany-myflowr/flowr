import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

const PENDING_KEY = '@flowr/v2/pending-shared-routine-id';
export const SHARED_ROUTINE_CLIPBOARD_PREFIX = 'flowr-share:';

export async function savePendingSharedRoutineId(shareId: string): Promise<void> {
  const id = shareId.trim();
  if (!id) return;
  await AsyncStorage.setItem(PENDING_KEY, id);
}

export async function peekPendingSharedRoutineId(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(PENDING_KEY);
  const id = raw?.trim() ?? '';
  return /^[0-9a-f-]{36}$/i.test(id) ? id : null;
}

/** Read and clear a pending share id saved before auth / hydrate. */
export async function consumePendingSharedRoutineId(): Promise<string | null> {
  const id = await peekPendingSharedRoutineId();
  if (id) await AsyncStorage.removeItem(PENDING_KEY);
  return id;
}

export function parseSharedRoutineIdFromClipboardText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith(SHARED_ROUTINE_CLIPBOARD_PREFIX)) return null;
  const id = trimmed.slice(SHARED_ROUTINE_CLIPBOARD_PREFIX.length).trim();
  return /^[0-9a-f-]{36}$/i.test(id) ? id : null;
}

/**
 * One-shot deferred-deep-link reclaim after App Store install.
 * Returns a share id if the web CTA left a flowr-share: token on the clipboard.
 */
export async function consumeSharedRoutineIdFromClipboard(): Promise<string | null> {
  try {
    const hasString = await Clipboard.hasStringAsync();
    if (!hasString) return null;
    const text = await Clipboard.getStringAsync();
    const id = parseSharedRoutineIdFromClipboardText(text);
    if (!id) return null;
    // Clear so we don't reclaim on every launch.
    await Clipboard.setStringAsync('');
    await savePendingSharedRoutineId(id);
    return id;
  } catch {
    return null;
  }
}
