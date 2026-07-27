import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';

import { getTimeOfDayWindowBounds } from '@/hooks/useTimeOfDay';
import { getApplicableSteps } from '@/lib/applicableSteps';
import {
  type DailyCompletionMap,
  normalizeDailyCompletionEntry,
} from '@/lib/completion';
import { formatDateKey } from '@/lib/dateKey';
import type { CycleSettings, Routine } from '@/types';

/**
 * Rolling forward window (today inclusive).
 * iOS allows ~64 pending local notifications per app — see MAX_PENDING_NOTIFICATIONS.
 */
export const NOTIFICATION_WINDOW_DAYS = 10;

/** Leave headroom under iOS’s ~64 pending limit. Nearest fire times win when capped. */
export const MAX_PENDING_NOTIFICATIONS = 60;

const IDS_STORAGE_KEY = '@flowr/v3/notification-ids';
const LOG_PREFIX = '[flowr/notifications]';
const TITLE = 'Routine Reminder 🌸';

/** Map of `{routineId}_{YYYY-MM-DD}_{start|finish}` → expo notification id */
type StoredIds = Record<string, string>;

type ReminderKind = 'start' | 'finish';

type Candidate = {
  key: string;
  routineId: string;
  dateKey: string;
  kind: ReminderKind;
  when: Date;
  body: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Native alert when OS notification permission is denied. */
export function alertNotificationsPermissionDenied(): void {
  Alert.alert(
    'Notifications are off',
    'Turn on notifications in Settings to get reminders for this routine.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          void Linking.openSettings();
        },
      },
    ],
  );
}

function parseHhMm(value: string): { hours: number; minutes: number } | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

export function formatHhMm(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function atLocalTime(base: Date, hhmm: string): Date | null {
  const parsed = parseHhMm(hhmm);
  if (!parsed) return null;
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    parsed.hours,
    parsed.minutes,
    0,
    0,
  );
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function notificationStorageKey(
  routineId: string,
  dateKey: string,
  kind: ReminderKind,
): string {
  return `${routineId}_${dateKey}_${kind}`;
}

function parseStorageKey(
  key: string,
): { routineId: string; dateKey: string; kind: ReminderKind } | null {
  const match = key.match(/^(.+)_(\d{4}-\d{2}-\d{2})_(start|finish)$/);
  if (!match) return null;
  return {
    routineId: match[1],
    dateKey: match[2],
    kind: match[3] as ReminderKind,
  };
}

async function loadStoredIds(): Promise<StoredIds> {
  try {
    const raw = await AsyncStorage.getItem(IDS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    // Drop legacy v2 shape `{ [routineId]: { startId, finishId } }`
    const entries = Object.entries(parsed as Record<string, unknown>);
    const next: StoredIds = {};
    for (const [key, value] of entries) {
      if (typeof value === 'string' && parseStorageKey(key)) {
        next[key] = value;
      }
    }
    return next;
  } catch {
    return {};
  }
}

async function saveStoredIds(ids: StoredIds): Promise<void> {
  await AsyncStorage.setItem(IDS_STORAGE_KEY, JSON.stringify(ids));
}

async function cancelNotificationIds(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)),
  );
}

function isPermissionGranted(perms: Notifications.NotificationPermissionsStatus): boolean {
  if (Platform.OS === 'ios' && perms.ios?.status != null) {
    const { IosAuthorizationStatus } = Notifications;
    return (
      perms.ios.status === IosAuthorizationStatus.AUTHORIZED ||
      perms.ios.status === IosAuthorizationStatus.PROVISIONAL ||
      perms.ios.status === IosAuthorizationStatus.EPHEMERAL
    );
  }
  return perms.granted;
}

export async function getNotificationPermissionStatus(): Promise<
  Notifications.PermissionStatus
> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/** Request OS permission. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('routine-reminders', {
      name: 'Routine reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (isPermissionGranted(current)) return true;
  if (current.status === 'denied' && !current.canAskAgain) return false;

  const next = await Notifications.requestPermissionsAsync();
  return isPermissionGranted(next);
}

async function scheduleOneShot(
  when: Date,
  title: string,
  body: string,
  data: Record<string, string>,
): Promise<string | null> {
  const msUntil = when.getTime() - Date.now();
  if (msUntil <= 0) {
    if (__DEV__) {
      console.log(LOG_PREFIX, 'skip schedule — trigger already in the past', {
        when: when.toISOString(),
        msUntil,
        data,
      });
    }
    return null;
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        ...(Platform.OS === 'android' ? { channelId: 'routine-reminders' } : {}),
      },
    });
    if (__DEV__) {
      console.log(LOG_PREFIX, 'scheduled', {
        id,
        when: when.toISOString(),
        local: when.toString(),
        msUntil,
        title,
        body,
        data,
      });
    }
    return id;
  } catch (error) {
    console.warn(LOG_PREFIX, 'scheduleNotificationAsync failed', { when, data, error });
    return null;
  }
}

/** Specific-time finish fires this many hours after the chosen start time. */
const SPECIFIC_FINISH_OFFSET_HOURS = 2;

/** Time-of-day finish fires this many hours after the window start. */
const TIME_OF_DAY_FINISH_OFFSET_HOURS = 3;

function reminderTimesForRoutine(
  routine: Routine,
  day: Date,
): { start: Date | null; finish: Date | null } {
  const mode = routine.notificationMode ?? 'timeOfDay';

  if (mode === 'specific') {
    const start = routine.notificationTime
      ? atLocalTime(day, routine.notificationTime)
      : null;
    return {
      start,
      finish: start ? addHours(start, SPECIFIC_FINISH_OFFSET_HOURS) : null,
    };
  }

  const bounds = getTimeOfDayWindowBounds(routine.timeOfDay, day);
  return {
    start: bounds.start,
    finish: addHours(bounds.start, TIME_OF_DAY_FINISH_OFFSET_HOURS),
  };
}

function completedCountForDay(
  routine: Routine,
  day: Date,
  cycleSettings: CycleSettings,
  dailyCompletions: DailyCompletionMap | undefined,
  now: Date,
): { total: number; completed: number } {
  const applicable = getApplicableSteps([routine], day, { cycleSettings });
  const total = applicable.length;
  if (total === 0) return { total: 0, completed: 0 };

  const dayKey = formatDateKey(day);
  const todayKey = formatDateKey(now);

  if (dayKey === todayKey) {
    return {
      total,
      completed: applicable.filter(({ step }) => step.done).length,
    };
  }

  const entry = normalizeDailyCompletionEntry(dailyCompletions?.[dayKey]);
  if (!entry) return { total, completed: 0 };

  const applicableIds = new Set(applicable.map(({ step }) => step.id));
  const completed = entry.completed.filter((id) => applicableIds.has(id)).length;
  return { total, completed };
}

/** Cancel every stored notification for one routine (disable / delete). */
export async function cancelNotificationsForRoutine(routineId: string): Promise<void> {
  const stored = await loadStoredIds();
  const prefix = `${routineId}_`;
  const toCancel: string[] = [];
  const next: StoredIds = {};

  for (const [key, id] of Object.entries(stored)) {
    if (key.startsWith(prefix) && parseStorageKey(key)?.routineId === routineId) {
      toCancel.push(id);
    } else {
      next[key] = id;
    }
  }

  await cancelNotificationIds(toCancel);
  await saveStoredIds(next);

  if (__DEV__) {
    console.log(LOG_PREFIX, 'cancelNotificationsForRoutine', {
      routineId,
      cancelled: toCancel.length,
    });
  }
}

/**
 * Reconcile a rolling forward window of local reminders.
 * Cancels prior managed ids, then schedules start/finish for each eligible day
 * in [today, today + WINDOW_DAYS). Nearest fire times are preferred when
 * approaching the iOS pending-notification limit.
 */
