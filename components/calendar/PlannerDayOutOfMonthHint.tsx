import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, fs } from '@/lib/scale';

type PlannerDayOutOfMonthHintProps = {
  selectedMonthLabel: string;
  onJumpToMonth: () => void;
};

export function PlannerDayOutOfMonthHint({
  selectedMonthLabel,
  onJumpToMonth,
}: PlannerDayOutOfMonthHintProps) {
  return (
    <Pressable
      onPress={onJumpToMonth}
      style={styles.wrap}
      accessibilityRole="button"
      accessibilityLabel={`Jump to ${selectedMonthLabel}`}
    >
      <Text style={styles.text}>
        Selected day is in {selectedMonthLabel}.{' '}
        <Text style={styles.link}>View that month</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: s(8),
    paddingVertical: s(6),
    paddingHorizontal: s(8),
    borderWidth: 1,
    borderColor: 'rgba(26,26,46,0.12)',
    backgroundColor: colors.bg,
  },
  text: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    lineHeight: fs(15),
    color: colors.muted,
  },
  link: {
    color: colors.blue,
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
});
