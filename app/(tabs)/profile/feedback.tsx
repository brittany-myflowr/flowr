import { Text, View } from 'react-native';

import { PolicyLinkRow } from '@/components/profile/ProfileInfoRows';
import {
  ProfileScreenShell,
  profileBodyStyles as styles,
} from '@/components/profile/ProfileScreenShell';
import { FEEDBACK_EMAIL } from '@/constants/appInfo';
import { openFeedbackEmail } from '@/lib/appLinking';
import { useAuth } from '@/providers/AppStore';

export default function FeedbackScreen() {
  const { user } = useAuth();

  return (
    <ProfileScreenShell title="Send Feedback" subtitle="App">
      <View style={styles.card}>
        <Text style={[styles.paragraph, styles.paragraphLast]}>
          We&apos;d love to hear from you — ideas, bugs, or anything that would help us improve
          flowr.
        </Text>
      </View>

      <View style={styles.card}>
        <PolicyLinkRow
          label={FEEDBACK_EMAIL}
          first
          onPress={() => openFeedbackEmail(user?.email)}
        />
      </View>
    </ProfileScreenShell>
  );
}
