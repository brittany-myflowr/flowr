import { useMemo } from 'react';

import { TIME_OF_DAY_ORDER, useTodaySections } from '@/hooks/useTodaySteps';
import type { PhaseKey } from '@/constants/phases';
import type { Routine, Step, TimeOfDay } from '@/types';

export type UpNextStep = {
  step: Step;
  routine: Routine;
  periodLabel: string;
  timeOfDay: TimeOfDay;
  routineName: string;
  stepNumber: number;
  totalSteps: number;
  isCycleSynced: boolean;
  phaseKeys?: PhaseKey[];
};

export function useUpNextStep(actualTimeOfDay: TimeOfDay, date = new Date()): UpNextStep | null {
  const periodSections = useTodaySections(date);

  return useMemo(() => {
    const startIndex = TIME_OF_DAY_ORDER.indexOf(actualTimeOfDay);
    const searchOrder = [
      ...TIME_OF_DAY_ORDER.slice(startIndex),
      ...TIME_OF_DAY_ORDER.slice(0, startIndex),
    ];

    for (const timeOfDay of searchOrder) {
      const section = periodSections.find((entry) => entry.timeOfDay === timeOfDay);
      if (!section) continue;

      for (const group of section.activeGroups) {
        const incompleteIndex = group.steps.findIndex(({ step }) => !step.done);
        if (incompleteIndex < 0) continue;

        const item = group.steps[incompleteIndex];
        const schedule = item.step.schedule ?? group.routine.schedule;

        return {
          step: item.step,
          routine: item.routine,
          periodLabel: section.label,
          timeOfDay: section.timeOfDay,
          routineName: group.routine.name,
          stepNumber: incompleteIndex + 1,
          totalSteps: group.totalCount,
          isCycleSynced: schedule.frequency === 'cycle',
          phaseKeys: schedule.frequency === 'cycle' ? schedule.phases : undefined,
        };
      }
    }

    return null;
  }, [periodSections, actualTimeOfDay]);
}
