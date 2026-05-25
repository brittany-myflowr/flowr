import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { Verdict } from '@/types';
import { s, vs, fs } from '@/lib/scale';

const VERDICTS: Verdict[] = ['Love It', 'Like It', 'Not For Me'];

type VerdictPickerProps = {
  value: Verdict;
  onChange: (verdict: Verdict) => void;
};

export function VerdictPicker({ value, onChange }: VerdictPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Verdict</Text>
      <View style={styles.row}>
        {VERDICTS.map((verdict) => {
          const selected = value === verdict;
          return (
            <Pressable
              key={verdict}
              onPress={() => onChange(verdict)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {verdict}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: s(16),
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(7),
  },
  row: {
    flexDirection: 'row',
    gap: s(6),
  },
  option: {
    flex: 1,
    paddingVertical: vs(9),
    paddingHorizontal: s(4),
    borderRadius: s(14),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  optionText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.gray,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: colors.white,
  },
});
