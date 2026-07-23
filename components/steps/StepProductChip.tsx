import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { guidedFlowTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { fs, s, vs } from '@/lib/scale';

type StepProductLabelProps = {
  label: string;
  done?: boolean;
  style?: StyleProp<TextStyle>;
};

export function StepProductLabel({ label, done = false, style }: StepProductLabelProps) {
  return (
    <Text
      style={[styles.productLabel, done && styles.productLabelDone, style]}
      numberOfLines={1}
    >
      {label}
    </Text>
  );
}

type StepProductChipProps = {
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function StepProductChip({ label, style }: StepProductChipProps) {
  return (
    <View style={[styles.chip, style]}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

type StepProductChipButtonProps = {
  label: string;
  onPress: () => void;
  actionLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function StepProductChipButton({
  label,
  onPress,
  actionLabel,
  style,
}: StepProductChipButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, styles.chipButton, style]}
      accessibilityRole="button"
      accessibilityLabel={actionLabel ? `${label}, ${actionLabel}` : label}
    >
      <Text style={[styles.label, styles.chipButtonLabel]} numberOfLines={1}>
        {label}
      </Text>
      {actionLabel ? <Text style={styles.actionLabel}>{actionLabel}</Text> : null}
    </Pressable>
  );
}

type TagProductButtonProps = {
  onPress: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export function TagProductButton({
  onPress,
  label = '+ Tag a product',
  style,
}: TagProductButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tagButton, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.tagButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    borderRadius: plannerCornerRadius,
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    maxWidth: '100%',
  },
  chipButton: {
    paddingVertical: vs(6),
    paddingHorizontal: s(10),
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.navy,
  },
  chipButtonLabel: {
    flex: 1,
    fontSize: fs(13),
  },
  actionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.blue,
    textDecorationLine: 'underline',
    flexShrink: 0,
  },
  tagButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: plannerCardBorder,
    borderRadius: plannerCornerRadius,
    paddingHorizontal: s(10),
    paddingVertical: vs(6),
    alignItems: 'center',
  },
  tagButtonLabel: {
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.link,
    color: colors.navy,
  },
  productLabel: {
    marginTop: s(3),
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.navy,
  },
  productLabelDone: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
});
