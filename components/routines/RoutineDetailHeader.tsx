import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { categoryColors } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import {
  formatFrequency,
  formatTimeOfDay,
} from '@/providers/RoutinesProvider';
import type { Routine } from '@/types';

type RoutineDetailHeaderProps = {
  routine: Routine;
  onBack?: () => void;
  onEditSchedule?: () => void;
};

export function RoutineDetailHeader({
  routine,
  onBack,
  onEditSchedule,
}: RoutineDetailHeaderProps) {
  const categoryColor = categoryColors[routine.category];

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <View style={styles.titleRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${categoryColor}28` }]}>
          <Daisy color={categoryColor} size={18} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.name}>{routine.name}</Text>
          <Text style={styles.subtitle}>
            {routine.category} · {routine.steps.length} steps
          </Text>
        </View>
      </View>

      <Pressable onPress={onEditSchedule} style={styles.scheduleChip}>
        <Text style={styles.scheduleText}>
          {formatFrequency(routine.schedule.frequency)} ·{' '}
          {formatTimeOfDay(routine.timeOfDay)} · Edit
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 18,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  back: {
    fontFamily: fonts.dmSans,
    fontSize: 10,
    color: colors.blue,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.lora,
    fontSize: 16,
    color: colors.navy,
  },
  subtitle: {
    marginTop: 1,
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.muted,
  },
  scheduleChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: '#c8d9e6',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scheduleText: {
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.blue,
  },
});
