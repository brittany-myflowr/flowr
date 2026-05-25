import { useMemo } from 'react';

import { formatDateKey, padDatePart } from '@/lib/dateKey';
import { isDayComplete, type DailyCompletionMap } from '@/lib/completion';
import { useAppStore } from '@/providers/AppStore';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}`;
}

function computeStreak(dailyCompletions: DailyCompletionMap, today: Date): number {
  let streak = 0;
  const cursor = new Date(today);

  while (true) {
    const key = formatDateKey(cursor);
    if (!isDayComplete(dailyCompletions[key])) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function useCalendarStats(referenceDate = new Date()) {
  const { dailyCompletions } = useAppStore();
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
    () => computeStreak(dailyCompletions, today),
    [dailyCompletions, todayKey],
  );

  const weekDays = useMemo(() => {
    const dayIndex = today.getDay();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - dayIndex + index);
      const key = formatDateKey(date);
      const entry = dailyCompletions[key];
      return {
        date,
        key,
        label: WEEKDAY_LABELS[index],
        isToday: key === todayKey,
        isComplete: isDayComplete(entry),
        hasProgress: !!entry && entry.completed > 0,
      };
    });
  }, [dailyCompletions, today, todayKey]);

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
    }> = [];

    for (let i = 0; i < firstDay; i += 1) {
      cells.push({ day: null, key: null, isToday: false, isComplete: false, hasProgress: false });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const key = formatDateKey(date);
      const entry = dailyCompletions[key];
      cells.push({
        day,
        key,
        isToday: key === todayKey,
        isComplete: isDayComplete(entry),
        hasProgress: !!entry && entry.completed > 0,
      });
    }

    return cells;
  }, [dailyCompletions, today, todayKey]);

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
