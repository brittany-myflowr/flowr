import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeleteConfirmSheet } from '@/components/feedback/DeleteConfirmSheet';
import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { ScheduleDefaultRow } from '@/components/routines/ScheduleDefaultRow';
import { RoutineStepRow } from '@/components/routines/RoutineStepRow';
import { FullWidthButton } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { ReorderableList } from '@/components/ui/ReorderableList';
import { categories, type Category } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { formatSchedulePreview } from '@/constants/schedules';
import { fonts } from '@/constants/typography';
import { useRoutine, useRoutines } from '@/providers/RoutinesProvider';
import { useToast } from '@/providers/ToastProvider';
import type { Step } from '@/types';
import { s, vs, fs } from '@/lib/scale';

type DeleteTarget = { stepId: string; stepName: string } | null;

export default function EditRoutineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const routine = useRoutine(routineId ?? '');
  const { updateRoutine, reorderSteps, removeStep } = useRoutines();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  useEffect(() => {
    if (!routine) return;
    setName(routine.name);
    setDescription(routine.description ?? '');
    setCategoryIndex(Math.max(0, categories.indexOf(routine.category)));
  }, [routine?.id]);

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  if (!routine) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <SubPageHeader title="Edit Routine" onBack={() => router.back()} />
        <InlineEmptyCard
          title="Routine not found"
          body="It may have been removed or this link is out of date."
        />
        <FullWidthButton
          label="← Back to Routines"
          onPress={() => router.replace('/(tabs)/routines')}
        />
      </View>
    );
  }

  const openScheduleEditor = () => {
    router.push({
      pathname: '/(tabs)/routines/schedule',
      params: { routineId: routine.id },
    });
  };

  const openAddStep = () => {
    router.push({
      pathname: '/(tabs)/routines/add-step',
      params: { routineId: routine.id },
    });
  };

  const openStepDetail = (stepId: string) => {
    router.push({
      pathname: '/(tabs)/routines/step/[id]',
      params: { id: stepId, routineId: routine.id },
    });
  };

  const handleSave = () => {
    if (!canSave) return;

    updateRoutine(routine.id, {
      name: name.trim(),
      description: description.trim(),
      category: categories[categoryIndex] as Category,
    });
    showToast('Routine saved');
    router.back();
  };

  const confirmDeleteStep = () => {
    if (!deleteTarget) return;
    removeStep(routine.id, deleteTarget.stepId);
    showToast('Step removed', 'destructive');
    setDeleteTarget(null);
  };

  const handleDragEnd = (data: Step[]) => {
    reorderSteps(routine.id, data);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SubPageHeader title="Edit Routine" onBack={() => router.back()} />

      <ReorderableList
        data={routine.steps}
        keyExtractor={(item) => item.id}
        onDragEnd={handleDragEnd}
        onItemPress={(item) => openStepDetail(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerFields}>
            <FormField
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Morning Skincare"
              autoCapitalize="words"
            />

            <FormField
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Add a description (optional)"
              autoCapitalize="sentences"
              autoCorrect
              multiline
              style={styles.descriptionInput}
            />

            <FormField
              label="Category"
              chips={[...categories]}
              selectedChipIndex={categoryIndex}
              onChipPress={setCategoryIndex}
            />

            <ScheduleDefaultRow
              label={formatSchedulePreview(routine.schedule)}
              onCustomize={openScheduleEditor}
            />

            <Text style={styles.sectionLabel}>Steps</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {routine.steps.length === 0 ? (
              <InlineEmptyCard
                compact
                title="No steps yet"
                body="Add your first step to start building this routine."
              />
            ) : null}
            <FullWidthButton label="+ Add Step" onPress={openAddStep} />
            <View style={styles.footerSpacer} />
            <FullWidthButton label="Save Changes" onPress={handleSave} disabled={!canSave} />
          </View>
        }
        renderItem={({ item, index, isActive, dragHandlers, dragTouchHandlers }) => (
          <RoutineStepRow
            step={item}
            index={index}
            editable
            isDragging={isActive}
            dragHandlers={dragHandlers}
            dragTouchHandlers={dragTouchHandlers}
            onDelete={() =>
              setDeleteTarget({ stepId: item.id, stepName: item.name })
            }
          />
        )}
      />

      <DeleteConfirmSheet
        visible={deleteTarget !== null}
        title="Remove step?"
        message={`${deleteTarget?.stepName ?? 'This step'} will be permanently deleted from ${routine.name}.`}
        onConfirm={confirmDeleteStep}
        onCancel={() => setDeleteTarget(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    justifyContent: 'center',
    paddingHorizontal: s(14),
    gap: vs(12),
  },
  listContent: {
    paddingHorizontal: s(14),
    paddingTop: s(14),
    paddingBottom: s(24),
  },
  headerFields: {
    marginBottom: s(4),
  },
  descriptionInput: {
    minHeight: vs(64),
    textAlignVertical: 'top',
  },
  sectionLabel: {
    marginTop: s(4),
    marginBottom: s(8),
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    letterSpacing: s(1.5),
    textTransform: 'uppercase',
    color: colors.muted,
  },
  footer: {
    marginTop: s(4),
  },
  footerSpacer: {
    height: vs(8),
  },
});
