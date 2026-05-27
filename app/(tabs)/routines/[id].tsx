import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeleteConfirmSheet } from '@/components/feedback/DeleteConfirmSheet';
import { RoutineDetailHeader } from '@/components/routines/RoutineDetailHeader';
import { RoutineStepRow } from '@/components/routines/RoutineStepRow';
import { FullWidthButton } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import type { Category } from '@/constants/categories';
import { fonts } from '@/constants/typography';
import { useRoutine, useRoutines } from '@/providers/RoutinesProvider';
import { useToast } from '@/providers/ToastProvider';
import type { Step } from '@/types';
import { s, vs, fs } from '@/lib/scale';

type DeleteTarget =
  | { type: 'step'; stepId: string; stepName: string }
  | { type: 'routine' }
  | null;

export default function RoutineDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const routine = useRoutine(id);
  const { reorderSteps, removeStep, removeRoutine, updateStep, updateRoutine } = useRoutines();
  const { showToast } = useToast();

  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

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

  const handleDragEnd = ({ data }: { data: Step[] }) => {
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

      <View style={styles.reorderHint}>
        <Text style={styles.reorderHintText}>Drag the handle to reorder steps</Text>
      </View>

      <DraggableFlatList
        data={routine.steps}
        keyExtractor={(item) => item.id}
        onDragEnd={handleDragEnd}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          <View style={styles.footer}>
            <FullWidthButton label="+ Add Step" onPress={openAddStep} />
            <View style={styles.footerSpacer} />
            <FullWidthButton
              label="Remove Routine"
              variant="danger"
              onPress={() => setDeleteTarget({ type: 'routine' })}
            />
          </View>
        }
        renderItem={({ item, drag, isActive, getIndex }) => (
          <ScaleDecorator>
            <RoutineStepRow
              step={item}
              index={getIndex() ?? 0}
              isDragging={isActive}
              isEditing={editingStepId === item.id}
              onDrag={drag}
              onPress={() => setEditingStepId(item.id)}
              onChangeName={(name) => updateStep(routine.id, item.id, { name })}
              onBlurName={() => setEditingStepId(null)}
              onDelete={() =>
                setDeleteTarget({ type: 'step', stepId: item.id, stepName: item.name })
              }
              onCustomSchedule={() => openStepSchedule(item.id)}
              onTagProduct={() => openTagProduct(item.id)}
            />
          </ScaleDecorator>
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
  reorderHint: {
    paddingHorizontal: s(14),
    paddingBottom: s(6),
  },
  reorderHintText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.blue,
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
