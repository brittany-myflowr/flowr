import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/brand';
import {
  ProfileScreenShell,
  profileBodyStyles as styles,
} from '@/components/profile/ProfileScreenShell';
import { APP_DESCRIPTION, APP_VERSION } from '@/constants/appInfo';
import { colors } from '@/constants/colors';
import { s, fs } from '@/lib/scale';

export default function AboutScreen() {
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
    </ProfileScreenShell>
  );
}

const aboutStyles = StyleSheet.create({
  hero: {
    marginBottom: s(6),
  },
});
