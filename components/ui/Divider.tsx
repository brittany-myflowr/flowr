import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type DividerProps = {
  label?: string;
  large?: boolean;
  /** Light styling for use on gradient backgrounds */
  light?: boolean;
};

export function Divider({ label, large = false, light = false }: DividerProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.line, light && styles.lineLight]} />
      {label ? (
        <Text style={[styles.label, large && styles.labelLarge, light && styles.labelLight]}>
          {label}
        </Text>
      ) : null}
      <View style={[styles.line, light && styles.lineLight]} />
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
  labelLarge: {
    fontSize: fs(7.6),
  },
  lineLight: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  labelLight: {
    color: 'rgba(255,255,255,0.78)',
  },
});
