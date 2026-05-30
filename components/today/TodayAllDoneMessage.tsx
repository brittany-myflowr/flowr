import { StyleSheet, Text, View } from 'react-native';

import { upNextReservedSpaceStyle } from '@/components/today/UpNextCard';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { fs } from '@/lib/scale';

export function TodayAllDoneMessage() {
  return (
    <View style={[upNextReservedSpaceStyle.placeholder, styles.wrap]}>
      <Text style={styles.message}>All done!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
  },
  message: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(15),
    color: colors.navy,
    textAlign: 'center',
  },
});
