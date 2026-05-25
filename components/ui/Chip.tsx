import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type ChipProps = {
  label: string;
  selected?: boolean;
  small?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected = false, small = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.chip,
        small && styles.chipSmall,
        selected ? styles.chipSelected : styles.chipDefault,
      ]}
    >
      <Text
        style={[
          styles.label,
          small && styles.labelSmall,
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
    borderRadius: s(14),
    borderWidth: 1,
  },
  chipSmall: {
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
  },
  chipDefault: {
    backgroundColor: colors.white,
    borderColor: colors.border,
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
  labelDefault: {
    color: colors.gray,
  },
  labelSelected: {
    color: colors.white,
  },
});
