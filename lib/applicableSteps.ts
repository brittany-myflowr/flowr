import { stepMatchesCurrentPhase } from '@/lib/cycle';
import { scheduleAppliesOnDate } from '@/lib/schedule';
import type { CycleSettings, Routine, Step, TimeOfDay } from '@/types';

export type ApplicableStep = {
  step: Step;
  routine: Routine;
};

export type GetApplicableStepsOptions = {
  timeOfDay?: TimeOfDay;
  cycleSettings: CycleSettings;
};

export function stepAppliesOnDate(
  step: Step,
  routine: Routine,
  date: Date,
  cycleSettings: CycleSettings,
  timeOfDay?: TimeOfDay,
): boolean {
  const schedule = step.schedule ?? routine.schedule;

  if (timeOfDay !== undefined && schedule.timeOfDay !== timeOfDay) {
    return false;
  }

  if (!scheduleAppliesOnDate(schedule, date)) {
    return false;
  }

  if (schedule.frequency === 'cycle') {
    return stepMatchesCurrentPhase(schedule.phases, cycleSettings, date);
  }

  return true;
}

export function getApplicableSteps(
  routines: Routine[],
  date: Date,
  options: GetApplicableStepsOptions,
): ApplicableStep[] {
  const items: ApplicableStep[] = [];

  for (const routine of routines) {
    if (!routine.active) continue;

    for (const step of routine.steps) {
      if (stepAppliesOnDate(step, routine, date, options.cycleSettings, options.timeOfDay)) {
        items.push({ step, routine });
      }
    }
  }

  return items;
}

export function hasTrackableRoutines(routines: Routine[]): boolean {
  return routines.some((routine) => routine.active && routine.steps.length > 0);
}
