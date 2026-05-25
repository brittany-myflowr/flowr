import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { flowerColors, type FlowerColor } from '@/constants/flowerColors';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

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
              <Daisy color={color.stroke} size={17} />
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
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 8,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    fontSize: 9,
    color: colors.muted,
    textAlign: 'center',
  },
  selectedName: {
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
});
