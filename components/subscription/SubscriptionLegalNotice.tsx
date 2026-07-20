import { StyleSheet, Text, View } from 'react-native';

import { PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/appInfo';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { openExternalUrl } from '@/lib/appLinking';
import { fs, s, vs } from '@/lib/scale';

/**
 * Apple Guideline 3.1.2(a) required disclosures for auto-renewable subscriptions.
 * Must appear in the app binary where users purchase (paywall + manage subscription).
 */
export function SubscriptionLegalNotice() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>flowr Premium</Text>
      <Text style={styles.body}>
        Auto-renewable subscription. Payment will be charged to your Apple ID account at
        confirmation of purchase. Subscription automatically renews unless auto-renew is turned
        off at least 24 hours before the end of the current period. Your account will be charged
        for renewal within 24 hours prior to the end of the current period at the rate of the
        selected plan ($4.99/month or $34.99/year). Subscriptions may be managed by the user and
        auto-renewal may be turned off by going to the user's Account Settings after purchase.
      </Text>
      <Text style={styles.links}>
        <Text style={styles.link} onPress={() => openExternalUrl(PRIVACY_POLICY_URL)}>
          Privacy Policy
        </Text>
        {'  ·  '}
        <Text style={styles.link} onPress={() => openExternalUrl(TERMS_URL)}>
          Terms of Use
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: s(8),
    paddingHorizontal: s(4),
  },
  title: {
    fontFamily: fonts.dmSansMedium,
    fontSize: fs(11),
    color: colors.navy,
    textAlign: 'center',
    marginBottom: vs(6),
  },
  body: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    lineHeight: fs(14),
    color: colors.muted,
    textAlign: 'center',
  },
  links: {
    marginTop: vs(10),
    textAlign: 'center',
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.muted,
  },
  link: {
    fontFamily: fonts.dmSansMedium,
    color: colors.blue,
    textDecorationLine: 'underline',
  },
});
