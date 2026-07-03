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
