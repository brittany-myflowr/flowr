import * as Notifications from 'expo-notifications';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export type NotificationPermissionStatus = 'allowed' | 'denied' | 'not_determined';

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const permissions = await Notifications.getPermissionsAsync();

  if (
    permissions.granted ||
    permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return 'allowed';
  }

  if (
    permissions.ios?.status === Notifications.IosAuthorizationStatus.DENIED ||
    permissions.status === 'denied'
  ) {
    return 'denied';
  }

  return 'not_determined';
}

export function getNotificationPermissionLabel(status: NotificationPermissionStatus): string {
  switch (status) {
    case 'allowed':
      return 'Allowed';
    case 'denied':
      return 'Denied';
    case 'not_determined':
      return 'Not set';
  }
}

export function useNotificationPermissionStatus() {
  const [status, setStatus] = useState<NotificationPermissionStatus>('not_determined');

  const refresh = useCallback(async () => {
    setStatus(await getNotificationPermissionStatus());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { status, refresh };
}
