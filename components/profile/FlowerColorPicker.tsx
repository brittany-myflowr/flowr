import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { flowerColors, type FlowerColor } from '@/constants/flowerColors';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type FlowerColorPickerProps = {
  selectedName: string;
  onSelect: (color: FlowerColor) => void;
};

export function FlowerColorPicker({ selectedName, onSelect }: FlowerColorPickerProps) {
  const selected = flowerColors.find((color) => color.name === selectedName) ?? flowerColors[2];

  return (
    <View style={styles.container}>
      <View style={styles.swatches}>
        {flowerColors.map((color) => {
          const isSelected = color.name === selected.name;
          return (
            <Pressable
              key={color.name}
              onPress={() => onSelect(color)}
              style={[
                styles.swatch,
                { backgroundColor: color.bg },
                isSelected && {
                  borderColor: color.stroke,
                  shadowColor: color.stroke,
                },
              ]}
            >
              <Daisy color={color.stroke} size={s(17)} />
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.selectedLabel}>
        Selected:{' '}
        <Text style={[styles.selectedName, { color: selected.stroke }]}>{selected.name}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: s(12),
    padding: s(12),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: s(12),
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(7),
    marginBottom: s(8),
  },
  swatch: {
    width: s(34),
    height: vs(34),
    borderRadius: s(17),
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 2,
  },
  selectedLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.muted,
    textAlign: 'center',
  },
  selectedName: {
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
});
