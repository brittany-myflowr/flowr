import { phases } from '@/constants/phases';
import { formatDisplayDate } from '@/lib/cycle';
import { todayIsoDate } from '@/lib/schedule';
import type { Schedule, ScheduleFrequency, TimeOfDay } from '@/types';

export const FREQUENCY_OPTIONS: { value: ScheduleFrequency; label: string }[] = [
  { value: 'daily', label: 'Every Day' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Wks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

export const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export const TIME_OF_DAY_OPTIONS: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

export const END_OPTIONS = ['never', 'date', 'after'] as const;

export type EndOption = (typeof END_OPTIONS)[number];

export function formatFrequency(frequency: ScheduleFrequency) {
  switch (frequency) {
    case 'daily':
      return 'Every day';
    case 'weekly':
      return 'Weekly';
    case 'biweekly':
      return 'Every 2 weeks';
    case 'monthly':
      return 'Monthly';
    case 'custom':
      return 'Custom';
    case 'cycle':
      return 'Cycle Phase';
    default:
      return frequency;
  }
}

export function formatTimeOfDay(timeOfDay: TimeOfDay) {
  return timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1);
}

export function formatSchedulePreview(schedule: Schedule) {
  const parts: string[] = [];

  if (schedule.frequency === 'cycle' && schedule.phases?.length) {
    const labels = schedule.phases.map((phase) => phases[phase].label).join(', ');
    parts.push(`Cycle phases: ${labels}`);
  } else if (schedule.frequency === 'custom') {
    parts.push(`Every ${schedule.customIntervalDays ?? 3} days`);
  } else {
    parts.push(formatFrequency(schedule.frequency));
  }

  parts.push(formatTimeOfDay(schedule.timeOfDay));

  if (schedule.startDate) {
    parts.push(`from ${formatDisplayDate(schedule.startDate)}`);
  }

  const ends = schedule.ends ?? 'never';
  if (ends === 'date' && schedule.endDate) {
    parts.push(`until ${formatDisplayDate(schedule.endDate)}`);
  } else if (ends === 'after' && schedule.endAfterCount) {
    parts.push(`${schedule.endAfterCount} times`);
  }

  return parts.join(' · ');
}

export function defaultScheduleForTimeOfDay(timeOfDay: TimeOfDay): Schedule {
  return {
    frequency: 'daily',
    timeOfDay,
    daysOfWeek: [1, 3, 5],
    ends: 'never',
    startDate: todayIsoDate(),
  };
}

export function cloneSchedule(schedule: Schedule): Schedule {
  return {
    ...schedule,
    daysOfWeek: schedule.daysOfWeek ? [...schedule.daysOfWeek] : undefined,
    phases: schedule.phases ? [...schedule.phases] : undefined,
  };
}
