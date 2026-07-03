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

export function reconcileDailyCompletionsOnLoad(
  routines: Routine[],
  cycleSettings: CycleSettings,
  dailyCompletions: DailyCompletionMap,
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
  return snapshotTodayCompletion(routines, cycleSettings, pruned);
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
