import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/brand';
import { Button } from '@/components/ui/Button';
import { BrandGradientCanvas } from '@/components/ui/BrandGradientCanvas';
import { PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/appInfo';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { openExternalUrl } from '@/lib/appLinking';
import { s, vs, fs } from '@/lib/scale';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <BrandGradientCanvas style={styles.container}>
      <StatusBar style="dark" />
      <BrandMark
        flowerSize={s(64)}
        logoSize={s(44)}
        color={colors.navy}
        flowerStrokeWidth={1.1}
        style={styles.brandMark}
      />
      <Text style={styles.tagline}>Self-Care, Beautifully Organized</Text>

      <View style={styles.actions}>
        <Button
          label="Get Started"
          variant="primary"
          onPress={() => router.push('/(auth)/sign-up')}
        />
        <View style={styles.spacer} />
        <Button
          label="I already have an account"
          variant="ghost"
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
  brandMark: {
    marginBottom: s(8),
  },
  tagline: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    letterSpacing: s(2.5),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(52),
    textAlign: 'center',
  },
  actions: {
    width: '100%',
  },
  spacer: {
    height: vs(10),
  },
  legal: {
    position: 'absolute',
    bottom: vs(28),
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    letterSpacing: s(0.5),
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: s(20),
    lineHeight: fs(14),
    opacity: 0.72,
  },
  legalLink: {
    textDecorationLine: 'underline',
    color: colors.blue,
  },
});
