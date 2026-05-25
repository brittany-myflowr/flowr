import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type SelectableTileProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function SelectableTile({ label, selected = false, onPress }: SelectableTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tile, selected ? styles.tileSelected : styles.tileDefault]}
    >
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelDefault]}>
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
  labelDefault: {
    color: colors.gray,
  },
  labelSelected: {
    color: colors.white,
  },
});
