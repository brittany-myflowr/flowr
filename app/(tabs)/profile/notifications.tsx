import { Text, View } from 'react-native';

import { FullWidthButton } from '@/components/ui/Button';
import { PermissionStatusRow } from '@/components/profile/ProfileInfoRows';
import {
  ProfileScreenShell,
  profileBodyStyles as styles,
} from '@/components/profile/ProfileScreenShell';
import { useNotificationPermissionStatus } from '@/hooks/useNotificationPermission';
import { openNotificationSettings } from '@/lib/appLinking';
import { ensureNotificationPermissions } from '@/lib/notifications';

export default function NotificationsScreen() {
  const { status, refresh } = useNotificationPermissionStatus();

  const handleEnable = async () => {
    await ensureNotificationPermissions();
    await refresh();
  };

  return (
    <ProfileScreenShell title="Notifications" subtitle="Account">
      <View style={styles.card}>
        <PermissionStatusRow status={status} />
        <Text style={styles.paragraph}>
          flowr uses notifications for step reminders. When you turn on a reminder for a routine
          step, the app will ask for permission and schedule a daily alert at your chosen time.
        </Text>
        <Text style={[styles.paragraph, styles.paragraphLast]}>
          To change sounds, banners, or delivery on iPhone, open your device notification settings
          for flowr.
        </Text>
      </View>

      {status === 'not_determined' ? (
        <FullWidthButton label="Enable Notifications" onPress={handleEnable} />
      ) : null}

      <FullWidthButton
        label="Open Notification Settings"
        variant={status === 'not_determined' ? 'ghost' : 'primary'}
        onPress={async () => {
          await openNotificationSettings();
          await refresh();
        }}
      />
    </ProfileScreenShell>
  );
}
