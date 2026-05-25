import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { WEEKDAY_LABELS } from '@/constants/schedules';
import { fonts } from '@/constants/typography';

type WeekDayPickerProps = {
  selectedDays: number[];
  onChange: (days: number[]) => void;
};

export function WeekDayPicker({ selectedDays, onChange }: WeekDayPickerProps) {
  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      onChange(selectedDays.filter((day) => day !== dayIndex));
      return;
    }
    onChange([...selectedDays, dayIndex].sort((a, b) => a - b));
  };

  return (
    <View style={styles.grid}>
      {WEEKDAY_LABELS.map((label, index) => {
        const selected = selectedDays.includes(index);
        return (
          <Pressable
            key={`${label}-${index}`}
            onPress={() => toggleDay(index)}
            style={[styles.day, selected ? styles.daySelected : styles.dayDefault]}
          >
            <Text style={[styles.label, selected ? styles.labelSelected : styles.labelDefault]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  day: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDefault: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
  },
  daySelected: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: 9,
  },
  labelDefault: {
    color: colors.gray,
  },
  labelSelected: {
    color: colors.white,
  },
});
