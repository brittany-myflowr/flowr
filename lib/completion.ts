import { formatDateKey } from '@/lib/dateKey';
import type { Routine, Step } from '@/types';

export type DailyCompletion = {
  completed: number;
  total: number;
};

export type DailyCompletionMap = Record<string, DailyCompletion>;

export type ScheduledStep = {
  step: Step;
  routine: Routine;
};

/** All steps from active routines (schedule frequency not enforced yet). */
export function getScheduledSteps(routines: Routine[]): ScheduledStep[] {
  const items: ScheduledStep[] = [];

  for (const routine of routines) {
    if (!routine.active) continue;

    for (const step of routine.steps) {
      items.push({ step, routine });
    }
  }

  return items;
}

export function countCompletedSteps(routines: Routine[]): DailyCompletion {
  const scheduled = getScheduledSteps(routines);
  const completed = scheduled.filter(({ step }) => step.done).length;

  return {
    completed,
    total: scheduled.length,
  };
}

export function snapshotTodayCompletion(
  routines: Routine[],
  existing: DailyCompletionMap,
): DailyCompletionMap {
  const today = formatDateKey(new Date());
  const counts = countCompletedSteps(routines);

  if (counts.total === 0) {
    return existing;
  }

  return {
    ...existing,
    [today]: counts,
  };
}

export function isDayComplete(entry: DailyCompletion | undefined): boolean {
  return !!entry && entry.total > 0 && entry.completed >= entry.total;
}
