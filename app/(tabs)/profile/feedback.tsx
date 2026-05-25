import { useEffect, useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import {
  ProfileScreenShell,
  profileBodyStyles as styles,
} from '@/components/profile/ProfileScreenShell';
import { FullWidthButton } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { FEEDBACK_EMAIL, FEEDBACK_SUBJECT } from '@/constants/appInfo';
import { openFeedbackEmail } from '@/lib/appLinking';
import { useAuth } from '@/providers/AppStore';

export default function FeedbackScreen() {
  const { user } = useAuth();
  const openedRef = useRef(false);

  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    void openFeedbackEmail(user?.email);
  }, [user?.email]);

  return (
    <ProfileScreenShell title="Send Feedback" subtitle="App">
      <View style={styles.card}>
        <ActivityIndicator color={colors.blue} style={styles.loader} />
        <Text style={styles.paragraph}>
          Opening your email app with a message to {FEEDBACK_EMAIL}.
        </Text>
        <Text style={[styles.paragraph, styles.paragraphLast]}>
          Subject line: <Text style={styles.valueInline}>{FEEDBACK_SUBJECT}</Text>
        </Text>
      </View>

      <FullWidthButton
        label="Open Email Again"
        onPress={() => openFeedbackEmail(user?.email)}
      />
    </ProfileScreenShell>
  );
}
