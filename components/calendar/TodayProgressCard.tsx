import { StyleSheet, Text, View } from 'react-native';

import { categoryColors } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { TodayPeriodProgress } from '@/hooks/useTodayProgressByTimeOfDay';
import { s, vs, fs } from '@/lib/scale';

type TodayProgressCardProps = {
  period: TodayPeriodProgress;
};

export function TodayProgressCard({ period }: TodayProgressCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{period.label}</Text>
        <Text style={styles.count}>
          {period.done}/{period.total}
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${period.percent}%` }]} />
      </View>

      <View style={styles.chips}>
        {period.routines.map((routine) => {
          const categoryColor = categoryColors[routine.category];

          return (
            <View
              key={routine.routineId}
              style={[
                styles.chip,
                {
                  backgroundColor: `${categoryColor}28`,
                  borderColor: categoryColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: categoryColor },
                  routine.isFullyComplete && styles.chipTextComplete,
                ]}
              >
                {routine.routineName}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    marginBottom: s(6),
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s(5),
  },
  title: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(15.2),
    color: colors.navy,
  },
  count: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11.4),
    color: colors.blue,
  },
  track: {
    height: vs(4),
    borderRadius: s(4),
    backgroundColor: '#f0f0ee',
    marginBottom: s(6),
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.blue,
    borderRadius: s(4),
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(4),
  },
  chip: {
    paddingHorizontal: s(7),
    paddingVertical: vs(2),
    borderRadius: s(8),
    borderWidth: 1,
  },
  chipText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9.5),
  },
  chipTextComplete: {
    opacity: 0.65,
  },
});
