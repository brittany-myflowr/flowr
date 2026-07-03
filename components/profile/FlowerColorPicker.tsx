import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { flowerColors, type FlowerColor } from '@/constants/flowerColors';
import { colors } from '@/constants/colors';
import { plannerCard, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type FlowerColorPickerProps = {
  selectedName: string;
  onSelect: (color: FlowerColor) => void;
};

export function FlowerColorPicker({ selectedName, onSelect }: FlowerColorPickerProps) {
  const selected = flowerColors.find((color) => color.name === selectedName) ?? flowerColors[2];

  return (
    <View style={[styles.container, plannerCard()]}>
      <View style={styles.swatches}>
        {flowerColors.map((color) => {
          const isSelected = color.name === selected.name;
          return (
            <Pressable
              key={color.name}
              onPress={() => onSelect(color)}
              style={[
                styles.swatch,
                isSelected && {
                  borderColor: color.stroke,
                },
              ]}
            >
              <Daisy color={color.stroke} size={s(20)} />
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
    padding: s(12),
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
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
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
