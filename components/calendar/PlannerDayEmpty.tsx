import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type PlannerDayEmptyProps = {
  isToday: boolean;
  isFuture: boolean;
};

export function PlannerDayEmpty({ isToday, isFuture }: PlannerDayEmptyProps) {
  const title = isToday
    ? 'Nothing on the books today'
    : isFuture
      ? 'Nothing planned yet'
      : 'No routines scheduled';

  const body = isToday
    ? 'Your active routines have no steps for today. Enjoy the open space.'
    : isFuture
      ? 'Steps from your active routines will appear here when this day arrives.'
      : 'No steps from your routines were scheduled for this day.';

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: vs(8),
    gap: s(4),
  },
  title: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(13),
    color: colors.navy,
  },
  body: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10.5),
    lineHeight: fs(16),
    color: colors.muted,
  },
});
