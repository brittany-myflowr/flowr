import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PhaseChip } from '@/components/cycle/PhaseChip';
import { CheckIcon } from '@/components/icons/ActionIcons';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { PhaseKey } from '@/constants/phases';
import type { Step } from '@/types';

type TodayStepRowProps = {
  step: Step;
  routineName: string;
  phaseKeys?: PhaseKey[];
  reorderMode?: boolean;
  index?: number;
  total?: number;
  onToggle?: () => void;
  onLongPress?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

export function TodayStepRow({
  step,
  routineName,
  phaseKeys,
  reorderMode = false,
  index = 0,
  total = 1,
  onToggle,
  onLongPress,
  onMoveUp,
  onMoveDown,
}: TodayStepRowProps) {
  const content = (
    <>
      {reorderMode ? (
        <View style={styles.reorderActions}>
          <Pressable
            onPress={onMoveUp}
            disabled={index === 0}
            style={[styles.reorderButton, index === 0 && styles.reorderButtonDisabled]}
          >
            <Text style={styles.reorderLabel}>↑</Text>
          </Pressable>
          <Pressable
            onPress={onMoveDown}
            disabled={index === total - 1}
            style={[
              styles.reorderButton,
              index === total - 1 && styles.reorderButtonDisabled,
            ]}
          >
            <Text style={styles.reorderLabel}>↓</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.checkbox, step.done && styles.checkboxDone]}>
          {step.done ? <CheckIcon size={12} color={colors.white} /> : null}
        </View>
      )}

      <View style={styles.copy}>
        <Text style={[styles.stepName, step.done && styles.stepNameDone]}>{step.name}</Text>
        <View style={styles.meta}>
          <Text style={styles.routineName}>{routineName}</Text>
          {phaseKeys?.map((phaseKey) => (
            <PhaseChip key={phaseKey} phaseKey={phaseKey} />
          ))}
        </View>
        {step.productName ? (
          <Text style={styles.productName}>{step.productName}</Text>
        ) : null}
      </View>
    </>
  );

  if (reorderMode) {
    return <View style={[styles.card, step.done && styles.cardDone]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onToggle}
      onLongPress={onLongPress}
      delayLongPress={250}
      style={[styles.card, step.done && styles.cardDone]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 7,
  },
  cardDone: {
    opacity: 0.72,
  },
  reorderActions: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 1,
  },
  reorderButton: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  reorderButtonDisabled: {
    opacity: 0.35,
  },
  reorderLabel: {
    fontFamily: fonts.dmSans,
    fontSize: 12,
    color: colors.navy,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#c8d9e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxDone: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  copy: {
    flex: 1,
  },
  stepName: {
    fontFamily: fonts.lora,
    fontSize: 14,
    color: colors.navy,
  },
  stepNameDone: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  routineName: {
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.blue,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  productName: {
    marginTop: 2,
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.muted,
  },
});
