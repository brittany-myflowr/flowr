import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { PhaseFlower } from '@/components/brand';
import { ChevronRightIcon } from '@/components/icons/ProfileIcons';
import { fonts } from '@/constants/typography';
import type { CyclePhaseInfo } from '@/lib/cycle';
import { fs, s } from '@/lib/scale';

type CyclePhasePillProps = {
  phaseInfo: CyclePhaseInfo;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function CyclePhasePill({ phaseInfo, onPress, style }: CyclePhasePillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: 'rgba(255,255,255,0.16)',
          borderColor: `${phaseInfo.color}55`,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${phaseInfo.label} phase, day ${phaseInfo.dayInCycle}. Open cycle settings.`}
    >
      <PhaseFlower color={phaseInfo.color} size={s(14)} />
      <Text style={styles.label}>
        {phaseInfo.label} · Day {phaseInfo.dayInCycle}
      </Text>
      {onPress ? (
        <View style={styles.chevronWrap}>
          <ChevronRightIcon size={s(11)} color="rgba(255,255,255,0.75)" />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    borderWidth: 1,
    borderRadius: s(20),
    paddingHorizontal: s(12),
    paddingVertical: s(6),
  },
  label: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(10),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
  },
  chevronWrap: {
    marginLeft: s(1),
  },
});
