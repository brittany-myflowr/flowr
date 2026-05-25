import { StyleSheet, Text, View } from 'react-native';

import { PhaseFlower } from '@/components/brand/PhaseFlower';
import { colors } from '@/constants/colors';
import { phases } from '@/constants/phases';
import { fonts } from '@/constants/typography';
import type { PhaseKey } from '@/constants/phases';
import { s, vs, fs } from '@/lib/scale';

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
      <PhaseFlower color={phase.color} size={s(9)} />
      <Text style={styles.label}>{phase.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(2),
    borderRadius: s(5),
    borderWidth: 1,
    paddingHorizontal: s(5),
    paddingVertical: vs(1),
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    color: colors.navy,
  },
});
