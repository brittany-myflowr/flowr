import { useMemo } from 'react';

import { getCurrentPhaseInfo, stepMatchesCurrentPhase } from '@/lib/cycle';
import { scheduleAppliesOnDate } from '@/lib/schedule';
import { sortByTodayOrder } from '@/lib/todayOrder';
import { useAppStore, useRoutines } from '@/providers/AppStore';
import type { Routine, Step, TimeOfDay } from '@/types';

export type TodayStep = {
  step: Step;
  routine: Routine;
};

function stepAppliesToday(
  step: Step,
  routine: Routine,
  timeOfDay: TimeOfDay,
  cycleSettings: ReturnType<typeof useAppStore>['cycleSettings'],
  date: Date,
) {
  const schedule = step.schedule ?? routine.schedule;
  if (schedule.timeOfDay !== timeOfDay) return false;
  if (!scheduleAppliesOnDate(schedule, date)) return false;

  if (schedule.frequency === 'cycle') {
    return stepMatchesCurrentPhase(schedule.phases, cycleSettings, date);
  }

  return true;
}

export function useTodaySteps(timeOfDay: TimeOfDay, date = new Date()): TodayStep[] {
  const { routines } = useRoutines();
  const { cycleSettings, todayStepOrders } = useAppStore();

  return useMemo(() => {
    const items: TodayStep[] = [];

    for (const routine of routines) {
      if (!routine.active) continue;

      for (const step of routine.steps) {
        if (stepAppliesToday(step, routine, timeOfDay, cycleSettings, date)) {
          items.push({ step, routine });
        }
      }
    }

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

export function useCurrentPhaseInfo(date = new Date()) {
  const { cycleSettings } = useAppStore();

  return useMemo(() => getCurrentPhaseInfo(cycleSettings, date), [cycleSettings, date]);
}
