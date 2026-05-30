import { useMemo } from 'react';

import { formatTimeOfDay } from '@/constants/schedules';
import { getApplicableSteps } from '@/lib/applicableSteps';
import { normalizeDailyCompletionEntry } from '@/lib/completion';
import { formatDateKey } from '@/lib/dateKey';
import { sortByTodayOrder } from '@/lib/todayOrder';
import { useAppStore, useRoutines } from '@/providers/AppStore';
import type { Routine, Step, TimeOfDay } from '@/types';

const TIME_OF_DAY_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

export type PlannerStep = {
  step: Step;
  routine: Routine;
  done: boolean;
};

export type PlannerRoutineGroup = {
  routine: Routine;
  steps: PlannerStep[];
  doneCount: number;
  totalCount: number;
  isFullyComplete: boolean;
};

export type PlannerPeriodSection = {
  timeOfDay: TimeOfDay;
  label: string;
  done: number;
  total: number;
  routines: PlannerRoutineGroup[];
};

function resolveStepDone(
  stepId: string,
  dateKey: string,
  todayKey: string,
  stepDoneLive: boolean,
  completedStepIds: Set<string>,
): boolean {
  if (dateKey === todayKey) return stepDoneLive;
  if (completedStepIds.size > 0) return completedStepIds.has(stepId);
  return false;
}

function groupPlannerStepsByRoutine(steps: PlannerStep[]): PlannerRoutineGroup[] {
  const groups: PlannerRoutineGroup[] = [];
  const indexByRoutineId = new Map<string, number>();

  for (const item of steps) {
    const existingIndex = indexByRoutineId.get(item.routine.id);

    if (existingIndex === undefined) {
      indexByRoutineId.set(item.routine.id, groups.length);
      groups.push({
        routine: item.routine,
        steps: [item],
        doneCount: item.done ? 1 : 0,
        totalCount: 1,
        isFullyComplete: item.done,
      });
      continue;
    }

    const group = groups[existingIndex];
    group.steps.push(item);
    group.totalCount += 1;
    if (item.done) group.doneCount += 1;
    group.isFullyComplete = group.doneCount === group.totalCount;
  }

  return groups;
}

export function usePlannerDay(date: Date) {
  const { routines: allRoutines } = useRoutines();
  const { cycleSettings, dailyCompletions, todayStepOrders } = useAppStore();

  return useMemo(() => {
    const dateKey = formatDateKey(date);
    const todayKey = formatDateKey(new Date());
    const stored = normalizeDailyCompletionEntry(dailyCompletions[dateKey]);
    const completedStepIds = new Set(stored?.completed ?? []);

    const sections: PlannerPeriodSection[] = TIME_OF_DAY_ORDER.map((timeOfDay) => {
      const applicable = getApplicableSteps(allRoutines, date, {
        timeOfDay,
        cycleSettings,
      });

      const plannerSteps: PlannerStep[] = sortByTodayOrder(applicable, todayStepOrders[timeOfDay] ?? []).map(
        ({ step, routine }) => ({
          step,
          routine,
          done: resolveStepDone(step.id, dateKey, todayKey, step.done, completedStepIds),
        }),
      );

      const routineGroups = groupPlannerStepsByRoutine(plannerSteps);
      const done = plannerSteps.filter((item) => item.done).length;
      const total = plannerSteps.length;

      return {
        timeOfDay,
        label: formatTimeOfDay(timeOfDay),
        done,
        total,
        routines: routineGroups,
      };
    });

    const dayDone = sections.reduce((sum, section) => sum + section.done, 0);
    const dayTotal = sections.reduce((sum, section) => sum + section.total, 0);
    const hasScheduledSteps = dayTotal > 0;

    return {
      sections,
      dayDone,
      dayTotal,
      hasScheduledSteps,
      dateKey,
      isToday: dateKey === todayKey,
      isFuture: dateKey > todayKey,
      isPast: dateKey < todayKey,
    };
  }, [allRoutines, cycleSettings, dailyCompletions, todayStepOrders, date]);
}
