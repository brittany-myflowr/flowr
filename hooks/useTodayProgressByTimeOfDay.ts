import { useMemo } from 'react';

import { formatTimeOfDay } from '@/constants/schedules';
import { useTodayProgress } from '@/hooks/useTodaySteps';
import type { TodayStep } from '@/hooks/useTodaySteps';
import type { TimeOfDay } from '@/types';

export type TodayPeriodProgress = {
  timeOfDay: TimeOfDay;
  label: string;
  steps: TodayStep[];
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

    return TIME_OF_DAY_ORDER.map((timeOfDay) => ({
      timeOfDay,
      label: formatTimeOfDay(timeOfDay),
      steps: byTimeOfDay[timeOfDay].steps,
      done: byTimeOfDay[timeOfDay].done,
      total: byTimeOfDay[timeOfDay].total,
      percent: byTimeOfDay[timeOfDay].percent,
    })).filter((period) => period.total > 0);
  }, [morning, afternoon, evening]);
}
