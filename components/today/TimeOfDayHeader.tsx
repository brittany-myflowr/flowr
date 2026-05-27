import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand';
import { CyclePhasePill } from '@/components/cycle/CyclePhasePill';
import { WeekProgressStrip } from '@/components/today/WeekProgressStrip';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { CyclePhaseInfo } from '@/lib/cycle';
import type { TimeOfDay } from '@/types';
import { s, fs } from '@/lib/scale';

type WeekDay = {
  key: string;
  label: string;
  isToday: boolean;
  isComplete: boolean;
  hasProgress: boolean;
  isOffDay: boolean;
};

type TimeOfDayHeaderProps = {
  percent?: number;
  dayTotal?: number;
  dayStepsLabel?: string;
  phaseInfo?: CyclePhaseInfo | null;
  onPhasePress?: () => void;
  greeting?: string;
  dateLabel?: string;
  weekDays?: WeekDay[];
  showBrand?: boolean;
};

export function TimeOfDayHeader({
  percent = 0,
  dayTotal = 0,
  dayStepsLabel,
  phaseInfo,
  onPhasePress,
  greeting,
  dateLabel,
  weekDays,
  showBrand = true,
}: TimeOfDayHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + s(12) }]}>
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

      {weekDays?.length ? <WeekProgressStrip days={weekDays} /> : null}

      {phaseInfo ? (
        <CyclePhasePill phaseInfo={phaseInfo} onPress={onPhasePress} />
      ) : null}

      {dayStepsLabel ? <Text style={styles.dayStepsLabel}>{dayStepsLabel}</Text> : null}

      <ProgressBar percent={percent} total={dayTotal} />
    </View>
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
    gap: s(6),
  },
  brandMark: {
    alignSelf: 'flex-start',
    marginBottom: s(2),
  },
  greeting: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(17),
    color: colors.white,
    textAlign: 'center',
  },
  dateLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
  dayStepsLabel: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(11),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
});
