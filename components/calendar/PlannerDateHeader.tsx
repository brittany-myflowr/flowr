import { StyleSheet, Text, View } from 'react-native';

import { buildCycleDividerLabel, getTodayHeaderDateParts } from '@/components/today/TimeOfDayHeader';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useCurrentPhaseInfo } from '@/hooks/useCurrentPhaseInfo';
import { s, fs } from '@/lib/scale';

type PlannerDateHeaderProps = {
  date: Date;
  dayDone: number;
  dayTotal: number;
  isToday: boolean;
};

export function PlannerDateHeader({ date, dayDone, dayTotal, isToday }: PlannerDateHeaderProps) {
  const phaseInfo = useCurrentPhaseInfo(date);
  const { day, weekday, month, year } = getTodayHeaderDateParts(date);

  return (
    <View style={styles.header}>
      <View style={styles.dateRow}>
        <Text style={styles.dayNumber}>{day}</Text>
        <View style={styles.dateMeta}>
          <Text style={styles.weekday}>{weekday}</Text>
          <Text style={styles.month}>{month}</Text>
          <Text style={styles.year}>{year}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        {isToday ? <Text style={styles.todayBadge}>Today</Text> : null}
        {dayTotal > 0 ? (
          <Text style={styles.progress}>
            {dayDone}/{dayTotal} done
          </Text>
        ) : (
          <Text style={styles.progressMuted}>Nothing scheduled</Text>
        )}
      </View>

      {phaseInfo ? (
        <Text style={styles.cyclePhase}>{buildCycleDividerLabel(phaseInfo)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: s(4),
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: s(12),
  },
  dayNumber: {
    fontFamily: fonts.loraBold,
    fontSize: fs(40),
    lineHeight: fs(44),
    color: colors.navy,
    includeFontPadding: false,
    transform: [{ translateY: s(3) }],
  },
  dateMeta: {
    paddingBottom: s(2),
    gap: s(1),
  },
  weekday: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(14),
    color: colors.navy,
  },
  month: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.gray,
  },
  year: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.muted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginTop: s(6),
  },
  todayBadge: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(9),
    fontWeight: '600',
    letterSpacing: s(0.6),
    textTransform: 'uppercase',
    color: colors.white,
    backgroundColor: colors.navy,
    paddingHorizontal: s(6),
    paddingVertical: s(2),
  },
  progress: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.blue,
  },
  progressMuted: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.muted,
  },
  cyclePhase: {
    marginTop: s(4),
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.muted,
  },
});
