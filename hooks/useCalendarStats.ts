import { useMemo } from 'react';

import { formatDateKey, padDatePart } from '@/lib/dateKey';
import {
  computeStreak,
  getCompletionForDate,
  getDailyCompletionStats,
  isDayComplete,
  type DailyCompletionMap,
} from '@/lib/completion';
import { useAppStore } from '@/providers/AppStore';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}`;
}

export function useCalendarStats(referenceDate = new Date()) {
  const { dailyCompletions, routines, cycleSettings } = useAppStore();
  const today = referenceDate;
  const todayKey = formatDateKey(today);
  const currentMonth = monthKey(today);

  const daysThisMonth = useMemo(() => {
    return Object.entries(dailyCompletions).filter(([key, entry]) => {
      if (!isDayComplete(entry)) return false;
      return key.startsWith(currentMonth);
    }).length;
  }, [dailyCompletions, currentMonth]);

  const monthProgress = useMemo(() => {
    const dayOfMonth = today.getDate();
    if (dayOfMonth === 0) return 0;
    return Math.round((daysThisMonth / dayOfMonth) * 100);
  }, [daysThisMonth, today]);

  const streak = useMemo(
    () => computeStreak(dailyCompletions, routines, cycleSettings, today),
    [dailyCompletions, routines, cycleSettings, todayKey],
  );

  const weekDays = useMemo(() => {
    const dayIndex = today.getDay();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - dayIndex + index);
      const key = formatDateKey(date);
      const stats = getCompletionForDate(date, dailyCompletions, routines, cycleSettings);

      return {
        date,
        key,
        label: WEEKDAY_LABELS[index],
        isToday: key === todayKey,
        isComplete: stats.isComplete,
        hasProgress: stats.hasProgress,
        isOffDay: stats.isOffDay,
      };
    });
  }, [dailyCompletions, routines, cycleSettings, today, todayKey]);

  const monthGrid = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{
      day: number | null;
      key: string | null;
      isToday: boolean;
      isComplete: boolean;
      hasProgress: boolean;
      isOffDay: boolean;
    }> = [];

    for (let i = 0; i < firstDay; i += 1) {
      cells.push({
        day: null,
        key: null,
        isToday: false,
        isComplete: false,
        hasProgress: false,
        isOffDay: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const key = formatDateKey(date);
      const stats = getCompletionForDate(date, dailyCompletions, routines, cycleSettings);

      cells.push({
        day,
        key,
        isToday: key === todayKey,
        isComplete: stats.isComplete,
        hasProgress: stats.hasProgress,
        isOffDay: stats.isOffDay,
      });
    }

    return cells;
  }, [dailyCompletions, routines, cycleSettings, today, todayKey]);

  const monthLabel = today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return {
    streak,
    daysThisMonth,
    monthProgress,
    weekDays,
    monthGrid,
    monthLabel,
    hasAnyHistory: Object.keys(dailyCompletions).length > 0,
  };
}

export { getDailyCompletionStats, type DailyCompletionMap };
