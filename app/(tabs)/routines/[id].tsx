import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeleteConfirmSheet } from '@/components/feedback/DeleteConfirmSheet';
import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { RoutineDetailHeader } from '@/components/routines/RoutineDetailHeader';
import { RoutineStepRow } from '@/components/routines/RoutineStepRow';
import { FullWidthButton } from '@/components/ui/Button';
import { ReorderableList } from '@/components/ui/ReorderableList';
import { colors } from '@/constants/colors';
import type { Category } from '@/constants/categories';
import { useRoutine, useRoutines } from '@/providers/RoutinesProvider';
import { useToast } from '@/providers/ToastProvider';
import type { Step } from '@/types';
import { s, vs } from '@/lib/scale';

type DeleteTarget =
  | { type: 'step'; stepId: string; stepName: string }
  | { type: 'routine' }
  | null;

export default function RoutineDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const routine = useRoutine(id);
  const { reorderSteps, removeStep, removeRoutine, updateRoutine } = useRoutines();
  const { showToast } = useToast();

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  if (!routine) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <SubPageHeader title="Routine" onBack={() => router.back()} />
        <InlineEmptyCard
          title="Routine not found"
          body="It may have been removed or this link is out of date."
        />
        <View style={styles.footerSpacer} />
        <FullWidthButton label="← Back to Routines" onPress={() => router.replace('/(tabs)/routines')} />
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

  const handleDragEnd = (data: Step[]) => {
    reorderSteps(routine.id, data);
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
        onNameChange={(name) => updateRoutine(routine.id, { name })}
      />

      <ReorderableList
        data={routine.steps}
        keyExtractor={(item) => item.id}
        onDragEnd={handleDragEnd}
        onItemPress={(item) => openStepDetail(item.id)}
        contentContainerStyle={styles.listContent}
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
            <FullWidthButton
              label="Remove Routine"
              variant="danger"
              onPress={() => setDeleteTarget({ type: 'routine' })}
            />
          </View>
        }
        renderItem={({ item, index, isActive, dragHandlers, dragTouchHandlers }) => (
          <RoutineStepRow
            step={item}
            index={index}
            isDragging={isActive}
            dragHandlers={dragHandlers}
            dragTouchHandlers={dragTouchHandlers}
            onDelete={() =>
              setDeleteTarget({ type: 'step', stepId: item.id, stepName: item.name })
            }
          />
        )}
      />

      <DeleteConfirmSheet
        visible={deleteTarget !== null}
        title={deleteTitle}
        message={deleteMessage}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
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
  listContent: {
    paddingHorizontal: s(12),
    paddingTop: s(4),
    paddingBottom: s(24),
  },
  footer: {
    marginTop: s(4),
  },
  footerSpacer: {
    height: vs(8),
  },
});
