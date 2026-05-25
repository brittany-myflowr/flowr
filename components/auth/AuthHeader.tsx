import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { fonts } from '@/constants/typography';
import { s, fs } from '@/lib/scale';

type AuthHeaderProps = {
  subtitle?: string;
  compact?: boolean;
};

export function AuthHeader({ subtitle, compact = false }: AuthHeaderProps) {
  const insets = useSafeAreaInsets();
  const topPadding = insets.top + s(compact ? 20 : 24);

  return (
    <GradientBackground
      fill={false}
      style={[
        styles.header,
        compact && styles.headerCompact,
        { paddingTop: topPadding },
      ]}
    >
      <BrandMark flowerSize={s(36)} logoSize={s(32)} />
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingBottom: s(24),
    paddingHorizontal: s(20),
    alignItems: 'center',
  },
  headerCompact: {
    paddingBottom: s(28),
  },
  subtitle: {
    marginTop: s(8),
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
  },
});
