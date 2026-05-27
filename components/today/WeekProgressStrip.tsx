import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { fs, s } from '@/lib/scale';

type WeekDay = {
  key: string;
  label: string;
  isToday: boolean;
  isComplete: boolean;
  hasProgress: boolean;
  isOffDay: boolean;
};

type WeekProgressStripProps = {
  days: WeekDay[];
};

export function WeekProgressStrip({ days }: WeekProgressStripProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/calendar')}
      style={styles.strip}
      accessibilityRole="button"
      accessibilityLabel="View calendar week progress"
    >
      {days.map((day) => (
        <View key={day.key} style={styles.dayColumn}>
          <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>{day.label}</Text>
          <View
            style={[
              styles.dot,
              day.isOffDay && styles.dotOffDay,
              day.hasProgress && !day.isComplete && styles.dotPartial,
              day.isComplete && styles.dotComplete,
              day.isToday && styles.dotToday,
            ]}
          />
        </View>
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: s(4),
    marginTop: s(2),
    marginBottom: s(2),
  },
  dayColumn: {
    alignItems: 'center',
    gap: s(4),
    minWidth: s(24),
  },
  dayLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    color: 'rgba(255,255,255,0.55)',
  },
  dayLabelToday: {
    color: 'rgba(255,255,255,0.95)',
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  dot: {
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  dotToday: {
    borderColor: 'rgba(255,255,255,0.85)',
    borderWidth: s(1.5),
  },
  dotPartial: {
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotComplete: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: 'rgba(255,255,255,0.95)',
  },
  dotOffDay: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.28)',
  },
});
