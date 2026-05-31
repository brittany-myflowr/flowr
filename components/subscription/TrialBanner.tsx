import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { plannerCard, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import type { TrialInfo } from '@/lib/subscription';
import { s, vs, fs } from '@/lib/scale';

type TrialBannerProps = {
  trialInfo: TrialInfo;
  onPress?: () => void;
};

export function TrialBanner({ trialInfo, onPress }: TrialBannerProps) {
  const { daysRemaining, isProminentReminder } = trialInfo;

  const label =
    daysRemaining === 1
      ? '1 day left in your free trial'
      : `${daysRemaining} days left in your free trial`;

  if (isProminentReminder) {
    return (
      <Pressable onPress={onPress} style={styles.prominent}>
        <Text style={styles.prominentTitle}>Your free trial ends soon</Text>
        <Text style={styles.prominentBody}>
          {label}. Subscribe now to keep building your flowr routines.
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.subtle}>
      <Text style={styles.subtleText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  subtle: {
    ...plannerCard(),
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    marginBottom: s(12),
    backgroundColor: colors.light,
    borderColor: `${colors.blue}33`,
  },
  subtleText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.gray,
    textAlign: 'center',
  },
  prominent: {
    ...plannerCard(),
    paddingHorizontal: s(14),
    paddingVertical: vs(14),
    marginBottom: s(12),
    backgroundColor: colors.light,
    borderColor: colors.blue,
    borderWidth: 1.5,
    borderRadius: plannerCornerRadius,
  },
  prominentTitle: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(12),
    color: colors.navy,
    fontWeight: '600',
    marginBottom: s(4),
  },
  prominentBody: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.gray,
    lineHeight: fs(17),
  },
});
