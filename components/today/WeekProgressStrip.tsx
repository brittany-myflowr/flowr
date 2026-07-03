import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { fonts } from '@/constants/typography';
import { fs, s } from '@/lib/scale';

export type WeekDay = {
  key: string;
  label: string;
  isToday: boolean;
  isComplete: boolean;
  hasProgress: boolean;
  isOffDay: boolean;
};

type WeekProgressStripProps = {
  days: WeekDay[];
  streak?: number;
  accentColor?: string;
};

export function WeekProgressStrip({ days, streak, accentColor }: WeekProgressStripProps) {
  const router = useRouter();
  const todayRingColor = accentColor ?? 'rgba(255,255,255,0.9)';

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => router.push('/(tabs)/calendar')}
        style={styles.strip}
        accessibilityRole="button"
        accessibilityLabel="View calendar week progress"
      >
        {days.map((day) => (
          <View key={day.key} style={styles.dayColumn}>
            <Text
              style={[
                styles.dayLabel,
                day.isToday && styles.dayLabelToday,
                day.isToday && styles.dayLabelTodayUnderline,
              ]}
            >
              {day.label}
            </Text>
            <View
              style={[
                styles.markerWrap,
                day.isToday && [styles.markerToday, { borderColor: todayRingColor }],
              ]}
            >
              {day.isComplete ? (
                <Daisy color="rgba(255,255,255,0.95)" size={s(11)} />
              ) : day.hasProgress ? (
                <Daisy color="rgba(255,255,255,0.55)" size={s(10)} opacity={0.85} />
              ) : (
                <View
                  style={[
                    styles.emptyDot,
                    day.isOffDay && styles.emptyDotOffDay,
                    day.isToday && styles.emptyDotToday,
                  ]}
                />
              )}
            </View>
          </View>
        ))}
      </Pressable>

      {streak && streak >= 2 ? (
        <Text style={styles.streak}>{streak}-day streak</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: s(4),
  },
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: s(2),
  },
  dayColumn: {
    alignItems: 'center',
    gap: s(3),
    minWidth: s(24),
  },
  dayLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    color: 'rgba(255,255,255,0.55)',
  },
  dayLabelToday: {
    color: 'rgba(255,255,255,0.98)',
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  dayLabelTodayUnderline: {
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(255,255,255,0.45)',
  },
  markerWrap: {
    width: s(16),
    height: s(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerToday: {
    borderWidth: s(1.25),
    borderRadius: s(8),
    borderColor: 'rgba(255,255,255,0.9)',
  },
  emptyDot: {
    width: s(6),
    height: s(6),
    borderRadius: s(3),
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  emptyDotToday: {
    borderColor: 'rgba(255,255,255,0.75)',
  },
  emptyDotOffDay: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.28)',
  },
  streak: {
    alignSelf: 'flex-start',
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    color: 'rgba(255,255,255,0.55)',
    paddingLeft: s(2),
  },
});
