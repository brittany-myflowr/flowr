import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeleteConfirmSheet } from '@/components/feedback/DeleteConfirmSheet';
import { RoutineDetailHeader } from '@/components/routines/RoutineDetailHeader';
import { RoutineStepRow } from '@/components/routines/RoutineStepRow';
import { StepReminderSheet } from '@/components/routines/StepReminderSheet';
import { FullWidthButton } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import type { Category } from '@/constants/categories';
import { fonts } from '@/constants/typography';
import { useRoutine, useRoutines } from '@/providers/RoutinesProvider';
import { useToast } from '@/providers/ToastProvider';
import type { Step, StepReminder } from '@/types';
import { s, vs, fs } from '@/lib/scale';

type DeleteTarget =
  | { type: 'step'; stepId: string; stepName: string }
  | { type: 'routine' }
  | null;

type ReminderTarget = {
  stepId: string;
  stepName: string;
} | null;

function moveStep(steps: Step[], from: number, to: number) {
  if (to < 0 || to >= steps.length || from === to) return steps;
  const next = [...steps];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function RoutineDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const routine = useRoutine(id);
  const { reorderSteps, removeStep, removeRoutine, updateStep, updateStepReminder, updateRoutine } =
    useRoutines();
  const { showToast } = useToast();

  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [reminderTarget, setReminderTarget] = useState<ReminderTarget>(null);

  if (!routine) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <FullWidthButton label="← Back to Routines" onPress={() => router.back()} />
      </View>
    );
  }

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'routine') {
      removeRoutine(routine.id);
      showToast('Routine removed', 'destructive');
      router.replace('/(tabs)/routines');
    } else {
      removeStep(routine.id, deleteTarget.stepId);
      showToast('Step removed', 'destructive');
    }

    setDeleteTarget(null);
  };

  const deleteTitle =
    deleteTarget?.type === 'routine' ? 'Remove routine?' : 'Remove step?';
  const deleteMessage =
    deleteTarget?.type === 'routine'
      ? `${routine.name} and all of its steps will be permanently deleted.`
      : `${deleteTarget?.stepName ?? 'This step'} will be permanently deleted from ${routine.name}.`;

  const openRoutineSchedule = () => {
    router.push({
      pathname: '/(tabs)/routines/schedule',
      params: { routineId: routine.id },
    });
  };

  const openStepSchedule = (stepId: string) => {
    router.push({
      pathname: '/(tabs)/routines/schedule',
      params: { routineId: routine.id, stepId },
    });
  };

  const openAddStep = () => {
    router.push({
      pathname: '/(tabs)/routines/add-step',
      params: { routineId: routine.id },
    });
  };

  const openTagProduct = (stepId: string) => {
    router.push({
      pathname: '/(tabs)/routines/tag-product',
      params: { routineId: routine.id, stepId },
    });
  };

  const reminderStep = reminderTarget
    ? routine.steps.find((step) => step.id === reminderTarget.stepId)
    : undefined;

  const handleSaveReminder = async (reminder: StepReminder) => {
    if (!reminderTarget) return;

    const synced = await updateStepReminder(routine.id, reminderTarget.stepId, reminder);

    if (reminder.enabled && !synced) {
      showToast('Enable notifications in Settings');
    } else {
      showToast(reminder.enabled ? 'Reminder saved' : 'Reminder off');
    }

    setReminderTarget(null);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <RoutineDetailHeader
        routine={routine}
        onBack={() => router.back()}
        onEditSchedule={openRoutineSchedule}
        onCategoryChange={(category: Category) => {
          updateRoutine(routine.id, { category });
          showToast('Category updated');
        }}
      />

      {reorderMode ? (
        <View style={styles.reorderBanner}>
          <Text style={styles.reorderBannerText}>Reorder mode — use ↑ ↓ or tap handle again to done</Text>
          <Text onPress={() => setReorderMode(false)} style={styles.reorderDone}>
            Done
          </Text>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {routine.steps.map((step, index) => (
          <RoutineStepRow
            key={step.id}
            step={step}
            index={index}
            total={routine.steps.length}
            reorderMode={reorderMode}
            isEditing={editingStepId === step.id}
            onLongPressDrag={() => setReorderMode(true)}
            onMoveUp={() => reorderSteps(routine.id, moveStep(routine.steps, index, index - 1))}
            onMoveDown={() => reorderSteps(routine.id, moveStep(routine.steps, index, index + 1))}
            onPress={() => setEditingStepId(step.id)}
            onChangeName={(name) => updateStep(routine.id, step.id, { name })}
            onBlurName={() => setEditingStepId(null)}
            onDelete={() =>
              setDeleteTarget({ type: 'step', stepId: step.id, stepName: step.name })
            }
            onCustomSchedule={() => openStepSchedule(step.id)}
            onTagProduct={() => openTagProduct(step.id)}
            onReminder={() =>
              setReminderTarget({ stepId: step.id, stepName: step.name })
            }
            reminderEnabled={step.reminder?.enabled ?? false}
          />
        ))}

        <View style={styles.footer}>
          <FullWidthButton label="+ Add Step" onPress={openAddStep} />
          <View style={styles.footerSpacer} />
          <FullWidthButton
            label="Remove Routine"
            variant="danger"
            onPress={() => setDeleteTarget({ type: 'routine' })}
          />
        </View>
      </ScrollView>

      <DeleteConfirmSheet
        visible={deleteTarget !== null}
        title={deleteTitle}
        message={deleteMessage}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <StepReminderSheet
        visible={reminderTarget !== null}
        stepName={reminderTarget?.stepName ?? ''}
        routineName={routine.name}
        reminder={reminderStep?.reminder}
        timeOfDay={reminderStep?.schedule?.timeOfDay ?? routine.schedule.timeOfDay}
        onSave={handleSaveReminder}
        onCancel={() => setReminderTarget(null)}
      />
    </View>
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
  },
  reorderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
    backgroundColor: colors.light,
    borderBottomWidth: 1,
    borderBottomColor: '#c8d9e6',
  },
  reorderBannerText: {
    flex: 1,
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.blue,
  },
  reorderDone: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(10),
    color: colors.navy,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: s(12),
    paddingTop: s(10),
    paddingBottom: s(24),
  },
  footer: {
    marginTop: s(4),
  },
  footerSpacer: {
    height: vs(8),
  },
});
