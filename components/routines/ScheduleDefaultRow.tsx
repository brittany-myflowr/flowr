import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

type ScheduleDefaultRowProps = {
  label: string;
  onCustomize?: () => void;
};

export function ScheduleDefaultRow({ label, onCustomize }: ScheduleDefaultRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Schedule</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{label}</Text>
        <Pressable onPress={onCustomize}>
          <Text style={styles.customize}>Customize</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: s(12),
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(5),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    backgroundColor: colors.light,
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: '#c8d9e6',
    gap: s(8),
  },
  value: {
    flex: 1,
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.navy,
  },
  customize: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.blue,
    textDecorationLine: 'underline',
    flexShrink: 0,
  },
});
