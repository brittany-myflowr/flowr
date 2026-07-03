import { useMemo } from 'react';

import { getCurrentPhaseInfo } from '@/lib/cycle';
import { useAppStore } from '@/providers/AppStore';

export function useCurrentPhaseInfo(date = new Date()) {
  const { cycleSettings } = useAppStore();

  return useMemo(() => getCurrentPhaseInfo(cycleSettings, date), [cycleSettings, date]);
}
