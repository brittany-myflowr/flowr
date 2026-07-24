import { useEffect, useState } from 'react';

import type { TimeOfDay } from '@/types';

function getTimeOfDay(date = new Date()): TimeOfDay {
  const hour = date.getHours();

  // Morning: 5:00 AM – 11:59 AM
  if (hour >= 5 && hour < 12) return 'morning';
  // Afternoon: 12:00 PM – 6:59 PM
  if (hour >= 12 && hour < 19) return 'afternoon';
  // Evening: 7:00 PM – 11:59 PM (and overnight hours before 5:00 AM)
  return 'evening';
}

/**
 * Start/end of a time-of-day window for `date` (local).
 * End is exclusive and matches `getTimeOfDay` boundaries
 * (morning → 12:00, afternoon → 19:00, evening → 05:00 next day).
 */
export function getTimeOfDayWindowBounds(
  timeOfDay: TimeOfDay,
  date: Date,
): { start: Date; end: Date } {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  switch (timeOfDay) {
    case 'morning':
      return {
        start: new Date(y, m, d, 5, 0, 0, 0),
        end: new Date(y, m, d, 12, 0, 0, 0),
      };
    case 'afternoon':
      return {
        start: new Date(y, m, d, 12, 0, 0, 0),
        end: new Date(y, m, d, 19, 0, 0, 0),
      };
    case 'evening':
      return {
        start: new Date(y, m, d, 19, 0, 0, 0),
        end: new Date(y, m, d + 1, 5, 0, 0, 0),
      };
  }
}

export function useTimeOfDay(): TimeOfDay {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return timeOfDay;
}

export { getTimeOfDay };
