import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PhaseFlower } from '@/components/brand';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { CyclePhaseInfo } from '@/lib/cycle';
import { s, vs, fs } from '@/lib/scale';

type CyclePhaseBannerProps = {
  phaseInfo: CyclePhaseInfo;
  onDetails?: () => void;
};

export function CyclePhaseBanner({ phaseInfo, onDetails }: CyclePhaseBannerProps) {
  return (
    <View style={[styles.banner, { backgroundColor: `${phaseInfo.color}22`, borderColor: `${phaseInfo.color}44` }]}>
      <PhaseFlower color={phaseInfo.color} size={s(18)} />
      <View style={styles.copy}>
        <Text style={styles.title}>
          {phaseInfo.label} Phase · Day {phaseInfo.dayInCycle}
        </Text>
        <Text style={styles.subtitle}>
          {phaseInfo.daysRemaining === 0
            ? 'Last day of cycle'
            : `${phaseInfo.daysRemaining} day${phaseInfo.daysRemaining === 1 ? '' : 's'} remaining`}
          {' · '}
          {phaseInfo.description}
        </Text>
      </View>
      {onDetails ? (
        <Pressable onPress={onDetails}>
          <Text style={styles.details}>Details</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
    borderBottomWidth: 1,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(10),
    fontWeight: '600',
    color: colors.navy,
  },
  subtitle: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.gray,
  },
  details: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.blue,
    textDecorationLine: 'underline',
  },
});
