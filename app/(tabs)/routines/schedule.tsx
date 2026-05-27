import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { ScheduleEditorForm } from '@/components/schedule/ScheduleEditorForm';
import { FullWidthButton } from '@/components/ui/Button';
import {
  cloneSchedule,
  defaultScheduleForTimeOfDay,
  normalizeSchedule,
} from '@/constants/schedules';
import { colors } from '@/constants/colors';
import { useRoutine, useRoutines } from '@/providers/RoutinesProvider';
import { useToast } from '@/providers/ToastProvider';
import type { Schedule } from '@/types';
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
  } = useLocalSearchParams<{
    routineId?: string;
    stepId?: string;
    draft?: string;
    guided?: string;
    stepIndex?: string;
    stepName?: string;
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

  if (isGuided) {
    return (
      <GuidedStepScheduleEditor
        insetsTop={insets.top}
        stepIndex={Number(stepIndex ?? 0)}
        stepName={stepName}
        pendingSchedule={pendingGuidedStepScheduleInit}
        onBack={() => {
          setPendingGuidedStepScheduleInit(null);
          router.back();
        }}
        onSave={(schedule) => {
          setPendingGuidedStepScheduleResult({ stepIndex: Number(stepIndex ?? 0), schedule });
          setPendingGuidedStepScheduleInit(null);
          router.back();
        }}
      />
    );
  }

  if (!routine) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <SubPageHeader title="Schedule" onBack={() => router.back()} />
        <InlineEmptyCard
          title="Routine not found"
          body="Go back and open schedule from an existing routine."
        />
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

  return (
    <RoutineScheduleEditor
      insetsTop={insets.top}
      title={
        isDraft
          ? 'New Step · Custom Schedule'
          : isStepSchedule
            ? `${step?.name} · Custom Schedule`
            : `${routine.name} - Default Schedule`
      }
      initialSchedule={cloneSchedule(
        isDraft
          ? (pendingAddStepSchedule ?? routine.schedule)
          : (step?.schedule ?? routine.schedule),
      )}
      onBack={() => router.back()}
      onSave={(schedule) => {
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
      }}
    />
  );
}

type GuidedStepScheduleEditorProps = {
  insetsTop: number;
  stepIndex: number;
  stepName?: string;
  pendingSchedule: Schedule | null;
  onBack: () => void;
  onSave: (schedule: Schedule) => void;
};

function GuidedStepScheduleEditor({
  insetsTop,
  stepName,
  pendingSchedule,
  onBack,
  onSave,
}: GuidedStepScheduleEditorProps) {
  const [schedule, setSchedule] = useState(() =>
    normalizeSchedule(pendingSchedule ?? defaultScheduleForTimeOfDay('morning')),
  );

  return (
    <RoutineScheduleEditor
      insetsTop={insetsTop}
      title={stepName ? `${stepName} · Custom Schedule` : 'Step · Custom Schedule'}
      schedule={schedule}
      onScheduleChange={setSchedule}
      onBack={onBack}
      onSave={() => onSave(schedule)}
    />
  );
}

type RoutineScheduleEditorProps = {
  insetsTop: number;
  title: string;
  initialSchedule?: Schedule;
  schedule?: Schedule;
  onScheduleChange?: (schedule: Schedule) => void;
  onBack?: () => void;
  onSave: (schedule: Schedule) => void;
};

function RoutineScheduleEditor({
  insetsTop,
  title,
  initialSchedule,
  schedule: controlledSchedule,
  onScheduleChange,
  onBack,
  onSave,
}: RoutineScheduleEditorProps) {
  const [internalSchedule, setInternalSchedule] = useState(() =>
    normalizeSchedule(initialSchedule ?? defaultScheduleForTimeOfDay('morning')),
  );
  const schedule = controlledSchedule ?? internalSchedule;
  const handleScheduleChange = onScheduleChange ?? setInternalSchedule;

  return (
    <View style={[styles.screen, { paddingTop: insetsTop }]}>
      <SubPageHeader subtitle="Schedule" title={title} onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ScheduleEditorForm
          schedule={schedule}
          onScheduleChange={handleScheduleChange}
          onSave={() => onSave(normalizeSchedule(schedule))}
        />
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
