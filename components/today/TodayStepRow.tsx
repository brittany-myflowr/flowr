import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PhaseChip } from '@/components/cycle/PhaseChip';
import { CheckIcon } from '@/components/icons/ActionIcons';
import { StepNumberBadge } from '@/components/steps/StepNumberBadge';
import { StepProductLabel } from '@/components/steps/StepProductChip';
import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import type { PhaseKey } from '@/constants/phases';
import type { Step } from '@/types';
import { s, vs, fs } from '@/lib/scale';

type TodayStepRowProps = {
  step: Step;
  index: number;
  embedded?: boolean;
  phaseKeys?: PhaseKey[];
  onToggle?: () => void;
};

export function TodayStepRow({
  step,
  index,
  embedded = false,
  phaseKeys,
  onToggle,
}: TodayStepRowProps) {
  const hasPhaseChips = Boolean(phaseKeys?.length);

  return (
    <View style={embedded ? undefined : styles.card}>
      <View style={[styles.mainRow, embedded && styles.mainRowEmbedded]}>
        <View style={styles.leading}>
          <StepNumberBadge number={index + 1} />

          <View style={styles.copy}>
            <Text style={[styles.stepName, step.done && styles.stepNameDone]}>{step.name}</Text>
            {step.note ? (
              <Text style={[styles.noteText, step.done && styles.noteTextDone]}>{step.note}</Text>
            ) : null}
            {step.productName ? (
              <StepProductLabel label={step.productName} done={step.done} />
            ) : null}
          </View>
        </View>

        <View style={styles.actions}>
          {onToggle ? (
            <Pressable
              onPress={onToggle}
              hitSlop={s(8)}
              style={[styles.checkbox, step.done && styles.checkboxDone]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: step.done }}
              accessibilityLabel={`Mark ${step.name} complete`}
            >
              {step.done ? <CheckIcon size={s(10)} color={colors.white} /> : null}
            </Pressable>
          ) : null}
        </View>
      </View>

      {hasPhaseChips ? (
        <View style={[styles.chips, embedded && styles.chipsEmbedded]}>
          {phaseKeys?.map((phaseKey) => (
            <PhaseChip key={phaseKey} phaseKey={phaseKey} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    marginBottom: s(7),
    overflow: 'hidden',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
  },
  mainRowEmbedded: {
    paddingHorizontal: s(0),
    paddingVertical: vs(4),
  },
  leading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  copy: {
    flex: 1,
  },
  stepName: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(13),
    color: colors.navy,
  },
  stepNameDone: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  noteText: {
    marginTop: s(2),
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.muted,
  },
  noteTextDone: {
    textDecorationLine: 'line-through',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
  },
  checkbox: {
    width: s(20),
    height: vs(20),
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxDone: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(5),
    paddingHorizontal: s(12),
    paddingBottom: s(8),
  },
  chipsEmbedded: {
    paddingHorizontal: s(0),
    paddingBottom: s(0),
    marginTop: s(4),
  },
});
