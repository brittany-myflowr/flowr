import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { TodayPeriodProgress } from '@/hooks/useTodayProgressByTimeOfDay';

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
        {period.steps.map(({ step }) => (
          <View
            key={step.id}
            style={[styles.chip, step.done ? styles.chipDone : styles.chipPending]}
          >
            <Text style={[styles.chipText, step.done ? styles.chipTextDone : styles.chipTextPending]}>
              {step.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: 13,
    color: colors.navy,
  },
  count: {
    fontFamily: fonts.dmSans,
    fontSize: 10,
    color: colors.blue,
  },
  track: {
    height: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0ee',
    marginBottom: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.blue,
    borderRadius: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipDone: {
    backgroundColor: colors.light,
    borderColor: '#c8d9e6',
  },
  chipPending: {
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
  },
  chipText: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
  },
  chipTextDone: {
    color: colors.blue,
  },
  chipTextPending: {
    color: colors.gray,
  },
});
