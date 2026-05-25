import * as Notifications from 'expo-notifications';

import type { Routine, Step } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function cancelStepReminderNotification(stepId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(stepId);
  } catch {
    // Notification may not exist yet.
  }
}

export async function syncStepReminderNotification(
  step: Step,
  routine: Routine,
): Promise<boolean> {
  await cancelStepReminderNotification(step.id);

  if (!step.reminder?.enabled) return true;

  const granted = await ensureNotificationPermissions();
  if (!granted) return false;

  await Notifications.scheduleNotificationAsync({
    identifier: step.id,
    content: {
      title: routine.name,
      body: step.name,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: step.reminder.hour,
      minute: step.reminder.minute,
    },
  });

  return true;
}

export async function syncAllStepReminders(routines: Routine[]): Promise<void> {
  for (const routine of routines) {
    if (!routine.active) continue;

    for (const step of routine.steps) {
      if (step.reminder?.enabled) {
        await syncStepReminderNotification(step, routine);
      }
    }
  }
}
