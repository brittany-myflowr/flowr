import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/brand';
import { PolicyLinkRow } from '@/components/profile/ProfileInfoRows';
import {
  ProfileScreenShell,
  profileBodyStyles as styles,
} from '@/components/profile/ProfileScreenShell';
import {
  APP_DESCRIPTION,
  APP_VERSION,
  PRIVACY_POLICY_URL,
  TERMS_URL,
} from '@/constants/appInfo';
import { colors } from '@/constants/colors';
import { openExternalUrl } from '@/lib/appLinking';
import { s, fs } from '@/lib/scale';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <ProfileScreenShell title="About flowr" subtitle="App">
      <View style={styles.card}>
        <BrandMark
          direction="row"
          flowerSize={s(36)}
          logoSize={fs(22)}
          color={colors.blue}
          logoColor={colors.navy}
          style={aboutStyles.hero}
        />
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
    marginBottom: s(6),
  },
});
