import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type DividerProps = {
  label?: string;
};

export function Divider({ label }: DividerProps) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginVertical: vs(8),
  },
  line: {
    flex: 1,
    height: vs(1),
    backgroundColor: colors.border,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(7),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
  },
});
