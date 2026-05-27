import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

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
import { fonts } from '@/constants/typography';
import { useTodayProgress, useCurrentPhaseInfo } from '@/hooks/useTodaySteps';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import {
  groupTodayStepsByRoutine,
  splitTodayRoutineGroups,
} from '@/lib/todayGroups';
import { useAuth, useRoutines } from '@/providers/AppStore';
import type { TimeOfDay } from '@/types';
import type { TodayStep } from '@/hooks/useTodaySteps';
import { s, vs, fs } from '@/lib/scale';

export default function TodayScreen() {
  const router = useRouter();
  const actualTimeOfDay = useTimeOfDay();
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState(actualTimeOfDay);
  const [reorderMode, setReorderMode] = useState(false);
  const [expandedByRoutineId, setExpandedByRoutineId] = useState<Record<string, boolean>>({});
  const previouslyCompleteRoutineIds = useRef<Set<string>>(new Set());
  const { user } = useAuth();
  const { routines, toggleStepDone, reorderTodaySteps } = useRoutines();
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
    setReorderMode(false);
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
    setReorderMode(false);
  };

  const handleTodayDragEnd = ({ data }: { data: TodayStep[] }) => {
    reorderTodaySteps(
      selectedTimeOfDay,
      data.map((item) => item.step.id),
    );
  };

  const renderStepRow = (
    { step, routine }: TodayStep,
    options?: {
      showRoutineName?: boolean;
      onDrag?: () => void;
      isDragging?: boolean;
    },
  ) => {
    const schedule = step.schedule ?? routine.schedule;
    const phaseKeys = schedule.frequency === 'cycle' ? schedule.phases : undefined;

    return (
      <TodayStepRow
        step={step}
        routineName={routine.name}
        showRoutineName={options?.showRoutineName ?? true}
        phaseKeys={phaseKeys}
        reorderMode={reorderMode}
        isDragging={options?.isDragging}
        onToggle={() => toggleStepDone(routine.id, step.id)}
        onLongPress={() => setReorderMode(true)}
        onDrag={options?.onDrag}
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
      renderStepRow={(item, _index, _listLength) =>
        renderStepRow(item, { showRoutineName: false })
      }
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
      {reorderMode ? (
        <View style={styles.reorderBanner}>
          <Text style={styles.reorderBannerText}>
            Drag steps by the handle to reorder
          </Text>
          <Text onPress={() => setReorderMode(false)} style={styles.reorderDone}>
            Done
          </Text>
        </View>
      ) : null}
      {reorderMode && total > 0 ? (
        <DraggableFlatList
          data={steps}
          keyExtractor={(item) => item.step.id}
          onDragEnd={handleTodayDragEnd}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={styles.addStepButton}>
              <FullWidthButton
                label="+ Add a Step"
                onPress={() => router.push('/(tabs)/routines/add-step')}
              />
            </View>
          }
          renderItem={({ item, drag, isActive }) => (
            <ScaleDecorator>
              {renderStepRow(item, { onDrag: drag, isDragging: isActive })}
            </ScaleDecorator>
          )}
        />
      ) : (
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
                {!reorderMode && total > 1 ? (
                  <Pressable onPress={() => setReorderMode(true)} style={styles.reorderLinkWrap}>
                    <Text style={styles.reorderLink}>Reorder steps</Text>
                  </Pressable>
                ) : null}
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
                label="+ Add a Step"
                onPress={() => router.push('/(tabs)/routines/add-step')}
              />
            </View>
          </>
        )}
      </ScrollView>
      )}
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
  reorderLinkWrap: {
    alignSelf: 'flex-end',
    marginBottom: s(8),
  },
  reorderLink: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.blue,
    textDecorationLine: 'underline',
  },
  addStepButton: {
    marginTop: s(12),
  },
});
