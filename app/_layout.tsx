import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LoadingDots } from '@/components/feedback/LoadingDots';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { colors } from '@/constants/colors';
import { AppProviders } from '@/providers/AppProviders';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  useFonts as useDMSans,
} from '@expo-google-fonts/dm-sans';
import {
  Lora_700Bold,
  Lora_700Bold_Italic,
  useFonts as useLora,
} from '@expo-google-fonts/lora';

// Keep native splash visible until fonts resolve (or timeout), so a slow/failed
// font load never presents as a white blank screen to App Review.
void SplashScreen.preventAutoHideAsync().catch(() => {
  // Native splash may already be hidden in some environments.
});

const FONT_BOOT_TIMEOUT_MS = 3000;

export default function RootLayout() {
  const [loraLoaded, loraError] = useLora({
    Lora_700Bold,
    Lora_700Bold_Italic,
  });
  const [dmSansLoaded, dmSansError] = useDMSans({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });
  const [fontTimedOut, setFontTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFontTimedOut(true), FONT_BOOT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const fontsReady =
    (loraLoaded && dmSansLoaded) || Boolean(loraError || dmSansError) || fontTimedOut;

  useEffect(() => {
    if (fontsReady) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return (
      <View style={styles.boot}>
        <GradientBackground style={styles.bootGradient}>
          <LoadingDots color={`${colors.navy}88`} />
        </GradientBackground>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
  },
  bootGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
