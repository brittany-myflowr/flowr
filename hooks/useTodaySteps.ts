import { useMemo } from 'react';

import { getApplicableSteps } from '@/lib/applicableSteps';
import { sortByTodayOrder } from '@/lib/todayOrder';
import { formatTimeOfDay } from '@/constants/schedules';
import { groupTodayStepsByRoutine, splitTodayRoutineGroups } from '@/lib/todayGroups';
import { useAppStore, useRoutines } from '@/providers/AppStore';
import type { Routine, Step, TimeOfDay } from '@/types';

export type TodayStep = {
  step: Step;
  routine: Routine;
};

export const TIME_OF_DAY_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

export function useTodaySteps(timeOfDay: TimeOfDay, date = new Date()): TodayStep[] {
  const { routines } = useRoutines();
  const { cycleSettings, todayStepOrders } = useAppStore();

  return useMemo(() => {
    const items = getApplicableSteps(routines, date, {
      timeOfDay,
      cycleSettings,
    });

    return sortByTodayOrder(items, todayStepOrders[timeOfDay] ?? []);
  }, [routines, timeOfDay, cycleSettings, todayStepOrders, date]);
}

export function useTodayProgress(timeOfDay: TimeOfDay, date = new Date()) {
  const steps = useTodaySteps(timeOfDay, date);
  const done = steps.filter(({ step }) => step.done).length;
  const total = steps.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return { steps, done, total, percent };
}

export function useTodayDayProgress(date = new Date()) {
  const { routines } = useRoutines();
  const { cycleSettings } = useAppStore();

  return useMemo(() => {
    const steps = getApplicableSteps(routines, date, { cycleSettings });
    const done = steps.filter(({ step }) => step.done).length;
    const total = steps.length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    return { steps, done, total, percent };
  }, [routines, cycleSettings, date]);
}

export function useTodaySections(date = new Date()) {
  const morning = useTodayProgress('morning', date);
  const afternoon = useTodayProgress('afternoon', date);
  const evening = useTodayProgress('evening', date);

  return useMemo(() => {
    const byTimeOfDay = { morning, afternoon, evening } as const;

    return TIME_OF_DAY_ORDER.map((timeOfDay) => {
      const progress = byTimeOfDay[timeOfDay];
      const groups = groupTodayStepsByRoutine(progress.steps);
      const { activeGroups, completedGroups } = splitTodayRoutineGroups(groups);

      return {
        timeOfDay,
        label: formatTimeOfDay(timeOfDay),
        done: progress.done,
        total: progress.total,
        activeGroups,
        completedGroups,
      };
    }).filter((section) => section.total > 0);
  }, [morning, afternoon, evening]);
}

/** All three time-of-day sections, including empty periods (e.g. Today empty state). */
export function useTodayAllPeriodSections(date = new Date()) {
  const morning = useTodayProgress('morning', date);
  const afternoon = useTodayProgress('afternoon', date);
  const evening = useTodayProgress('evening', date);

  return useMemo(() => {
    const byTimeOfDay = { morning, afternoon, evening } as const;

    return TIME_OF_DAY_ORDER.map((timeOfDay) => {
      const progress = byTimeOfDay[timeOfDay];
      const groups = groupTodayStepsByRoutine(progress.steps);
      const { activeGroups, completedGroups } = splitTodayRoutineGroups(groups);

      return {
        timeOfDay,
        label: formatTimeOfDay(timeOfDay),
        done: progress.done,
        total: progress.total,
        activeGroups,
        completedGroups,
      };
    });
  }, [morning, afternoon, evening]);
}

export { useCurrentPhaseInfo } from '@/hooks/useCurrentPhaseInfo';
