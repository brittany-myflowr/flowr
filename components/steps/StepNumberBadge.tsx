import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { guidedFlowTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { fs, s } from '@/lib/scale';

type StepNumberBadgeProps = {
  number: number;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

const SIZES = {
  sm: { box: s(20), font: fs(9) },
  md: { box: s(22), font: guidedFlowTypography.stepNumber },
} as const;

export function StepNumberBadge({ number, size = 'sm', style }: StepNumberBadgeProps) {
  const dim = SIZES[size];

  return (
    <View style={[styles.badge, { width: dim.box, height: dim.box }, style]}>
      <Text style={[styles.text, { fontSize: dim.font }]}>{number}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
    color: colors.navy,
  },
});
