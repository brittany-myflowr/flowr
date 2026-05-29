import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileHeaderButton } from '@/components/profile/ProfileHeaderButton';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useCurrentPhaseInfo } from '@/hooks/useCurrentPhaseInfo';
import type { CyclePhaseInfo } from '@/lib/cycle';
import { s, fs } from '@/lib/scale';

export function TimeOfDayHeader() {
  const insets = useSafeAreaInsets();
  const phaseInfo = useCurrentPhaseInfo();
  const { day, weekday, month, year } = getTodayHeaderDateParts();

  return (
    <View style={[styles.header, { paddingTop: insets.top + s(32) }]}>
      <View style={styles.headerRow}>
        <View style={styles.dateBlock}>
          <View style={styles.dateRow}>
            <Text style={styles.dayNumber}>{day}</Text>
            <View style={styles.dateMeta}>
              <Text style={styles.weekday}>{weekday}</Text>
              <Text style={styles.month}>{month}</Text>
              <Text style={styles.year}>{year}</Text>
            </View>
          </View>

          {phaseInfo ? (
            <Text style={styles.cyclePhase}>{buildCycleDividerLabel(phaseInfo)}</Text>
          ) : null}
        </View>

        <ProfileHeaderButton />
      </View>
    </View>
  );
}

export function buildCycleDividerLabel(phaseInfo: CyclePhaseInfo) {
  return `${phaseInfo.label} · day ${phaseInfo.dayInCycle}`;
}

export function getTodayHeaderDateParts(date = new Date()) {
  return {
    day: date.getDate().toString(),
    weekday: date.toLocaleDateString(undefined, { weekday: 'long' }),
    month: date.toLocaleDateString(undefined, { month: 'long' }),
    year: date.getFullYear().toString(),
  };
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: s(14),
    paddingBottom: s(18),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: s(10),
  },
  dateBlock: {
    flex: 1,
    minWidth: 0,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: s(12),
  },
  dayNumber: {
    fontFamily: fonts.loraBold,
    fontSize: fs(52),
    lineHeight: fs(56),
    color: colors.navy,
    includeFontPadding: false,
    transform: [{ translateY: s(4) }],
  },
  dateMeta: {
    flex: 1,
    gap: s(1),
    paddingBottom: s(1),
  },
  weekday: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    letterSpacing: s(1.4),
    textTransform: 'uppercase',
    color: colors.muted,
    includeFontPadding: false,
  },
  month: {
    fontFamily: fonts.lora,
    fontSize: fs(13),
    lineHeight: fs(16),
    letterSpacing: s(0.8),
    textTransform: 'uppercase',
    color: colors.navy,
    includeFontPadding: false,
  },
  year: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(11),
    lineHeight: fs(14),
    fontWeight: '600',
    color: colors.navy,
    includeFontPadding: false,
  },
  cyclePhase: {
    fontFamily: fonts.dmSansMedium,
    fontSize: fs(7.6),
    fontWeight: '500',
    letterSpacing: s(2.4),
    textTransform: 'uppercase',
    color: colors.navy,
    includeFontPadding: false,
    alignSelf: 'flex-start',
    marginTop: s(8),
  },
});
