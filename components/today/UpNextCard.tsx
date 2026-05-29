import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PhaseChip } from '@/components/cycle/PhaseChip';
import { getTimeOfDayIcon } from '@/components/icons/TimeOfDayIcons';
import { categoryColors } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { todayGlassCard, todayCornerRadius } from '@/constants/todayCardStyles';
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
      <View style={styles.headerRow}>
        {getTimeOfDayIcon(upNext.timeOfDay, colors.blue)}
        <Text style={styles.eyebrow}>Up next · {upNext.periodLabel}</Text>
      </View>

      <Text style={styles.routineName}>{upNext.routineName}</Text>
      <Text style={styles.stepName}>{upNext.step.name}</Text>

      <Text style={styles.meta}>
        Step {upNext.stepNumber} of {upNext.totalSteps}
        {upNext.isCycleSynced ? ' · Cycle-synced' : ''}
      </Text>

      {upNext.phaseKeys?.length ? (
        <View style={styles.chips}>
          {upNext.phaseKeys.map((phaseKey) => (
            <PhaseChip key={phaseKey} phaseKey={phaseKey} />
          ))}
        </View>
      ) : null}

      <Pressable
        onPress={onComplete}
        style={styles.actionButton}
        accessibilityRole="button"
        accessibilityLabel={`Mark ${upNext.step.name} complete`}
      >
        <Text style={styles.actionLabel}>Mark done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: s(14),
    marginBottom: s(10),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    marginBottom: s(8),
  },
  eyebrow: {
    fontFamily: fonts.dmSansMedium,
    fontSize: fs(8),
    fontWeight: '500',
    letterSpacing: s(2.4),
    textTransform: 'uppercase',
    color: colors.navy,
  },
  routineName: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.muted,
    marginBottom: s(2),
  },
  stepName: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(15),
    color: colors.navy,
    marginBottom: s(4),
  },
  meta: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.gray,
    marginBottom: s(8),
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(4),
    marginBottom: s(10),
  },
  actionButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.navy,
    borderRadius: todayCornerRadius,
    paddingHorizontal: s(14),
    paddingVertical: vs(8),
  },
  actionLabel: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(10),
    fontWeight: '600',
    color: colors.white,
  },
});
