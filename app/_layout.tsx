import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

export default function RootLayout() {
  const [loraLoaded] = useLora({
    Lora_700Bold,
    Lora_700Bold_Italic,
  });
  const [dmSansLoaded] = useDMSans({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });

  const fontsLoaded = loraLoaded && dmSansLoaded;

  if (!fontsLoaded) {
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
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fafaf8' } }}>
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
