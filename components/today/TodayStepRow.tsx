import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PhaseChip } from '@/components/cycle/PhaseChip';
import { CheckIcon } from '@/components/icons/ActionIcons';
import { colors } from '@/constants/colors';
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
  const hasChips = Boolean(phaseKeys?.length || step.productName);

  return (
    <View style={embedded ? undefined : styles.card}>
      <View style={[styles.mainRow, embedded && styles.mainRowEmbedded]}>
        <View style={styles.leading}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>

          <View style={styles.copy}>
            <Text style={[styles.stepName, step.done && styles.stepNameDone]}>{step.name}</Text>
            {step.note ? (
              <Text style={[styles.noteText, step.done && styles.noteTextDone]}>{step.note}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onToggle}
            hitSlop={s(8)}
            style={[styles.checkbox, step.done && styles.checkboxDone]}
          >
            {step.done ? <CheckIcon size={s(10)} color={colors.white} /> : null}
          </Pressable>
        </View>
      </View>

      {hasChips ? (
        <View style={[styles.chips, embedded && styles.chipsEmbedded]}>
          {phaseKeys?.map((phaseKey) => (
            <PhaseChip key={phaseKey} phaseKey={phaseKey} />
          ))}
          {step.productName ? (
            <View style={styles.productChip}>
              <CheckIcon size={s(10)} color={colors.blue} />
              <Text style={styles.chipText}>{step.productName}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: colors.border,
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
  stepNumber: {
    width: s(20),
    height: vs(20),
    borderRadius: s(10),
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(9),
    color: colors.blue,
    fontWeight: '600',
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
    borderRadius: s(10),
    borderWidth: 1.5,
    borderColor: '#c8d9e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
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
  productChip: {
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: '#c8d9e6',
    borderRadius: s(7),
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(3),
  },
  chipText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    color: colors.blue,
  },
});
