import { useMemo } from 'react';

import type { Category } from '@/constants/categories';
import { formatTimeOfDay } from '@/constants/schedules';
import { useTodayProgress } from '@/hooks/useTodaySteps';
import { groupTodayStepsByRoutine } from '@/lib/todayGroups';
import type { TimeOfDay } from '@/types';

export type TodayRoutinePeriodProgress = {
  routineId: string;
  routineName: string;
  category: Category;
  done: number;
  total: number;
  isFullyComplete: boolean;
};

export type TodayPeriodProgress = {
  timeOfDay: TimeOfDay;
  label: string;
  routines: TodayRoutinePeriodProgress[];
  done: number;
  total: number;
  percent: number;
};

const TIME_OF_DAY_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

export function useTodayProgressByTimeOfDay(date = new Date()) {
  const morning = useTodayProgress('morning', date);
  const afternoon = useTodayProgress('afternoon', date);
  const evening = useTodayProgress('evening', date);

  return useMemo(() => {
    const byTimeOfDay = {
      morning,
      afternoon,
      evening,
    } as const;

    return TIME_OF_DAY_ORDER.map((timeOfDay) => {
      const progress = byTimeOfDay[timeOfDay];
      const routines = groupTodayStepsByRoutine(progress.steps).map((group) => ({
        routineId: group.routine.id,
        routineName: group.routine.name,
        category: group.routine.category,
        done: group.doneCount,
        total: group.totalCount,
        isFullyComplete: group.isFullyComplete,
      }));

      return {
        timeOfDay,
        label: formatTimeOfDay(timeOfDay),
        routines,
        done: progress.done,
        total: progress.total,
        percent: progress.percent,
      };
    });
  }, [morning, afternoon, evening]);
}
