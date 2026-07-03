import { StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { fs, s } from '@/lib/scale';

type TodaySectionBarProps = {
  firstName?: string;
};

export function TodaySectionBar({ firstName }: TodaySectionBarProps) {
  return <Text style={styles.label}>{getTodaySectionBarLabel(firstName)}</Text>;
}

export function getTodaySectionBarLabel(firstName?: string) {
  const trimmed = firstName?.trim();
  if (trimmed) {
    return `${trimmed}'s Routines Today`;
  }
  return 'Your Routines Today';
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.lora,
    fontSize: fs(20),
    lineHeight: fs(24),
    color: colors.navy,
    includeFontPadding: false,
    marginTop: s(2),
    marginBottom: s(8),
    textAlign: 'center',
    width: '100%',
  },
});
