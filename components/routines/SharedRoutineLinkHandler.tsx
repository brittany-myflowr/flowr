import { useLinkingURL } from 'expo-linking';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SharedRoutinePreviewModal } from '@/components/routines/SharedRoutinePreviewModal';
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
  const pendingShareIdRef = useRef<string | null>(null);

  const openShare = useCallback((id: string) => {
    setShareId(id);
    setVisible(true);
    setSnapshot(null);
    setError(null);
    setLoading(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setShareId(null);
    setSnapshot(null);
    setError(null);
    setLoading(false);
    setAdding(false);
  }, []);

  useEffect(() => {
    if (!url || !isSharedRoutineDeepLink(url)) return;
    if (handledUrlRef.current === url) return;

    const id = parseSharedRoutineIdFromUrl(url);
    if (!id) return;

    handledUrlRef.current = url;

    if (!hydrated) {
      pendingShareIdRef.current = id;
      return;
    }

    if (!checkAuthenticated() && !isLoggedIn) {
      pendingShareIdRef.current = id;
      router.replace('/(auth)/splash');
      return;
    }

    openShare(id);
  }, [url, hydrated, isLoggedIn, checkAuthenticated, router, openShare]);

  useEffect(() => {
    if (!hydrated) return;
    const pending = pendingShareIdRef.current;
    if (!pending) return;
    if (!checkAuthenticated() && !isLoggedIn) return;

    pendingShareIdRef.current = null;
    openShare(pending);
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
