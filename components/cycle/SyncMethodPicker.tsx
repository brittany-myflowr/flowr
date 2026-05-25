import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons/ActionIcons';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { CycleSyncMethod } from '@/types';

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
            style={[styles.row, selected && styles.rowSelected]}
          >
            <View style={styles.copy}>
              <Text style={[styles.label, selected && styles.labelSelected]}>{method.label}</Text>
              <Text style={styles.description}>{method.description}</Text>
            </View>
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <CheckIcon size={10} color={colors.white} /> : null}
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
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: 6,
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
    fontSize: 12,
    color: colors.navy,
  },
  labelSelected: {
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  description: {
    marginTop: 1,
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.gray,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  counterBlock: {
    marginBottom: 10,
  },
  counterLabel: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 5,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  counterButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterSymbol: {
    fontFamily: fonts.dmSans,
    fontSize: 14,
    color: colors.navy,
  },
  counterValue: {
    minWidth: 50,
    textAlign: 'center',
    fontFamily: fonts.dmSansSemiBold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
  },
  counterUnit: {
    fontFamily: fonts.dmSans,
    fontSize: 10,
    fontWeight: '400',
    color: colors.gray,
  },
});
