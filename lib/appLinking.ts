import { Alert, Linking } from 'react-native';

import { APP_VERSION, FEEDBACK_EMAIL, FEEDBACK_SUBJECT } from '@/constants/appInfo';

export async function openNotificationSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch {
    Alert.alert(
      'Unable to open settings',
      'Open your device Settings app and find flowr under Notifications.',
    );
  }
}

export async function openExternalUrl(url: string): Promise<void> {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Unable to open link', url);
      return;
    }

    await Linking.openURL(url);
  } catch {
    Alert.alert('Unable to open link', url);
  }
}

export async function openFeedbackEmail(accountEmail?: string): Promise<void> {
  const subject = encodeURIComponent(FEEDBACK_SUBJECT);
  const body = encodeURIComponent(
    [
      '',
      '---',
      `App version: ${APP_VERSION}`,
      accountEmail ? `Account: ${accountEmail}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  );

  const url = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(
        'No mail app found',
        `Email us at ${FEEDBACK_EMAIL} from your preferred mail app.`,
      );
      return;
    }

    await Linking.openURL(url);
  } catch {
    Alert.alert(
      'Unable to open email',
      `Email us at ${FEEDBACK_EMAIL} from your preferred mail app.`,
    );
  }
}
