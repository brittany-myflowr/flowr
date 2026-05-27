import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import type { TimeOfDay } from '@/types';
import { s, fs } from '@/lib/scale';

type TimeOfDayHeaderProps = {
  percent?: number;
  dayStepsLabel?: string;
  greeting?: string;
  dateLabel?: string;
  showBrand?: boolean;
};

export function TimeOfDayHeader({
  percent = 0,
  dayStepsLabel,
  greeting,
  dateLabel,
  showBrand = true,
}: TimeOfDayHeaderProps) {
  const insets = useSafeAreaInsets();
  const actualTimeOfDay = useTimeOfDay();

  return (
    <GradientBackground
      fill={false}
      variant={actualTimeOfDay}
      style={[styles.header, { paddingTop: insets.top + s(12) }]}
    >
      {showBrand ? (
        <BrandMark
          direction="row"
          flowerSize={s(16)}
          logoSize={s(16)}
          color="rgba(255,255,255,0.75)"
          style={styles.brandMark}
        />
      ) : null}

      {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}
      {dateLabel ? <Text style={styles.dateLabel}>{dateLabel}</Text> : null}

      <View style={styles.progressWrap}>
        <ProgressRing percent={percent} size={s(112)} />
      </View>

      {dayStepsLabel ? <Text style={styles.dayStepsLabel}>{dayStepsLabel}</Text> : null}
    </GradientBackground>
  );
}

export function getTimeOfDayGreeting(timeOfDay: TimeOfDay, firstName?: string) {
  const period =
    timeOfDay === 'morning'
      ? 'morning'
      : timeOfDay === 'afternoon'
        ? 'afternoon'
        : 'evening';

  if (firstName?.trim()) {
    return `Good ${period}, ${firstName.trim()}.`;
  }

  return `Good ${period}.`;
}

export function getTodayDateLabel(date = new Date()) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: s(14),
    paddingBottom: s(14),
    alignItems: 'center',
  },
  brandMark: {
    alignSelf: 'flex-start',
    marginBottom: s(8),
  },
  greeting: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(17),
    color: colors.white,
    textAlign: 'center',
  },
  dateLabel: {
    marginTop: s(2),
    marginBottom: s(10),
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
  progressWrap: {
    marginBottom: s(10),
  },
  dayStepsLabel: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(11),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
});
