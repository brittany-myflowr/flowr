import { StyleSheet, Text, View } from 'react-native';

import { Daisy, Logo } from '@/components/brand';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { fonts } from '@/constants/typography';

type AuthHeaderProps = {
  subtitle?: string;
  compact?: boolean;
};

export function AuthHeader({ subtitle, compact = false }: AuthHeaderProps) {
  return (
    <GradientBackground style={[styles.header, compact && styles.headerCompact]}>
      <Daisy color="rgba(255,255,255,0.95)" size={36} />
      <View style={styles.logoWrap}>
        <Logo size={32} />
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerCompact: {
    paddingTop: 32,
    paddingBottom: 24,
  },
  logoWrap: {
    marginTop: 8,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: fonts.dmSans,
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
  },
});
