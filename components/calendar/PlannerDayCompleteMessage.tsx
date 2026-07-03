import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type PlannerDayCompleteMessageProps = {
  isToday: boolean;
};

export function PlannerDayCompleteMessage({ isToday }: PlannerDayCompleteMessageProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.message}>
        {isToday ? 'All done for today!' : 'All steps completed for this day.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: vs(6),
  },
  message: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(10),
    fontWeight: '600',
    letterSpacing: s(0.3),
    color: colors.blue,
  },
});
