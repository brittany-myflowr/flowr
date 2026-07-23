import type { Category } from '@/constants/categories';
import type { PhaseKey } from '@/constants/phases';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export type Verdict = 'Love It' | 'Like It' | 'Not For Me';

export type ScheduleFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'custom'
  | 'cycle';

export type Step = {
  id: string;
  name: string;
  note?: string;
  category: Category;
  done: boolean;
  productId?: string;
  productName?: string;
  schedule?: Schedule;
};

export type Routine = {
  id: string;
  name: string;
  description?: string;
  category: Category;
  timeOfDay: TimeOfDay;
  active: boolean;
  steps: Step[];
  schedule: Schedule;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  verdict: Verdict;
  notes?: string;
};

export type Schedule = {
  frequency: ScheduleFrequency;
  timeOfDay: TimeOfDay;
  daysOfWeek?: number[];
  phases?: PhaseKey[];
  ends?: 'never' | 'date' | 'after';
  startDate?: string;
  endDate?: string;
  endAfterCount?: number;
  customIntervalDays?: number;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  flowerColorName: string;
};

export type CycleSyncMethod = 'menstrual' | 'lunar';

export type CycleSettings = {
  enabled: boolean;
  method: CycleSyncMethod;
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
};

export const DEFAULT_CYCLE_SETTINGS: CycleSettings = {
  enabled: false,
  method: 'menstrual',
  lastPeriodStart: '',
  cycleLength: 28,
  periodLength: 5,
};
