import type { TodayStep } from '@/hooks/useTodaySteps';
import type { Routine } from '@/types';

export type TodayRoutineGroup = {
  routine: Routine;
  steps: TodayStep[];
  doneCount: number;
  totalCount: number;
  isFullyComplete: boolean;
};

export function groupTodayStepsByRoutine(steps: TodayStep[]): TodayRoutineGroup[] {
  const groups: TodayRoutineGroup[] = [];
  const indexByRoutineId = new Map<string, number>();

  for (const item of steps) {
    const existingIndex = indexByRoutineId.get(item.routine.id);

    if (existingIndex === undefined) {
      indexByRoutineId.set(item.routine.id, groups.length);
      groups.push({
        routine: item.routine,
        steps: [item],
        doneCount: item.step.done ? 1 : 0,
        totalCount: 1,
        isFullyComplete: item.step.done,
      });
      continue;
    }

    const group = groups[existingIndex];
    group.steps.push(item);
    group.totalCount += 1;
    if (item.step.done) group.doneCount += 1;
    group.isFullyComplete = group.doneCount === group.totalCount;
  }

  return groups;
}

export function splitTodayRoutineGroups(groups: TodayRoutineGroup[]) {
  const activeGroups = groups.filter((group) => !group.isFullyComplete);
  const completedGroups = groups.filter((group) => group.isFullyComplete);
  return { activeGroups, completedGroups };
}
