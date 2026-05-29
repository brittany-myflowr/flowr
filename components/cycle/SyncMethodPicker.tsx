import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons/ActionIcons';
import { colors } from '@/constants/colors';
import { plannerCard, plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import type { CycleSyncMethod } from '@/types';
import { s, vs, fs } from '@/lib/scale';

const METHODS: { value: CycleSyncMethod; label: string; description: string }[] = [
  {
    value: 'menstrual',
    label: 'Manual Cycle',
    description: 'Based on your period start date',
  },
  {
    value: 'lunar',
    label: 'Lunar Cycle',
    description: 'New moon = Day 1, always 28 days',
  },
];

type SyncMethodPickerProps = {
  value: CycleSyncMethod;
  onChange: (method: CycleSyncMethod) => void;
};

export function SyncMethodPicker({ value, onChange }: SyncMethodPickerProps) {
  return (
    <View>
      {METHODS.map((method) => {
        const selected = value === method.value;

        return (
          <Pressable
            key={method.value}
            onPress={() => onChange(method.value)}
            style={[styles.row, plannerCard(), selected && styles.rowSelected]}
          >
            <View style={styles.copy}>
              <Text style={[styles.label, selected && styles.labelSelected]}>{method.label}</Text>
              <Text style={styles.description}>{method.description}</Text>
            </View>
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <CheckIcon size={s(10)} color={colors.white} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

type CounterRowProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
};

export function CounterRow({
  label,
  value,
  min,
  max,
  unit = 'days',
  onChange,
}: CounterRowProps) {
  return (
    <View style={styles.counterBlock}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterRow}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          style={styles.counterButton}
        >
          <Text style={styles.counterSymbol}>−</Text>
        </Pressable>
        <Text style={styles.counterValue}>
          {value} <Text style={styles.counterUnit}>{unit}</Text>
        </Text>
        <Pressable
          onPress={() => onChange(Math.min(max, value + 1))}
          style={styles.counterButton}
        >
          <Text style={styles.counterSymbol}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    marginBottom: s(6),
  },
  rowSelected: {
    borderColor: colors.blue,
    backgroundColor: colors.light,
  },
  copy: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.navy,
  },
  labelSelected: {
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  description: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.gray,
  },
  radio: {
    width: s(18),
    height: vs(18),
    borderRadius: plannerCornerRadius,
    borderWidth: 1.5,
    borderColor: plannerCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  counterBlock: {
    marginBottom: s(10),
  },
  counterLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(5),
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
  },
  counterButton: {
    width: s(28),
    height: vs(28),
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterSymbol: {
    fontFamily: fonts.dmSans,
    fontSize: fs(14),
    color: colors.navy,
  },
  counterValue: {
    minWidth: s(50),
    textAlign: 'center',
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(14),
    fontWeight: '600',
    color: colors.navy,
  },
  counterUnit: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    fontWeight: '400',
    color: colors.gray,
  },
});
