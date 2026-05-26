import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { formatDisplayDate, shiftIsoDate } from '@/lib/cycle';
import { formatDateKey } from '@/lib/dateKey';
import { s, vs, fs } from '@/lib/scale';

type DateStepperRowProps = {
  label?: string;
  value: string;
  onChange: (isoDate: string) => void;
};

export function DateStepperRow({ label, value, onChange }: DateStepperRowProps) {
  const isoDate = value || formatDateKey(new Date());

  return (
    <View style={styles.block}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <Pressable
          onPress={() => onChange(shiftIsoDate(isoDate, -1))}
          style={styles.button}
          hitSlop={4}
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{formatDisplayDate(isoDate)}</Text>
        <Pressable
          onPress={() => onChange(shiftIsoDate(isoDate, 1))}
          style={styles.button}
          hitSlop={4}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: s(12),
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(6),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: s(10),
    paddingHorizontal: s(10),
    paddingVertical: vs(8),
  },
  button: {
    width: s(28),
    height: vs(28),
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  buttonText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(16),
    color: colors.navy,
    lineHeight: fs(18),
  },
  value: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.cardTitle,
    fontSize: fs(13),
    color: colors.navy,
  },
});
