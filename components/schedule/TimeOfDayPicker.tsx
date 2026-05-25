import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getTimeOfDayIcon } from '@/components/icons/TimeOfDayIcons';
import { colors } from '@/constants/colors';
import { TIME_OF_DAY_OPTIONS } from '@/constants/schedules';
import { formatTimeOfDay } from '@/constants/schedules';
import type { TimeOfDay } from '@/types';
import { fonts } from '@/constants/typography';

type TimeOfDayPickerProps = {
  value: TimeOfDay;
  onChange: (value: TimeOfDay) => void;
};

export function TimeOfDayPicker({ value, onChange }: TimeOfDayPickerProps) {
  return (
    <View style={styles.row}>
      {TIME_OF_DAY_OPTIONS.map((timeOfDay) => {
        const selected = value === timeOfDay;
        const iconColor = selected ? colors.white : colors.muted;

        return (
          <Pressable
            key={timeOfDay}
            onPress={() => onChange(timeOfDay)}
            style={[styles.tile, selected ? styles.tileSelected : styles.tileDefault]}
          >
            <View style={styles.icon}>{getTimeOfDayIcon(timeOfDay, iconColor)}</View>
            <Text style={[styles.label, selected ? styles.labelSelected : styles.labelDefault]}>
              {formatTimeOfDay(timeOfDay)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  tile: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  tileDefault: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  tileSelected: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  icon: {
    marginBottom: 3,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: 9,
    textAlign: 'center',
  },
  labelDefault: {
    color: colors.gray,
  },
  labelSelected: {
    color: colors.white,
  },
});
