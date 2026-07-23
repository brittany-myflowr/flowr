import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getTimeOfDayIcon } from '@/components/icons/TimeOfDayIcons';
import { ChevronRightIcon } from '@/components/icons/ProfileIcons';
import { colors } from '@/constants/colors';
import { todayGlassCard } from '@/constants/todayCardStyles';
import { fonts } from '@/constants/typography';
import type { TimeOfDay } from '@/types';
import { fs, s, vs } from '@/lib/scale';

type FuturePeriodPreviewProps = {
  label: string;
  timeOfDay: TimeOfDay;
  remainingSteps: number;
  onPress: () => void;
};

export function FuturePeriodPreview({
  label,
  timeOfDay,
  remainingSteps,
  onPress,
}: FuturePeriodPreviewProps) {
  const stepLabel = `${remainingSteps} step${remainingSteps === 1 ? '' : 's'}`;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, todayGlassCard(undefined, 'future')]}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${stepLabel} later. Expand section.`}
    >
      <View style={styles.iconWrap}>{getTimeOfDayIcon(timeOfDay, colors.muted)}</View>

      <View style={styles.copy}>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.subtitle}>
          {stepLabel} · later
        </Text>
      </View>

      <ChevronRightIcon size={s(12)} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    marginBottom: s(6),
  },
  iconWrap: {
    width: s(24),
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(12),
    fontWeight: '600',
    color: colors.navy,
  },
  subtitle: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.muted,
  },
});
