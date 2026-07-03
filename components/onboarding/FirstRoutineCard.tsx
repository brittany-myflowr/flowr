import { StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { FullWidthButton } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { plannerCard } from '@/constants/plannerCardStyles';
import { tabPageTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { s } from '@/lib/scale';

type FirstRoutineCardProps = {
  onGetStarted?: () => void;
};

export function FirstRoutineCard({ onGetStarted }: FirstRoutineCardProps) {
  return (
    <View style={[styles.card, plannerCard()]}>
      <View style={styles.iconWrap}>
        <Daisy color={colors.blue} size={s(44)} />
      </View>
      <Text style={styles.title}>Build your first routine</Text>
      <Text style={styles.description}>
        Routines are collections of steps you do regularly. We&apos;ll walk you through
        creating yours.
      </Text>
      <FullWidthButton label="Get Started" onPress={onGetStarted} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: s(20),
    alignItems: 'center',
    marginBottom: s(10),
  },
  iconWrap: {
    marginBottom: s(12),
  },
  title: {
    fontFamily: fonts.cardTitle,
    fontSize: tabPageTypography.emptyTitle,
    color: colors.navy,
    textAlign: 'center',
    lineHeight: tabPageTypography.emptyTitle * 1.35,
    marginBottom: s(8),
  },
  description: {
    fontFamily: fonts.dmSans,
    fontSize: tabPageTypography.emptyBody,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: tabPageTypography.emptyBodyLineHeight,
    marginBottom: s(18),
  },
});
