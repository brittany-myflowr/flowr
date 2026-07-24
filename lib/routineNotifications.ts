import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';

import { getTimeOfDayWindowBounds } from '@/hooks/useTimeOfDay';
import { getApplicableSteps } from '@/lib/applicableSteps';
import type { CycleSettings, Routine } from '@/types';

const IDS_STORAGE_KEY = '@flowr/v2/notification-ids';

type StoredIds = Record<string, { startId?: string; finishId?: string }>;

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

async function loadStoredIds(): Promise<StoredIds> {
  try {
    const raw = await AsyncStorage.getItem(IDS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredIds;
  } catch {
    return {};
  }
}

async function saveStoredIds(ids: StoredIds): Promise<void> {
  await AsyncStorage.setItem(IDS_STORAGE_KEY, JSON.stringify(ids));
}

async function cancelStored(ids: StoredIds): Promise<void> {
  const all = Object.values(ids).flatMap((entry) =>
    [entry.startId, entry.finishId].filter((id): id is string => Boolean(id)),
  );
  await Promise.all(all.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

const LOG_PREFIX = '[flowr/notifications]';

function isPermissionGranted(perms: Notifications.NotificationPermissionsStatus): boolean {
  // Expo docs: on iOS prefer ios.status over the root status/granted fields.
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

function reminderTimesForRoutine(routine: Routine, today: Date): {
  start: Date | null;
  finish: Date | null;
} {
  const mode = routine.notificationMode ?? 'timeOfDay';

  if (mode === 'specific') {
    const start = routine.notificationTime
      ? atLocalTime(today, routine.notificationTime)
      : null;
    return {
      start,
      finish: start ? addHours(start, 2) : null,
    };
  }

  const bounds = getTimeOfDayWindowBounds(routine.timeOfDay, today);
  return { start: bounds.start, finish: bounds.end };
}

/**
 * Cancel previous one-shot reminders and schedule today's start/finish
 * reminders for opted-in routines that still have work today.
 */
export async function syncTodayNotifications(input: {
  routines: Routine[];
  cycleSettings: CycleSettings;
  date?: Date;
}): Promise<void> {
  const today = input.date ?? new Date();
  const previous = await loadStoredIds();
  await cancelStored(previous);

  const perms = await Notifications.getPermissionsAsync();
  const permissionOk = isPermissionGranted(perms);

  if (__DEV__) {
    console.log(LOG_PREFIX, 'syncTodayNotifications start', {
      now: today.toISOString(),
      localNow: today.toString(),
      routineCount: input.routines.length,
      enabledCount: input.routines.filter((r) => r.notificationsEnabled).length,
      permissionOk,
      permission: {
        status: perms.status,
        granted: perms.granted,
        canAskAgain: perms.canAskAgain,
        ios: perms.ios
          ? {
              status: perms.ios.status,
              allowsAlert: perms.ios.allowsAlert,
              allowsSound: perms.ios.allowsSound,
              allowsBadge: perms.ios.allowsBadge,
              allowsDisplayInNotificationCenter:
                perms.ios.allowsDisplayInNotificationCenter,
              allowsDisplayOnLockScreen: perms.ios.allowsDisplayOnLockScreen,
              alertStyle: perms.ios.alertStyle,
            }
          : undefined,
        android: perms.android,
      },
    });
  }

  if (!permissionOk) {
    if (__DEV__) {
      console.log(LOG_PREFIX, 'abort sync — notification permission not granted');
    }
    await saveStoredIds({});
    return;
  }

  const nextIds: StoredIds = {};
  const title = 'Routine Reminder 🌸';

  for (const routine of input.routines) {
    if (!routine.notificationsEnabled) {
      continue;
    }
    if (!routine.active) {
      if (__DEV__) {
        console.log(LOG_PREFIX, 'skip — routine inactive', {
          id: routine.id,
          name: routine.name,
        });
      }
      continue;
    }

    const applicable = getApplicableSteps([routine], today, {
      cycleSettings: input.cycleSettings,
    });
    if (applicable.length === 0) {
      if (__DEV__) {
        console.log(LOG_PREFIX, 'skip — no steps applicable today', {
          id: routine.id,
          name: routine.name,
          frequency: routine.schedule.frequency,
          daysOfWeek: routine.schedule.daysOfWeek,
          timeOfDay: routine.timeOfDay,
          stepCount: routine.steps.length,
          mode: routine.notificationMode,
          notificationTime: routine.notificationTime,
        });
      }
      continue;
    }

    const completed = applicable.filter(({ step }) => step.done).length;
    const total = applicable.length;
    const allDone = completed === total;
    if (allDone) {
      if (__DEV__) {
        console.log(LOG_PREFIX, 'skip — all applicable steps done', {
          id: routine.id,
          name: routine.name,
          completed,
          total,
        });
      }
      continue;
    }

    const { start, finish } = reminderTimesForRoutine(routine, today);
    if (__DEV__) {
      console.log(LOG_PREFIX, 'candidate routine', {
        id: routine.id,
        name: routine.name,
        mode: routine.notificationMode ?? 'timeOfDay',
        notificationTime: routine.notificationTime,
        completed,
        total,
        start: start?.toISOString() ?? null,
        startLocal: start?.toString() ?? null,
        finish: finish?.toISOString() ?? null,
        msUntilStart: start ? start.getTime() - Date.now() : null,
      });
    }

    const entry: { startId?: string; finishId?: string } = {};

    if (completed === 0 && start) {
      const startId = await scheduleOneShot(start, title, `Time to start ${routine.name}`, {
        routineId: routine.id,
        kind: 'start',
      });
      if (startId) entry.startId = startId;
    } else if (__DEV__ && completed > 0) {
      console.log(LOG_PREFIX, 'skip start reminder — some steps already done', {
        id: routine.id,
        completed,
      });
    } else if (__DEV__ && !start) {
      console.log(LOG_PREFIX, 'skip start reminder — no start time', {
        id: routine.id,
        mode: routine.notificationMode,
        notificationTime: routine.notificationTime,
      });
    }

    if (completed < total && finish) {
      const finishId = await scheduleOneShot(
        finish,
        title,
        `Don't forget to finish ${routine.name}`,
        { routineId: routine.id, kind: 'finish' },
      );
      if (finishId) entry.finishId = finishId;
    }

    if (entry.startId || entry.finishId) {
      nextIds[routine.id] = entry;
    }
  }

  await saveStoredIds(nextIds);

  if (__DEV__) {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(LOG_PREFIX, 'syncTodayNotifications done', {
      storedIds: nextIds,
      osScheduledCount: scheduled.length,
      osScheduled: scheduled.map((item) => ({
        id: item.identifier,
        title: item.content.title,
        body: item.content.body,
        data: item.content.data,
        trigger: item.trigger,
      })),
    });
  }
}
