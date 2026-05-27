import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CyclePhaseBanner } from '@/components/cycle/CyclePhaseBanner';
import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { FirstRoutineCard } from '@/components/onboarding/FirstRoutineCard';
import { TodayRoutineSection } from '@/components/today/TodayRoutineSection';
import { TodayStepRow } from '@/components/today/TodayStepRow';
import { FullWidthButton } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import {
  getTimeOfDayGreeting,
  TimeOfDayHeader,
} from '@/components/today/TimeOfDayHeader';
import { colors } from '@/constants/colors';
import { useTodayProgress, useCurrentPhaseInfo } from '@/hooks/useTodaySteps';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import {
  groupTodayStepsByRoutine,
  splitTodayRoutineGroups,
} from '@/lib/todayGroups';
import { useAuth, useRoutines } from '@/providers/AppStore';
import type { TimeOfDay } from '@/types';
import type { TodayStep } from '@/hooks/useTodaySteps';
import { s } from '@/lib/scale';

export default function TodayScreen() {
  const router = useRouter();
  const actualTimeOfDay = useTimeOfDay();
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState(actualTimeOfDay);
  const [expandedByRoutineId, setExpandedByRoutineId] = useState<Record<string, boolean>>({});
  const previouslyCompleteRoutineIds = useRef<Set<string>>(new Set());
  const { user } = useAuth();
  const { routines, toggleStepDone } = useRoutines();
  const { steps, done, total, percent } = useTodayProgress(selectedTimeOfDay);
  const phaseInfo = useCurrentPhaseInfo();

  const routineGroups = useMemo(() => groupTodayStepsByRoutine(steps), [steps]);
  const { activeGroups, completedGroups } = useMemo(
    () => splitTodayRoutineGroups(routineGroups),
    [routineGroups],
  );

  const stepsLabel =
    total === 0 ? 'No steps for this time of day' : `${done} of ${total} steps done`;

  const completedRoutineIds = useMemo(
    () => new Set(completedGroups.map((group) => group.routine.id)),
    [completedGroups],
  );

  useEffect(() => {
    const currentlyCompleteIds = completedRoutineIds;

    setExpandedByRoutineId((current) => {
      const next = { ...current };
      let changed = false;

      for (const routineId of currentlyCompleteIds) {
        if (!previouslyCompleteRoutineIds.current.has(routineId) && routineId in next) {
          delete next[routineId];
          changed = true;
        }
      }

      for (const group of activeGroups) {
        if (previouslyCompleteRoutineIds.current.has(group.routine.id) && group.routine.id in next) {
          delete next[group.routine.id];
          changed = true;
        }
      }

      return changed ? next : current;
    });

    previouslyCompleteRoutineIds.current = currentlyCompleteIds;
  }, [activeGroups, completedRoutineIds]);

  useEffect(() => {
    setExpandedByRoutineId({});
    previouslyCompleteRoutineIds.current = new Set();
  }, [selectedTimeOfDay]);

  const isRoutineExpanded = (routineId: string) => {
    if (
      completedRoutineIds.has(routineId) &&
      !previouslyCompleteRoutineIds.current.has(routineId)
    ) {
      return false;
    }

    return expandedByRoutineId[routineId] === true;
  };

  const toggleRoutineExpanded = (routineId: string) => {
    setExpandedByRoutineId((current) => ({
      ...current,
      [routineId]: !isRoutineExpanded(routineId),
    }));
  };

  const handleTimeOfDayChange = (timeOfDay: TimeOfDay) => {
    setSelectedTimeOfDay(timeOfDay);
  };

  const renderStepRow = (
    { step, routine }: TodayStep,
    index: number,
  ) => {
    const schedule = step.schedule ?? routine.schedule;
    const phaseKeys = schedule.frequency === 'cycle' ? schedule.phases : undefined;

    return (
      <TodayStepRow
        step={step}
        index={index}
        embedded
        phaseKeys={phaseKeys}
        onToggle={() => toggleStepDone(routine.id, step.id)}
      />
    );
  };

  const renderRoutineSection = (
    group: (typeof routineGroups)[number],
    completed = false,
  ) => (
    <TodayRoutineSection
      key={group.routine.id}
      group={group}
      completed={completed}
      expanded={isRoutineExpanded(group.routine.id)}
      onToggleExpanded={() => toggleRoutineExpanded(group.routine.id)}
      renderStepRow={(item, index, _listLength) => renderStepRow(item, index)}
    />
  );

  return (
    <View style={styles.screen}>
      <TimeOfDayHeader
        percent={percent}
        greeting={getTimeOfDayGreeting(actualTimeOfDay, user?.firstName)}
        stepsLabel={stepsLabel}
        selectedTimeOfDay={selectedTimeOfDay}
        onTimeOfDayChange={handleTimeOfDayChange}
      />
      {phaseInfo ? (
        <CyclePhaseBanner
          phaseInfo={phaseInfo}
          onDetails={() => router.push('/(tabs)/routines/cycle-settings')}
        />
      ) : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {routines.length === 0 ? (
          <FirstRoutineCard onGetStarted={() => router.push('/(tabs)/routines/guided')} />
        ) : (
          <>
            {total === 0 ? (
              <InlineEmptyCard
                title="Nothing scheduled"
                body={`No active steps are set for ${selectedTimeOfDay}. Check another time of day or add steps to your routines.`}
              />
            ) : (
              <>
                {activeGroups.map((group) => renderRoutineSection(group))}
                {completedGroups.length > 0 ? (
                  <>
                    <Divider label="Completed" />
                    {completedGroups.map((group) => renderRoutineSection(group, true))}
                  </>
                ) : null}
              </>
            )}
            <View style={styles.addStepButton}>
              <FullWidthButton
                label="+ Add a Routine"
                onPress={() => router.push('/(tabs)/routines')}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: s(14),
    paddingTop: s(16),
    paddingBottom: s(24),
  },
  addStepButton: {
    marginTop: s(12),
  },
});
