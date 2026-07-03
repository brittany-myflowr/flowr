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
import { ACCOUNT_DELETION_GRACE_DAYS } from '@/lib/supabase/auth';
import { useAuth } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';

export default function PrivacyScreen() {
  const router = useRouter();
  const { deleteAccount } = useAuth();
  const { showToast } = useToast();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete my account?',
      `Your account will be scheduled for deletion. You have ${ACCOUNT_DELETION_GRACE_DAYS} days to sign back in and restore it before your profile, routines, products, and history are permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: async () => {
            const error = await deleteAccount();
            if (error) {
              Alert.alert('Could not delete account', error);
              return;
            }

            showToast('Account scheduled for deletion', 'destructive');
            router.replace('/(auth)/splash');
          },
        },
      ],
    );
  };

  return (
    <ProfileScreenShell title="Privacy & Data" subtitle="Account">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>What we collect</Text>
        <Text style={styles.paragraph}>
          Account details you provide (name and email), routines, products, cycle settings, and
          completion history. Your data is synced securely to flowr cloud storage.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>How it&apos;s used</Text>
        <Text style={styles.paragraph}>
          Your data powers your personal flowr experience — showing today&apos;s steps, tracking
          progress, and syncing routines to your cycle.
        </Text>
        <Text style={[styles.paragraph, styles.paragraphLast]}>
          We do not sell your data. See our privacy policy for full details.
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
