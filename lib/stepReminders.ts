import type { StepReminder, TimeOfDay } from '@/types';

export function formatReminderTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinute = String(minute).padStart(2, '0');

  return `${displayHour}:${displayMinute} ${period}`;
}

export function defaultReminderForTimeOfDay(timeOfDay: TimeOfDay): StepReminder {
  switch (timeOfDay) {
    case 'morning':
      return { enabled: false, hour: 8, minute: 0 };
    case 'afternoon':
      return { enabled: false, hour: 12, minute: 30 };
    case 'evening':
      return { enabled: false, hour: 20, minute: 0 };
  }
}

export function shiftReminderTime(
  reminder: StepReminder,
  deltaMinutes: number,
): StepReminder {
  let totalMinutes = reminder.hour * 60 + reminder.minute + deltaMinutes;
  totalMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);

  return {
    ...reminder,
    hour: Math.floor(totalMinutes / 60),
    minute: totalMinutes % 60,
  };
}

export function resolveStepReminder(
  reminder: StepReminder | undefined,
  timeOfDay: TimeOfDay,
): StepReminder {
  return reminder ?? defaultReminderForTimeOfDay(timeOfDay);
}
