import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { plannerCardBorder } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type DividerProps = {
  label?: string;
  large?: boolean;
  /** Light styling for use on gradient backgrounds */
  light?: boolean;
  /** Crisp dark outline styling for planner pages like Today */
  outlined?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Divider({
  label,
  large = false,
  light = false,
  outlined = false,
  style,
}: DividerProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={[styles.line, light && styles.lineLight, outlined && styles.lineOutlined]} />
      {label ? (
        <Text
          style={[
            styles.label,
            large && styles.labelLarge,
            light && styles.labelLight,
            outlined && styles.labelOutlined,
          ]}
        >
          {label}
        </Text>
      ) : null}
      <View style={[styles.line, light && styles.lineLight, outlined && styles.lineOutlined]} />
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
    fontSize: fs(9),
  },
  lineLight: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  labelLight: {
    color: 'rgba(255,255,255,0.78)',
  },
  lineOutlined: {
    backgroundColor: plannerCardBorder,
  },
  labelOutlined: {
    fontFamily: fonts.dmSansMedium,
    fontWeight: '500',
    letterSpacing: s(2.4),
    color: colors.navy,
  },
});
