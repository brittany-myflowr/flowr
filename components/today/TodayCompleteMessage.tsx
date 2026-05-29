import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { fs, s } from '@/lib/scale';

type TodayCompleteMessageProps = {
  streak: number;
};

export function TodayCompleteMessage({ streak }: TodayCompleteMessageProps) {
  const message =
    streak > 0 ? `Today is complete · ${streak}-day streak` : 'Today is complete';

  return (
    <View style={styles.wrap}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: s(10),
  },
  message: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(15),
    color: colors.navy,
  },
});
