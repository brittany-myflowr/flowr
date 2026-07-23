import { StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { StepProductLabel } from '@/components/steps/StepProductChip';
import { FullWidthButton } from '@/components/ui/Button';
import { categoryColors } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { todayGlassCard } from '@/constants/todayCardStyles';
import { fonts } from '@/constants/typography';
import type { UpNextStep } from '@/hooks/useUpNextStep';
import { fs, s, vs } from '@/lib/scale';

type UpNextCardProps = {
  upNext: UpNextStep;
  onComplete: () => void;
};

export function UpNextCard({ upNext, onComplete }: UpNextCardProps) {
  const categoryColor = categoryColors[upNext.routine.category];

  return (
    <View style={[styles.card, todayGlassCard(categoryColor, 'hero')]}>
      <Text style={styles.eyebrow}>Up next · {upNext.periodLabel}</Text>

      <View style={styles.titleRow}>
        <Daisy color={categoryColor} size={s(18)} />
        <Text style={styles.stepName}>{upNext.step.name}</Text>
      </View>

      <Text style={styles.support}>
        {upNext.routineName} · Step {upNext.stepNumber} of {upNext.totalSteps}
      </Text>

      {upNext.step.note ? <Text style={styles.note}>{upNext.step.note}</Text> : null}
      {upNext.step.productName ? (
        <StepProductLabel label={upNext.step.productName} style={styles.productLabel} />
      ) : null}

      <View style={styles.actionWrap}>
        <FullWidthButton label="Mark done" onPress={onComplete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: s(16),
    paddingTop: s(16),
    paddingBottom: s(14),
    marginBottom: s(10),
  },
  eyebrow: {
    fontFamily: fonts.dmSansMedium,
    fontSize: fs(10),
    fontWeight: '500',
    letterSpacing: s(1.5),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(10),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginBottom: s(6),
  },
  stepName: {
    flex: 1,
    fontFamily: fonts.lora,
    fontSize: fs(18),
    lineHeight: fs(22),
    color: colors.navy,
  },
  support: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.muted,
    marginBottom: s(4),
  },
  note: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.gray,
    marginBottom: s(2),
  },
  productLabel: {
    marginTop: s(2),
    marginBottom: 0,
    fontSize: fs(12),
  },
  actionWrap: {
    marginTop: s(14),
  },
});

/** Keeps Today section bar aligned when Up Next is hidden. */
export const upNextReservedSpaceStyle = StyleSheet.create({
  placeholder: {
    minHeight: vs(150),
    marginBottom: s(10),
  },
});
