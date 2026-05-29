import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { Chip } from '@/components/ui/Chip';
import { categories, categoryColors, type Category } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
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
  onNameChange?: (name: string) => void;
};

export function RoutineDetailHeader({
  routine,
  onBack,
  onEditSchedule,
  onCategoryChange,
  onNameChange,
}: RoutineDetailHeaderProps) {
  const categoryColor = categoryColors[routine.category];
  const [isEditingName, setIsEditingName] = useState(false);

  const finishEditingName = () => {
    setIsEditingName(false);
    const trimmed = routine.name.trim();
    if (!trimmed && onNameChange) {
      onNameChange('My Routine');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <View style={styles.titleRow}>
        <Daisy color={categoryColor} size={s(18)} />
        <Pressable
          style={styles.meta}
          onPress={onNameChange ? () => setIsEditingName(true) : undefined}
        >
          {isEditingName ? (
            <TextInput
              value={routine.name}
              onChangeText={onNameChange}
              onBlur={finishEditingName}
              autoFocus
              style={styles.nameInput}
              placeholder="Routine name"
              placeholderTextColor={colors.muted}
            />
          ) : (
            <>
              <Text style={styles.name}>{routine.name}</Text>
              {onNameChange ? <Text style={styles.editHint}>tap to edit</Text> : null}
            </>
          )}
          {!isEditingName ? (
            <Text style={styles.subtitle}>
              {routine.category} · {routine.steps.length} steps
            </Text>
          ) : null}
        </Pressable>
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
    borderBottomColor: plannerCardBorder,
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
  meta: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.lora,
    fontSize: fs(16),
    color: colors.navy,
  },
  nameInput: {
    fontFamily: fonts.lora,
    fontSize: fs(16),
    color: colors.navy,
    padding: 0,
  },
  editHint: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    color: '#c8d9e6',
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
    borderRadius: plannerCornerRadius,
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
