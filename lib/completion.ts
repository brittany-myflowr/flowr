import { getApplicableSteps } from '@/lib/applicableSteps';
import { formatDateKey } from '@/lib/dateKey';
import { collectStepIds } from '@/lib/todayOrder';
import type { CycleSettings, Routine } from '@/types';

export type DailyCompletion = {
  scheduled: string[];
  completed: string[];
};

export type LegacyDailyCompletion = {
  completed: number;
  total: number;
};

export type DailyCompletionEntry = DailyCompletion | LegacyDailyCompletion;

export type DailyCompletionMap = Record<string, DailyCompletionEntry>;

export type DailyCompletionStats = {
  scheduled: number;
  completed: number;
  isOffDay: boolean;
  isComplete: boolean;
  hasProgress: boolean;
};

export function isLegacyDailyCompletion(
  entry: DailyCompletionEntry,
): entry is LegacyDailyCompletion {
  return 'total' in entry && typeof entry.total === 'number' && !('scheduled' in entry);
}

export function normalizeDailyCompletionEntry(
  entry: DailyCompletionEntry | undefined,
): DailyCompletion | null {
  if (!entry || isLegacyDailyCompletion(entry)) return null;

  if (Array.isArray(entry.scheduled) && Array.isArray(entry.completed)) {
    const scheduledSet = new Set(entry.scheduled);
    return {
      scheduled: entry.scheduled,
      completed: entry.completed.filter((id) => scheduledSet.has(id)),
    };
  }

  return null;
}

export function getDailyCompletionStats(
  entry: DailyCompletionEntry | undefined,
): DailyCompletionStats {
  if (!entry) {
    return { scheduled: 0, completed: 0, isOffDay: true, isComplete: false, hasProgress: false };
  }

  if (isLegacyDailyCompletion(entry)) {
    const scheduled = entry.total;
    const completed = Math.min(entry.completed, scheduled);
    const isOffDay = scheduled === 0;
    const isComplete = scheduled > 0 && completed >= scheduled;
    const hasProgress = completed > 0 && !isComplete;

    return { scheduled, completed, isOffDay, isComplete, hasProgress };
  }

  const scheduled = entry.scheduled.length;
  const scheduledSet = new Set(entry.scheduled);
  const completed = entry.completed.filter((id) => scheduledSet.has(id)).length;
  const isOffDay = scheduled === 0;
  const isComplete = scheduled > 0 && completed >= scheduled;
  const hasProgress = completed > 0 && !isComplete;

  return { scheduled, completed, isOffDay, isComplete, hasProgress };
}

export function isDayComplete(entry: DailyCompletionEntry | undefined): boolean {
  return getDailyCompletionStats(entry).isComplete;
}

export function buildDailyCompletionSnapshot(
  routines: Routine[],
  cycleSettings: CycleSettings,
  date = new Date(),
): DailyCompletion | null {
  const applicable = getApplicableSteps(routines, date, { cycleSettings });
  const scheduled = applicable.map(({ step }) => step.id);

  if (scheduled.length === 0) return null;

  const completed = applicable.filter(({ step }) => step.done).map(({ step }) => step.id);

  return { scheduled, completed };
}

export function pruneDailyCompletions(
  dailyCompletions: DailyCompletionMap,
  validStepIds: Set<string>,
): DailyCompletionMap {
  const cleaned: DailyCompletionMap = {};

  for (const [key, entry] of Object.entries(dailyCompletions)) {
    if (isLegacyDailyCompletion(entry)) {
      cleaned[key] = entry;
      continue;
    }

    const normalized = normalizeDailyCompletionEntry(entry);
    if (!normalized) continue;

    const scheduled = normalized.scheduled.filter((id) => validStepIds.has(id));
    if (scheduled.length === 0) continue;

    const scheduledSet = new Set(scheduled);
    const completed = normalized.completed.filter((id) => scheduledSet.has(id));
    cleaned[key] = { scheduled, completed };
  }

  return cleaned;
}

export function snapshotTodayCompletion(
  routines: Routine[],
  cycleSettings: CycleSettings,
  existing: DailyCompletionMap,
  date = new Date(),
): DailyCompletionMap {
  const today = formatDateKey(date);
  const snapshot = buildDailyCompletionSnapshot(routines, cycleSettings, date);

  if (!snapshot) {
    if (!(today in existing)) return existing;
    const { [today]: _removed, ...rest } = existing;
    return rest;
  }

  return { ...existing, [today]: snapshot };
}

/**
 * Reconcile persisted/remote completions after load.
 *
 * Important: do NOT rebuild today's `completed` from `step.done`.
 * Persistence intentionally clears `step.done` (session-only), so rebuilding
 * from those flags would wipe today's checkmarks on every cold start.
 * Keep stored completed IDs and only refresh today's `scheduled` list.
 */
