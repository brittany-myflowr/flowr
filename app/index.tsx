import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Daisy, Logo } from '@/components/brand';
import { LoadingDots } from '@/components/feedback/LoadingDots';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { fonts } from '@/constants/typography';
import { useAppStore } from '@/providers/AppStore';

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
    <GradientBackground style={styles.container}>
      <Daisy color="rgba(255,255,255,0.95)" size={64} />
      <View style={styles.logoWrap}>
        <Logo size={44} />
      </View>
      <Text style={styles.loading}>
        {hydrated ? 'Loading your routines...' : 'Starting flowr...'}
      </Text>
      <View style={styles.dots}>
        <LoadingDots />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  logoWrap: {
    marginTop: 16,
  },
  loading: {
    marginTop: 4,
    fontFamily: fonts.dmSans,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  dots: {
    marginTop: 4,
  },
});
