import { useMemo } from 'react';

import { getApplicableSteps } from '@/lib/applicableSteps';
import { sortByTodayOrder } from '@/lib/todayOrder';
import { useAppStore, useRoutines } from '@/providers/AppStore';
import type { Routine, Step, TimeOfDay } from '@/types';

export type TodayStep = {
  step: Step;
  routine: Routine;
};

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

export { useCurrentPhaseInfo } from '@/hooks/useCurrentPhaseInfo';
