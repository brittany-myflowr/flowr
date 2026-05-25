import { formatDateKey, parseDateKey } from '@/lib/dateKey';
import type { Schedule } from '@/types';

function daysBetween(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function getScheduleStartDate(schedule: Schedule): Date | null {
  if (!schedule.startDate) return null;
  return parseDateKey(schedule.startDate);
}

function matchesFrequencyPattern(
  schedule: Schedule,
  date: Date,
  daysSinceStart: number,
): boolean {
  switch (schedule.frequency) {
    case 'daily':
      return true;
    case 'weekly': {
      const day = date.getDay();
      return schedule.daysOfWeek?.includes(day) ?? false;
    }
    case 'biweekly': {
      const day = date.getDay();
      if (!(schedule.daysOfWeek?.includes(day) ?? false)) return false;
      const weeksSinceStart = Math.floor(daysSinceStart / 7);
      return weeksSinceStart % 2 === 0;
    }
    case 'monthly': {
      const start = getScheduleStartDate(schedule);
      if (start) {
        const targetDay = start.getDate();
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        return date.getDate() === Math.min(targetDay, lastDayOfMonth);
      }
      return date.getDate() === 1;
    }
    case 'custom': {
      const interval = schedule.customIntervalDays ?? 3;
      if (interval < 1) return false;
      return daysSinceStart >= 0 && daysSinceStart % interval === 0;
    }
    case 'cycle':
      return !!schedule.phases?.length;
    default:
      return false;
  }
}

function countOccurrencesThroughDate(schedule: Schedule, date: Date): number {
  const start = getScheduleStartDate(schedule);
  if (!start) return matchesFrequencyPattern(schedule, date, 0) ? 1 : 0;

  let count = 0;
  const cursor = new Date(start);

  while (cursor <= date) {
    const daysSinceStart = daysBetween(start, cursor);
    if (matchesFrequencyPattern(schedule, cursor, daysSinceStart)) {
      count += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}

export function scheduleAppliesOnDate(schedule: Schedule, date: Date): boolean {
  const start = getScheduleStartDate(schedule);
  const daysSinceStart = start ? daysBetween(start, date) : 0;

  if (start && daysSinceStart < 0) return false;

  const ends = schedule.ends ?? 'never';

  if (ends === 'date' && schedule.endDate) {
    const end = parseDateKey(schedule.endDate);
    if (end && daysBetween(date, end) > 0) return false;
  }

  if (!matchesFrequencyPattern(schedule, date, daysSinceStart)) return false;

  if (ends === 'after' && schedule.endAfterCount) {
    const count = countOccurrencesThroughDate(schedule, date);
    if (count > schedule.endAfterCount) return false;
  }

  return true;
}

export function todayIsoDate(): string {
  return formatDateKey(new Date());
}

export function defaultEndDate(startDate: string, offsetDays = 30): string {
  const start = parseDateKey(startDate);
  if (!start) return todayIsoDate();
  start.setDate(start.getDate() + offsetDays);
  return formatDateKey(start);
}
