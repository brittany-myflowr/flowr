import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/brand';
import { LoadingDots } from '@/components/feedback/LoadingDots';
import { BrandGradientCanvas } from '@/components/ui/BrandGradientCanvas';
import { fonts } from '@/constants/typography';
import { useAppStore } from '@/providers/AppStore';
import { s, vs, fs } from '@/lib/scale';

const LAUNCH_DURATION_MS = 1500;

export default function LaunchScreen() {
  const router = useRouter();
  const { hydrated, isLoggedIn } = useAppStore();

  useEffect(() => {
    if (!hydrated) return;

    const timer = setTimeout(() => {
      router.replace(isLoggedIn ? '/(tabs)' : '/(auth)/splash');
    }, LAUNCH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [hydrated, isLoggedIn, router]);

  return (
    <BrandGradientCanvas style={styles.container}>
      <BrandMark flowerSize={s(64)} logoSize={s(44)} />
      <Text style={styles.loading}>
        {hydrated ? 'Loading your routines...' : 'Starting flowr...'}
      </Text>
      <View style={styles.dots}>
        <LoadingDots />
      </View>
    </BrandGradientCanvas>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(28),
    paddingVertical: vs(40),
  },
  loading: {
    marginTop: s(8),
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  dots: {
    marginTop: s(4),
  },
});
