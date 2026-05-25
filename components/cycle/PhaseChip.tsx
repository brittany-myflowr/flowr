import { StyleSheet, Text, View } from 'react-native';

import { PhaseFlower } from '@/components/brand/PhaseFlower';
import { colors } from '@/constants/colors';
import { phases } from '@/constants/phases';
import { fonts } from '@/constants/typography';
import type { PhaseKey } from '@/constants/phases';

type PhaseChipProps = {
  phaseKey: PhaseKey;
};

export function PhaseChip({ phaseKey }: PhaseChipProps) {
  const phase = phases[phaseKey];

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: `${phase.color}22`, borderColor: `${phase.color}55` },
      ]}
    >
      <PhaseFlower color={phase.color} size={9} />
      <Text style={styles.label}>{phase.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    color: colors.navy,
  },
});
