import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type ChipProps = {
  label: string;
  selected?: boolean;
  small?: boolean;
  large?: boolean;
  form?: boolean;
  onPress?: () => void;
};

export function Chip({
  label,
  selected = false,
  small = false,
  large = false,
  form = false,
  onPress,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.chip,
        form && styles.chipForm,
        small && !large && !form && styles.chipSmall,
        large && !form && styles.chipLarge,
        selected ? styles.chipSelected : styles.chipDefault,
      ]}
    >
      <Text
        style={[
          styles.label,
          form && styles.labelForm,
          small && !large && !form && styles.labelSmall,
          large && !form && styles.labelLarge,
          selected ? styles.labelSelected : styles.labelDefault,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: s(11),
    paddingVertical: vs(5),
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
  },
  chipSmall: {
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
  },
  chipLarge: {
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
  },
  chipForm: {
    paddingHorizontal: s(10),
    paddingVertical: vs(9),
    borderRadius: plannerCornerRadius,
  },
  chipDefault: {
    backgroundColor: colors.white,
    borderColor: plannerCardBorder,
  },
  chipSelected: {
    backgroundColor: colors.navy,
    borderColor: 'transparent',
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
  },
  labelSmall: {
    fontSize: fs(8),
  },
  labelLarge: {
    fontSize: fs(9.5),
  },
  labelForm: {
    fontSize: fs(10),
  },
  labelDefault: {
    color: colors.gray,
  },
  labelSelected: {
    color: colors.white,
  },
});
