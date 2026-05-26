import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type SelectableTileProps = {
  label: string;
  selected?: boolean;
  large?: boolean;
  onPress?: () => void;
};

export function SelectableTile({
  label,
  selected = false,
  large = false,
  onPress,
}: SelectableTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tile,
        large && styles.tileLarge,
        selected ? styles.tileSelected : styles.tileDefault,
      ]}
    >
      <Text
        style={[
          styles.label,
          large && styles.labelLarge,
          selected ? styles.labelSelected : styles.labelDefault,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    paddingVertical: vs(10),
    paddingHorizontal: s(4),
    borderRadius: s(10),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLarge: {
    paddingVertical: vs(12),
    paddingHorizontal: s(6),
    borderRadius: s(12),
  },
  tileDefault: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  tileSelected: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    textAlign: 'center',
  },
  labelLarge: {
    fontSize: fs(10.45),
  },
  labelDefault: {
    color: colors.gray,
  },
  labelSelected: {
    color: colors.white,
  },
});
