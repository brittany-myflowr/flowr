import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { Daisy, Logo } from '@/components/brand';
import { Button } from '@/components/ui/Button';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/appInfo';
import { fonts } from '@/constants/typography';
import { openExternalUrl } from '@/lib/appLinking';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <GradientBackground style={styles.container}>
      <StatusBar style="light" />
      <Daisy color="rgba(255,255,255,0.95)" size={64} />
      <View style={styles.logoWrap}>
        <Logo size={44} />
      </View>
      <Text style={styles.tagline}>Self-Care, Beautifully Organized</Text>

      <View style={styles.actions}>
        <Button
          label="Get Started"
          variant="surface"
          onPress={() => router.push('/(auth)/sign-up')}
        />
        <View style={styles.spacer} />
        <Button
          label="I already have an account"
          variant="ghostLight"
          onPress={() => router.push('/(auth)/log-in')}
        />
      </View>

      <Text style={styles.legal}>
        By continuing you agree to our{' '}
        <Text style={styles.legalLink} onPress={() => openExternalUrl(TERMS_URL)}>
          Terms
        </Text>{' '}
        and{' '}
        <Text style={styles.legalLink} onPress={() => openExternalUrl(PRIVACY_POLICY_URL)}>
          Privacy Policy
        </Text>
      </Text>
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
    marginBottom: 8,
  },
  tagline: {
    fontFamily: fonts.dmSans,
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 52,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
  },
  spacer: {
    height: 10,
  },
  legal: {
    position: 'absolute',
    bottom: 28,
    fontFamily: fonts.dmSans,
    fontSize: 9,
    letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 14,
  },
  legalLink: {
    textDecorationLine: 'underline',
    color: 'rgba(255,255,255,0.45)',
  },
});
