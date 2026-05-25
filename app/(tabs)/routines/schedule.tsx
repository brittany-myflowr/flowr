import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { ScheduleEditorForm } from '@/components/schedule/ScheduleEditorForm';
import { FullWidthButton } from '@/components/ui/Button';
import { cloneSchedule } from '@/constants/schedules';
import { colors } from '@/constants/colors';
import { useRoutine, useRoutines } from '@/providers/RoutinesProvider';
import { useToast } from '@/providers/ToastProvider';
import type { Schedule } from '@/types';

export default function ScheduleEditorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { routineId, stepId, draft } = useLocalSearchParams<{
    routineId: string;
    stepId?: string;
    draft?: string;
  }>();
  const routine = useRoutine(routineId);
  const {
    updateRoutineSchedule,
    updateStepSchedule,
    setPendingAddStepSchedule,
    pendingAddStepSchedule,
  } = useRoutines();
  const { showToast } = useToast();

  const isDraft = draft === '1';

  if (!routine) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <FullWidthButton label="← Back" onPress={() => router.back()} />
      </View>
    );
  }

  const step = stepId ? routine.steps.find((item) => item.id === stepId) : undefined;

  if (stepId && !step) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <FullWidthButton label="← Back" onPress={() => router.back()} />
      </View>
    );
  }

  const isStepSchedule = Boolean(step) && !isDraft;
  const initialSchedule = cloneSchedule(
    isDraft
      ? (pendingAddStepSchedule ?? routine.schedule)
      : (step?.schedule ?? routine.schedule),
  );

  const title = isDraft
    ? 'New Step · Custom Schedule'
    : isStepSchedule
      ? `${step?.name} · Custom Schedule`
      : `${routine.name} - Default Schedule`;

  const handleSave = (schedule: Schedule) => {
    if (isDraft) {
      setPendingAddStepSchedule(schedule);
      router.back();
      return;
    }

    if (isStepSchedule && step) {
      updateStepSchedule(routine.id, step.id, schedule);
    } else {
      updateRoutineSchedule(routine.id, schedule);
    }
    showToast('Schedule updated');
    router.back();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <SubPageHeader
        subtitle="Schedule"
        title={title}
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ScheduleEditorForm initialSchedule={initialSchedule} onSave={handleSave} />
      </ScrollView>
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
    paddingHorizontal: 14,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
  },
});