export function reconcileDailyCompletionsOnLoad(
  routines: Routine[],
  cycleSettings: CycleSettings,
  dailyCompletions: DailyCompletionMap,
  date = new Date(),
): DailyCompletionMap {
  const cleaned: DailyCompletionMap = {};

  for (const [key, entry] of Object.entries(dailyCompletions)) {
    const normalized = normalizeDailyCompletionEntry(entry);
    if (normalized) {
      cleaned[key] = normalized;
    } else if (isLegacyDailyCompletion(entry)) {
      cleaned[key] = entry;
    }
  }

  const pruned = pruneDailyCompletions(cleaned, new Set(collectStepIds(routines)));
  const today = formatDateKey(date);
  const applicable = getApplicableSteps(routines, date, { cycleSettings });
  const scheduled = applicable.map(({ step }) => step.id);

  if (scheduled.length === 0) {
    if (!(today in pruned)) return pruned;
    const { [today]: _removed, ...rest } = pruned;
    return rest;
  }

  const existing = normalizeDailyCompletionEntry(pruned[today]);
  const scheduledSet = new Set(scheduled);
  const completed = (existing?.completed ?? []).filter((id) => scheduledSet.has(id));

  return {
    ...pruned,
    [today]: { scheduled, completed },
  };
}

/** Restore live `step.done` flags from today's dailyCompletions entry. */
export function applyTodayCompletionsToRoutines(
  routines: Routine[],
  dailyCompletions: DailyCompletionMap,
  date = new Date(),
): Routine[] {
  const today = formatDateKey(date);
  const entry = normalizeDailyCompletionEntry(dailyCompletions[today]);
  const completed = new Set(entry?.completed ?? []);

  return routines.map((routine) => ({
    ...routine,
    steps: routine.steps.map((step) => ({
      ...step,
      done: completed.has(step.id),
    })),
  }));
}

/**
 * Full load-time hydrate: preserve completions, then reapply onto routines.
 */
export function hydrateRoutinesWithCompletions(
  routines: Routine[],
  cycleSettings: CycleSettings,
  dailyCompletions: DailyCompletionMap,
  date = new Date(),
): { routines: Routine[]; dailyCompletions: DailyCompletionMap } {
  const reconciled = reconcileDailyCompletionsOnLoad(
    routines,
    cycleSettings,
    dailyCompletions,
    date,
  );
  return {
    routines: applyTodayCompletionsToRoutines(routines, reconciled, date),
    dailyCompletions: reconciled,
  };
}

/**
 * Union local + remote completion maps so a wiped remote today cannot erase
 * checkmarks still present in the device cache (and vice versa).
 */
export function mergeDailyCompletions(
  local: DailyCompletionMap,
  remote: DailyCompletionMap,
): DailyCompletionMap {
  const keys = new Set([...Object.keys(local), ...Object.keys(remote)]);
  const merged: DailyCompletionMap = {};

  for (const key of keys) {
    const localRaw = local[key];
    const remoteRaw = remote[key];
    const localEntry = normalizeDailyCompletionEntry(localRaw);
    const remoteEntry = normalizeDailyCompletionEntry(remoteRaw);

    if (localEntry && remoteEntry) {
      const scheduled = Array.from(new Set([...remoteEntry.scheduled, ...localEntry.scheduled]));
      const scheduledSet = new Set(scheduled);
      const completed = Array.from(
        new Set([...remoteEntry.completed, ...localEntry.completed]),
      ).filter((id) => scheduledSet.has(id));
      merged[key] = { scheduled, completed };
      continue;
    }

    if (localEntry) {
      merged[key] = localEntry;
      continue;
    }
    if (remoteEntry) {
      merged[key] = remoteEntry;
      continue;
    }
    if (localRaw && isLegacyDailyCompletion(localRaw)) {
      merged[key] = localRaw;
      continue;
    }
    if (remoteRaw && isLegacyDailyCompletion(remoteRaw)) {
      merged[key] = remoteRaw;
    }
  }

  return merged;
}

export function getCompletionForDate(
  date: Date,
  dailyCompletions: DailyCompletionMap,
  routines: Routine[],
  cycleSettings: CycleSettings,
): DailyCompletionStats {
  const key = formatDateKey(date);
  const stored = dailyCompletions[key];

  if (stored) {
    return getDailyCompletionStats(stored);
  }

  const liveSnapshot = buildDailyCompletionSnapshot(routines, cycleSettings, date);
  const scheduledCount = liveSnapshot?.scheduled.length ?? 0;

  if (scheduledCount === 0) {
    return { scheduled: 0, completed: 0, isOffDay: true, isComplete: false, hasProgress: false };
  }

  return {
    scheduled: scheduledCount,
    completed: 0,
    isOffDay: false,
    isComplete: false,
    hasProgress: false,
  };
}

export function computeStreak(
  dailyCompletions: DailyCompletionMap,
  routines: Routine[],
  cycleSettings: CycleSettings,
  today = new Date(),
): number {
  let streak = 0;
  const cursor = new Date(today);
  const todayKey = formatDateKey(today);

  for (let dayIndex = 0; dayIndex < 366; dayIndex += 1) {
    const key = formatDateKey(cursor);
    const stats = getCompletionForDate(cursor, dailyCompletions, routines, cycleSettings);
    const isToday = key === todayKey;

    if (stats.isOffDay) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (stats.isComplete) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (isToday) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    break;
  }

  return streak;
}

/** @deprecated Use getApplicableSteps from lib/applicableSteps */
export type ScheduledStep = {
  step: import('@/types').Step;
  routine: Routine;
};
