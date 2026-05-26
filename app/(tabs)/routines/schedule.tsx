import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { ScheduleEditorForm } from '@/components/schedule/ScheduleEditorForm';
import { FullWidthButton } from '@/components/ui/Button';
import { cloneSchedule, defaultScheduleForTimeOfDay } from '@/constants/schedules';
import { colors } from '@/constants/colors';
import { useRoutine, useRoutines } from '@/providers/RoutinesProvider';
import { useToast } from '@/providers/ToastProvider';
import type { Schedule, ScheduleFrequency, TimeOfDay } from '@/types';
import { s } from '@/lib/scale';

export default function ScheduleEditorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    routineId,
    stepId,
    draft,
    guided,
    stepIndex,
    stepName,
    timeOfDay,
    frequency,
  } = useLocalSearchParams<{
    routineId?: string;
    stepId?: string;
    draft?: string;
    guided?: string;
    stepIndex?: string;
    stepName?: string;
    timeOfDay?: TimeOfDay;
    frequency?: ScheduleFrequency;
  }>();
  const routineFromStore = useRoutine(routineId ?? '');
  const routine = routineId ? routineFromStore : undefined;
  const {
    updateRoutineSchedule,
    updateStepSchedule,
    setPendingAddStepSchedule,
    pendingAddStepSchedule,
    pendingGuidedStepScheduleInit,
    setPendingGuidedStepScheduleResult,
    setPendingGuidedStepScheduleInit,
  } = useRoutines();
  const { showToast } = useToast();

  const isGuided = guided === '1';
  const isDraft = draft === '1';
  const guidedInitialScheduleRef = useRef<Schedule | null>(null);

  if (isGuided && guidedInitialScheduleRef.current === null) {
    const guidedTimeOfDay = timeOfDay ?? 'morning';
    const guidedFrequency = frequency ?? 'daily';
    const fallback = {
      ...defaultScheduleForTimeOfDay(guidedTimeOfDay),
      frequency: guidedFrequency,
    };
    guidedInitialScheduleRef.current = cloneSchedule(
      pendingGuidedStepScheduleInit ?? fallback,
    );
  }

  if (isGuided && guidedInitialScheduleRef.current) {
    const parsedStepIndex = Number(stepIndex ?? 0);

    const handleGuidedSave = (schedule: Schedule) => {
      setPendingGuidedStepScheduleResult({ stepIndex: parsedStepIndex, schedule });
      setPendingGuidedStepScheduleInit(null);
      router.back();
    };

    const handleGuidedBack = () => {
      setPendingGuidedStepScheduleInit(null);
      router.back();
    };

    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <SubPageHeader
          subtitle="Schedule"
          title={stepName ? `${stepName} · Custom Schedule` : 'Step · Custom Schedule'}
          onBack={handleGuidedBack}
        />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ScheduleEditorForm
            initialSchedule={guidedInitialScheduleRef.current}
            onSave={handleGuidedSave}
          />
        </ScrollView>
      </View>
    );
  }

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
    paddingHorizontal: s(14),
  },
  content: {
    paddingHorizontal: s(14),
    paddingTop: s(12),
    paddingBottom: s(24),
  },
});
