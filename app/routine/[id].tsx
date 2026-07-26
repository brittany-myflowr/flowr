import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LoadingDots } from '@/components/feedback/LoadingDots';
import { colors } from '@/constants/colors';
import { savePendingSharedRoutineId } from '@/lib/pendingSharedRoutine';
import { useAppStore } from '@/providers/AppStore';

/**
 * Catches custom-scheme links: flowr://routine/<shareUuid>
 * Expo Router would otherwise show Unmatched Route — there is no owned-routine
 * screen at /routine/*. SharedRoutineLinkHandler opens the import modal after
 * this queues the share id (and redirects into the normal app shell).
 */
export default function SharedRoutineSchemeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { hydrated, isLoggedIn } = useAppStore();
  const [queued, setQueued] = useState(false);

  const shareId = typeof id === 'string' ? id.trim() : '';

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (/^[0-9a-f-]{36}$/i.test(shareId)) {
        await savePendingSharedRoutineId(shareId);
      }
      if (!cancelled) setQueued(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [shareId]);

  if (!hydrated || !queued) {
    return (
      <View style={styles.boot}>
        <LoadingDots color={`${colors.navy}88`} />
      </View>
    );
  }

  return <Redirect href={isLoggedIn ? '/(tabs)' : '/(auth)/splash'} />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
