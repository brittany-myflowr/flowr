import { useMemo } from 'react';

import { formatDateKey, isSameMonth, padDatePart } from '@/lib/dateKey';
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

export function useCalendarStats(
  viewDate = new Date(),
  selectedDateKey = formatDateKey(viewDate),
) {
  const { dailyCompletions, routines, cycleSettings } = useAppStore();
  const actualToday = new Date();
  const todayKey = formatDateKey(actualToday);
  const viewedMonthKey = monthKey(viewDate);
  const isViewingCurrentMonth = isSameMonth(viewDate, actualToday);

  const daysThisMonth = useMemo(() => {
    return Object.entries(dailyCompletions).filter(([key, entry]) => {
      if (!isDayComplete(entry)) return false;
      return key.startsWith(viewedMonthKey);
    }).length;
  }, [dailyCompletions, viewedMonthKey]);

  const monthProgress = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const denominator = isViewingCurrentMonth ? actualToday.getDate() : daysInMonth;

    if (denominator === 0 || daysThisMonth === 0) return 0;
    return Math.round((daysThisMonth / denominator) * 100);
  }, [daysThisMonth, viewDate, isViewingCurrentMonth, actualToday]);

  const streak = useMemo(
    () => computeStreak(dailyCompletions, routines, cycleSettings, actualToday),
    [dailyCompletions, routines, cycleSettings, todayKey],
  );

  const weekDays = useMemo(() => {
    const dayIndex = viewDate.getDay();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(viewDate);
      date.setDate(viewDate.getDate() - dayIndex + index);
      const key = formatDateKey(date);
      const stats = getCompletionForDate(date, dailyCompletions, routines, cycleSettings);

      return {
        date,
        key,
        label: WEEKDAY_LABELS[index],
        isToday: key === todayKey,
        isSelected: key === selectedDateKey,
        isComplete: stats.isComplete,
        hasProgress: stats.hasProgress,
        isOffDay: stats.isOffDay,
      };
    });
  }, [dailyCompletions, routines, cycleSettings, viewDate, todayKey, selectedDateKey]);

  const monthGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{
      day: number | null;
      key: string | null;
      isToday: boolean;
      isSelected: boolean;
      isComplete: boolean;
      hasProgress: boolean;
      isOffDay: boolean;
    }> = [];

    for (let i = 0; i < firstDay; i += 1) {
      cells.push({
        day: null,
        key: null,
        isToday: false,
        isSelected: false,
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
        isSelected: key === selectedDateKey,
        isComplete: stats.isComplete,
        hasProgress: stats.hasProgress,
        isOffDay: stats.isOffDay,
      });
    }

    return cells;
  }, [dailyCompletions, routines, cycleSettings, viewDate, todayKey, selectedDateKey]);

  const monthLabel = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const monthStatLabel = isViewingCurrentMonth
    ? 'This Month'
    : viewDate.toLocaleDateString(undefined, { month: 'short' });

  return {
    streak,
    daysThisMonth,
    monthProgress,
    weekDays,
    monthGrid,
    monthLabel,
    monthStatLabel,
    isViewingCurrentMonth,
    hasAnyHistory: Object.keys(dailyCompletions).length > 0,
  };
}

export { getDailyCompletionStats, type DailyCompletionMap };
