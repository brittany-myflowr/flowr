import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

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
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    fontSize: 10,
  },
  labelSmall: {
    fontSize: 8,
  },
  labelDefault: {
    color: colors.gray,
  },
  labelSelected: {
    color: colors.white,
  },
});
