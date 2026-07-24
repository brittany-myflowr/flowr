import { useLinkingURL } from 'expo-linking';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SharedRoutinePreviewModal } from '@/components/routines/SharedRoutinePreviewModal';
import {
  consumePendingSharedRoutineId,
  consumeSharedRoutineIdFromClipboard,
  savePendingSharedRoutineId,
} from '@/lib/pendingSharedRoutine';
import { fetchSharedRoutineSnapshot } from '@/lib/shareRoutine';
import { isSharedRoutineDeepLink, parseSharedRoutineIdFromUrl } from '@/lib/sharedRoutineLink';
import { useAppStore, useRoutines } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';
import type { SharedRoutineSnapshot } from '@/types/share';

/** Opens shared-routine deep links and shows the preview / add flow. */
export function SharedRoutineLinkHandler() {
  const url = useLinkingURL();
  const router = useRouter();
  const { hydrated, isLoggedIn, checkAuthenticated } = useAppStore();
  const { importSharedRoutine } = useRoutines();
  const { showToast } = useToast();

  const [visible, setVisible] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<SharedRoutineSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const handledUrlRef = useRef<string | null>(null);
  const clipboardCheckedRef = useRef(false);
  const openedShareIdRef = useRef<string | null>(null);

  const openShare = useCallback(async (id: string) => {
    if (openedShareIdRef.current === id && visible) return;
    openedShareIdRef.current = id;
    await savePendingSharedRoutineId(id);
    setShareId(id);
    setVisible(true);
    setSnapshot(null);
    setError(null);
    setLoading(true);
  }, [visible]);

  const close = useCallback(() => {
    setVisible(false);
    setShareId(null);
    setSnapshot(null);
    setError(null);
    setLoading(false);
    setAdding(false);
    openedShareIdRef.current = null;
    void consumePendingSharedRoutineId();
  }, []);

  const queueOrOpenShare = useCallback(
    async (id: string) => {
      await savePendingSharedRoutineId(id);

      if (!hydrated) return;

      if (!checkAuthenticated() && !isLoggedIn) {
        router.replace('/(auth)/splash');
        return;
      }

      await openShare(id);
    },
    [hydrated, isLoggedIn, checkAuthenticated, router, openShare],
  );

  // Incoming Universal Link / custom scheme.
  useEffect(() => {
    if (!url || !isSharedRoutineDeepLink(url)) return;
    if (handledUrlRef.current === url) return;

    const id = parseSharedRoutineIdFromUrl(url);
    if (!id) return;

    handledUrlRef.current = url;
    void queueOrOpenShare(id);
  }, [url, queueOrOpenShare]);

  // After hydrate/login: open any pending share (deep link before auth, or clipboard reclaim).
  useEffect(() => {
    if (!hydrated) return;
    if (!checkAuthenticated() && !isLoggedIn) return;

    let cancelled = false;
    void (async () => {
      const pending = await consumePendingSharedRoutineId();
      if (cancelled) return;
      if (pending) {
        await openShare(pending);
        return;
      }

      if (clipboardCheckedRef.current) return;
      clipboardCheckedRef.current = true;
      const fromClipboard = await consumeSharedRoutineIdFromClipboard();
      if (cancelled || !fromClipboard) return;
      await openShare(fromClipboard);
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, isLoggedIn, checkAuthenticated, openShare]);

  useEffect(() => {
    if (!visible || !shareId || !loading) return;

    let cancelled = false;
    void (async () => {
      const next = await fetchSharedRoutineSnapshot(shareId);
      if (cancelled) return;
      if (!next) {
        setError('This share link may be out of date or the routine was removed.');
        setSnapshot(null);
      } else {
        setSnapshot(next);
        setError(null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, shareId, loading]);

  const handleAdd = () => {
    if (!snapshot || adding) return;
    setAdding(true);
    const created = importSharedRoutine(snapshot);
    setAdding(false);
    if (!created) {
      showToast('Could not add routine', 'destructive');
      return;
    }
    showToast('Routine added');
    close();
    router.push({
      pathname: '/(tabs)/routines/[id]',
      params: { id: created.id },
    });
  };

  return (
    <SharedRoutinePreviewModal
      visible={visible}
      snapshot={snapshot}
      loading={loading}
      error={error}
      adding={adding}
      onAdd={handleAdd}
      onClose={close}
    />
  );
}
