import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { Chip } from '@/components/ui/Chip';
import { categories, categoryColors, type Category } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import {
  formatFrequency,
  formatTimeOfDay,
} from '@/providers/RoutinesProvider';
import type { Routine } from '@/types';
import { s, vs, fs } from '@/lib/scale';

type RoutineDetailHeaderProps = {
  routine: Routine;
  onBack?: () => void;
  onEditSchedule?: () => void;
  onCategoryChange?: (category: Category) => void;
};

export function RoutineDetailHeader({
  routine,
  onBack,
  onEditSchedule,
  onCategoryChange,
}: RoutineDetailHeaderProps) {
  const categoryColor = categoryColors[routine.category];

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <View style={styles.titleRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${categoryColor}28` }]}>
          <Daisy color={categoryColor} size={s(18)} />
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

      <Text style={styles.fieldLabel}>Category</Text>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.categoryRow}
      >
        {categories.map((category) => (
          <Chip
            key={category}
            label={category}
            selected={routine.category === category}
            form
            onPress={
              onCategoryChange && routine.category !== category
                ? () => onCategoryChange(category)
                : undefined
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: s(18),
    paddingHorizontal: s(14),
    paddingBottom: s(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  back: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.blue,
    marginBottom: s(8),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    marginBottom: s(8),
  },
  iconWrap: {
    width: s(36),
    height: vs(36),
    borderRadius: s(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.lora,
    fontSize: fs(16),
    color: colors.navy,
  },
  subtitle: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.muted,
  },
  scheduleChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: '#c8d9e6',
    borderRadius: s(7),
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
  },
  scheduleText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.blue,
  },
  fieldLabel: {
    marginTop: s(10),
    marginBottom: s(6),
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    paddingRight: s(4),
  },
});