export async function syncUpcomingNotifications(input: {
  routines: Routine[];
  cycleSettings: CycleSettings;
  dailyCompletions?: DailyCompletionMap;
  now?: Date;
  windowDays?: number;
}): Promise<void> {
  const now = input.now ?? new Date();
  const windowDays = input.windowDays ?? NOTIFICATION_WINDOW_DAYS;
  const previous = await loadStoredIds();
  await cancelNotificationIds(Object.values(previous));

  const perms = await Notifications.getPermissionsAsync();
  const permissionOk = isPermissionGranted(perms);

  if (__DEV__) {
    console.log(LOG_PREFIX, 'syncUpcomingNotifications start', {
      now: now.toISOString(),
      localNow: now.toString(),
      windowDays,
      maxPending: MAX_PENDING_NOTIFICATIONS,
      routineCount: input.routines.length,
      enabledCount: input.routines.filter((r) => r.notificationsEnabled).length,
      permissionOk,
    });
  }

  if (!permissionOk) {
    if (__DEV__) {
      console.log(LOG_PREFIX, 'abort sync — notification permission not granted');
    }
    await saveStoredIds({});
    return;
  }

  const candidates: Candidate[] = [];

  for (let offset = 0; offset < windowDays; offset += 1) {
    const day = addDays(now, offset);
    const dateKey = formatDateKey(day);

    for (const routine of input.routines) {
      if (!routine.notificationsEnabled || !routine.active) continue;

      const applicable = getApplicableSteps([routine], day, {
        cycleSettings: input.cycleSettings,
      });
      if (applicable.length === 0) continue;

      const { total, completed } = completedCountForDay(
        routine,
        day,
        input.cycleSettings,
        input.dailyCompletions,
        now,
      );

      // Live-day completion: if every applicable step is done, skip this day
      // entirely (cancels start + finish for that day on reconcile).
      if (total > 0 && completed >= total) {
        if (__DEV__) {
          console.log(LOG_PREFIX, 'skip day — routine complete', {
            routineId: routine.id,
            dateKey,
            completed,
            total,
          });
        }
        continue;
      }

      const { start, finish } = reminderTimesForRoutine(routine, day);

      // Start only when nothing is done yet for that day.
      if (completed === 0 && start) {
        candidates.push({
          key: notificationStorageKey(routine.id, dateKey, 'start'),
          routineId: routine.id,
          dateKey,
          kind: 'start',
          when: start,
          body: `Time to start ${routine.name}`,
        });
      }

      // Finish: schedule whenever the day still has incomplete work.
      // Future days (never opened) always get finish if applicable.
      if (finish) {
        candidates.push({
          key: notificationStorageKey(routine.id, dateKey, 'finish'),
          routineId: routine.id,
          dateKey,
          kind: 'finish',
          when: finish,
          body: `Don't forget to finish ${routine.name}`,
        });
      }
    }
  }

  const future = candidates
    .filter((c) => c.when.getTime() > Date.now())
    .sort((a, b) => a.when.getTime() - b.when.getTime());

  const capped = future.slice(0, MAX_PENDING_NOTIFICATIONS);
  if (__DEV__ && future.length > capped.length) {
    console.warn(LOG_PREFIX, 'capped pending notifications under iOS limit', {
      candidates: future.length,
      scheduled: capped.length,
      max: MAX_PENDING_NOTIFICATIONS,
      windowDays,
    });
  }

  const nextIds: StoredIds = {};

  for (const candidate of capped) {
    const id = await scheduleOneShot(candidate.when, TITLE, candidate.body, {
      routineId: candidate.routineId,
      dateKey: candidate.dateKey,
      kind: candidate.kind,
    });
    if (id) nextIds[candidate.key] = id;
  }

  await saveStoredIds(nextIds);

  if (__DEV__) {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(LOG_PREFIX, 'syncUpcomingNotifications done', {
      storedCount: Object.keys(nextIds).length,
      osScheduledCount: scheduled.length,
      storedKeys: Object.keys(nextIds),
    });
  }
}

/** @deprecated Use syncUpcomingNotifications — kept for call-site compatibility. */
export async function syncTodayNotifications(input: {
  routines: Routine[];
  cycleSettings: CycleSettings;
  dailyCompletions?: DailyCompletionMap;
  date?: Date;
}): Promise<void> {
  return syncUpcomingNotifications({
    routines: input.routines,
    cycleSettings: input.cycleSettings,
    dailyCompletions: input.dailyCompletions,
    now: input.date,
  });
}
