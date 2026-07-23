import type { Category } from '@/constants/categories';
import type { Schedule, TimeOfDay } from '@/types';

/** Product info included in a shared routine (name + brand only). */
export type SharedRoutineProduct = {
  name: string;
  brand: string;
};

export type SharedRoutineStep = {
  name: string;
  note?: string;
  schedule?: Schedule;
  product?: SharedRoutineProduct;
};

/** JSON snapshot stored in shared_routines.snapshot — no verdicts or personal notes. */
export type SharedRoutineSnapshot = {
  name: string;
  category: Category;
  description?: string;
  timeOfDay: TimeOfDay;
  schedule: Schedule;
  steps: SharedRoutineStep[];
};

export type SharedRoutineRow = {
  id: string;
  routine_id: string;
  user_id: string;
  shared_at: string;
  snapshot: SharedRoutineSnapshot;
};
