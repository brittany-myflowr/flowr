import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { PolicyLinkRow } from '@/components/profile/ProfileInfoRows';
import {
  ProfileScreenShell,
  profileBodyStyles as styles,
} from '@/components/profile/ProfileScreenShell';
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_VERSION,
  PRIVACY_POLICY_URL,
  TERMS_URL,
} from '@/constants/appInfo';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { openExternalUrl } from '@/lib/appLinking';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <ProfileScreenShell title="About flowr" subtitle="App">
      <View style={styles.card}>
        <View style={aboutStyles.hero}>
          <Daisy color={colors.blue} size={36} />
          <Text style={aboutStyles.wordmark}>{APP_NAME}</Text>
        </View>
        <Text style={styles.meta}>Version {APP_VERSION}</Text>
        <Text style={[styles.paragraph, styles.paragraphLast]}>{APP_DESCRIPTION}</Text>
      </View>

      <View style={styles.card}>
        <PolicyLinkRow
          label="Privacy & Data"
          first
          onPress={() => router.push('/(tabs)/profile/privacy')}
        />
        <PolicyLinkRow
          label="Terms of Service"
          onPress={() => openExternalUrl(TERMS_URL)}
        />
        <PolicyLinkRow
          label="Privacy Policy"
          onPress={() => openExternalUrl(PRIVACY_POLICY_URL)}
        />
      </View>
    </ProfileScreenShell>
  );
}

const aboutStyles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  wordmark: {
    fontFamily: fonts.lora,
    fontSize: 22,
    fontStyle: 'italic',
    color: colors.navy,
    transform: [{ skewX: '-8deg' }],
  },
});
