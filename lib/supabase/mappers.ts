import type { Category } from '@/constants/categories';
import type { DailyCompletionMap } from '@/lib/completion';
import { isLegacyDailyCompletion, normalizeDailyCompletionEntry } from '@/lib/completion';
import { EMPTY_TODAY_STEP_ORDERS, type TodayStepOrderMap } from '@/lib/todayOrder';
import type {
  CycleSettings,
  CycleSyncMethod,
  Product,
  Routine,
  Schedule,
  Step,
  TimeOfDay,
  User,
  Verdict,
} from '@/types';
import { DEFAULT_CYCLE_SETTINGS } from '@/types';

export type ProfileRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  flower_color_name: string;
  trial_started_at: string | null;
  deletion_scheduled_at: string | null;
  created_at: string;
};

export type RoutineRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string;
  time_of_day: string;
  active: boolean;
  schedule: Schedule;
  created_at: string;
};

export type StepRow = {
  id: string;
  user_id: string;
  routine_id: string;
  name: string;
  note: string | null;
  category: string;
  schedule: Schedule | null;
  product_id: string | null;
  product_name: string | null;
  order_index: number;
  created_at: string;
};

export type ProductRow = {
  id: string;
  user_id: string;
  name: string;
  brand: string;
  category: string;
  verdict: string | null;
  notes: string | null;
  created_at: string;
};

export type DailyCompletionRow = {
  id: string;
  user_id: string;
  date: string;
  scheduled_step_ids: string[];
  completed_step_ids: string[];
  created_at: string;
};

export type TodayStepOrdersRow = {
  id: string;
  user_id: string;
  morning: string[];
  afternoon: string[];
  evening: string[];
  updated_at: string;
};

export type CycleSettingsRow = {
  id: string;
  user_id: string;
  enabled: boolean;
  method: string;
  last_period_start: string | null;
  cycle_length: number;
  period_length: number;
  updated_at: string;
};

export type RemoteUserData = {
  profile: ProfileRow;
  routines: Routine[];
  products: Product[];
  dailyCompletions: DailyCompletionMap;
  cycleSettings: CycleSettings;
  todayStepOrders: TodayStepOrderMap;
  trialStartedAt: string | null;
};

export function profileRowToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    flowerColorName: profile.flower_color_name,
  };
}

export function userToProfileUpdate(user: User, trialStartedAt: string | null) {
  return {
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    flower_color_name: user.flowerColorName,
    trial_started_at: trialStartedAt,
  };
}

export function assembleRoutines(routineRows: RoutineRow[], stepRows: StepRow[]): Routine[] {
  const stepsByRoutine = new Map<string, StepRow[]>();

  for (const step of stepRows) {
    const existing = stepsByRoutine.get(step.routine_id) ?? [];
    existing.push(step);
    stepsByRoutine.set(step.routine_id, existing);
  }

  return routineRows.map((routine) => {
    const steps = (stepsByRoutine.get(routine.id) ?? [])
      .sort((a, b) => a.order_index - b.order_index)
      .map(stepRowToStep);

    return {
      id: routine.id,
      name: routine.name,
      description: routine.description?.trim() || undefined,
      category: routine.category as Category,
      timeOfDay: routine.time_of_day as TimeOfDay,
      active: routine.active,
      schedule: routine.schedule,
      steps,
    };
  });
}

function stepRowToStep(row: StepRow): Step {
  return {
    id: row.id,
    name: row.name,
    note: row.note ?? undefined,
    category: row.category as Category,
    done: false,
    productId: row.product_id ?? undefined,
    productName: row.product_name ?? undefined,
    schedule: row.schedule ?? undefined,
  };
}

export function flattenRoutinesToRows(routines: Routine[], userId: string) {
  const routineRows: Omit<RoutineRow, 'created_at'>[] = [];
  const stepRows: Omit<StepRow, 'created_at'>[] = [];

  for (const routine of routines) {
    routineRows.push({
      id: routine.id,
      user_id: userId,
      name: routine.name,
      description: routine.description?.trim() || null,
      category: routine.category,
      time_of_day: routine.timeOfDay,
      active: routine.active,
      schedule: routine.schedule,
    });

    routine.steps.forEach((step, index) => {
      stepRows.push({
        id: step.id,
        user_id: userId,
        routine_id: routine.id,
        name: step.name,
        note: step.note ?? null,
        category: step.category,
        schedule: step.schedule ?? null,
        product_id: step.productId ?? null,
        product_name: step.productName ?? null,
        order_index: index,
      });
    });
  }

  return { routineRows, stepRows };
}

export function productRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category as Category,
    verdict: row.verdict ? (row.verdict as Verdict) : undefined,
    notes: row.notes ?? undefined,
  };
}

export function productToRow(product: Product, userId: string): Omit<ProductRow, 'created_at'> {
  return {
    id: product.id,
    user_id: userId,
    name: product.name,
    brand: product.brand,
    category: product.category,
    verdict: product.verdict ?? null,
    notes: product.notes ?? null,
  };
}

export function dailyCompletionsToRows(
  dailyCompletions: DailyCompletionMap,
  userId: string,
): Array<Omit<DailyCompletionRow, 'id' | 'created_at'> & { id?: string }> {
  const rows: Array<Omit<DailyCompletionRow, 'id' | 'created_at'> & { id?: string }> = [];

  for (const [date, entry] of Object.entries(dailyCompletions)) {
    if (isLegacyDailyCompletion(entry)) continue;

    const normalized = normalizeDailyCompletionEntry(entry);
    if (!normalized) continue;

    rows.push({
      user_id: userId,
      date,
      scheduled_step_ids: normalized.scheduled,
      completed_step_ids: normalized.completed,
    });
  }

  return rows;
}

export function dailyCompletionRowsToMap(rows: DailyCompletionRow[]): DailyCompletionMap {
  const map: DailyCompletionMap = {};

  for (const row of rows) {
    map[row.date] = {
      scheduled: row.scheduled_step_ids,
      completed: row.completed_step_ids,
    };
  }

  return map;
}

export function todayStepOrdersRowToMap(row: TodayStepOrdersRow | null): TodayStepOrderMap {
  if (!row) return EMPTY_TODAY_STEP_ORDERS;

  return {
    morning: row.morning ?? [],
    afternoon: row.afternoon ?? [],
    evening: row.evening ?? [],
  };
}

export function todayStepOrdersToRow(
  orders: TodayStepOrderMap,
  userId: string,
  existingId?: string,
): Omit<TodayStepOrdersRow, 'created_at' | 'updated_at' | 'id'> & { id?: string } {
  return {
    id: existingId,
    user_id: userId,
    morning: orders.morning,
    afternoon: orders.afternoon,
    evening: orders.evening,
  };
}

export function cycleSettingsRowToDomain(row: CycleSettingsRow | null): CycleSettings {
  if (!row) return DEFAULT_CYCLE_SETTINGS;

  return {
    enabled: row.enabled,
    method: row.method as CycleSyncMethod,
    lastPeriodStart: row.last_period_start ?? '',
    cycleLength: row.cycle_length,
    periodLength: row.period_length,
  };
}

export function cycleSettingsToRow(
  settings: CycleSettings,
  userId: string,
  existingId?: string,
): Omit<CycleSettingsRow, 'created_at' | 'updated_at' | 'id'> & { id?: string } {
  return {
    id: existingId,
    user_id: userId,
    enabled: settings.enabled,
    method: settings.method,
    last_period_start: settings.lastPeriodStart || null,
    cycle_length: settings.cycleLength,
    period_length: settings.periodLength,
  };
}
