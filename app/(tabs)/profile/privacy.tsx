import { useRouter } from 'expo-router';
import { Alert, Text, View } from 'react-native';

import { PolicyLinkRow } from '@/components/profile/ProfileInfoRows';
import {
  ProfileScreenShell,
  profileBodyStyles as styles,
} from '@/components/profile/ProfileScreenShell';
import { FullWidthButton } from '@/components/ui/Button';
import { PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/appInfo';
import { openExternalUrl } from '@/lib/appLinking';
import { useAuth } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';

export default function PrivacyScreen() {
  const router = useRouter();
  const { resetAllData } = useAuth();
  const { showToast } = useToast();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete my account?',
      'This permanently removes your profile, routines, products, and all saved data from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            showToast('Account deleted', 'destructive');
            router.replace('/(auth)/splash');
          },
        },
      ],
    );
  };

  return (
    <ProfileScreenShell title="Privacy & Data" subtitle="Account">
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What we collect</Text>
        <Text style={styles.paragraph}>
          Account details you provide (name and email), routines, products, cycle settings, and
          completion history. This data is stored locally on your device.
        </Text>
        <Text style={[styles.paragraph, styles.paragraphLast]}>
          If you enable step reminders, iOS notification permissions are used to deliver alerts at
          the times you choose.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>How it&apos;s used</Text>
        <Text style={styles.paragraph}>
          Your data powers your personal flowr experience — showing today&apos;s steps, tracking
          progress, syncing routines to your cycle, and sending optional reminders.
        </Text>
        <Text style={[styles.paragraph, styles.paragraphLast]}>
          We do not sell your data. Cloud sync and analytics may be added in future releases with
          updated policies.
        </Text>
      </View>

      <View style={styles.card}>
        <PolicyLinkRow
          label="Terms of Service"
          first
          onPress={() => openExternalUrl(TERMS_URL)}
        />
        <PolicyLinkRow
          label="Privacy Policy"
          onPress={() => openExternalUrl(PRIVACY_POLICY_URL)}
        />
      </View>

      <View style={styles.footerSpacer} />
      <FullWidthButton
        label="Delete My Account"
        variant="danger"
        onPress={handleDeleteAccount}
      />
    </ProfileScreenShell>
  );
}
