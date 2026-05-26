import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PhaseChip } from '@/components/cycle/PhaseChip';
import { CheckIcon } from '@/components/icons/ActionIcons';
import { categoryColors } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { PhaseKey } from '@/constants/phases';
import type { Step } from '@/types';
import { s, vs, fs } from '@/lib/scale';

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
  const categoryColor = categoryColors[step.category];

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
        <Pressable
          onPress={onToggle}
          hitSlop={s(8)}
          style={[styles.checkbox, step.done && styles.checkboxDone]}
        >
          {step.done ? <CheckIcon size={s(12)} color={colors.white} /> : null}
        </Pressable>
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

  const cardStyle = styles.card;

  if (reorderMode) {
    return (
      <View style={cardStyle}>
        <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />
        <View style={styles.cardBody}>{content}</View>
      </View>
    );
  }

  return (
    <Pressable onLongPress={onLongPress} delayLongPress={250} style={cardStyle}>
      <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />
      <View style={styles.cardBody}>{content}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.white,
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: s(7),
    overflow: 'hidden',
  },
  categoryBar: {
    width: s(4),
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(10),
    paddingHorizontal: s(12),
    paddingVertical: vs(11),
  },
  reorderActions: {
    flexDirection: 'row',
    gap: s(2),
    marginTop: s(1),
  },
  reorderButton: {
    width: s(22),
    height: vs(22),
    borderRadius: s(6),
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
    fontSize: fs(12),
    color: colors.navy,
  },
  checkbox: {
    width: s(22),
    height: vs(22),
    borderRadius: s(11),
    borderWidth: 1.5,
    borderColor: '#c8d9e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: s(1),
  },
  checkboxDone: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  copy: {
    flex: 1,
  },
  stepName: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(14),
    color: colors.navy,
  },
  stepNameDone: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  routineName: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.blue,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: s(3),
    marginTop: s(2),
  },
  productName: {
    marginTop: s(2),
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.muted,
  },
});
