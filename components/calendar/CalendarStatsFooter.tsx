import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, fs } from '@/lib/scale';

type CalendarStatsFooterProps = {
  streak: number;
  daysThisMonth: number;
  monthProgress: number;
  monthLabel: string;
};

function buildStatsLine({
  streak,
  daysThisMonth,
  monthProgress,
  monthLabel,
}: CalendarStatsFooterProps) {
  const parts: string[] = [];

  if (streak > 0) {
    parts.push(`${streak}-day streak`);
  }

  parts.push(`${daysThisMonth} ${daysThisMonth === 1 ? 'day' : 'days'} done in ${monthLabel}`);

  if (monthProgress > 0) {
    parts.push(`${monthProgress}% complete`);
  }

  return parts.join(' · ');
}

export function CalendarStatsFooter(props: CalendarStatsFooterProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.line}>{buildStatsLine(props)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: s(6),
    paddingHorizontal: s(2),
    marginBottom: s(4),
  },
  line: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.muted,
    textAlign: 'center',
    lineHeight: fs(15),
  },
});
