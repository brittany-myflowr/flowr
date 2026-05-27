import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PhaseChip } from '@/components/cycle/PhaseChip';
import { CheckIcon, DragHandleIcon } from '@/components/icons/ActionIcons';
import { categoryColors } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { PhaseKey } from '@/constants/phases';
import type { Step } from '@/types';
import { s, vs, fs } from '@/lib/scale';

type TodayStepRowProps = {
  step: Step;
  routineName?: string;
  showRoutineName?: boolean;
  phaseKeys?: PhaseKey[];
  reorderMode?: boolean;
  isDragging?: boolean;
  onToggle?: () => void;
  onLongPress?: () => void;
  onDrag?: () => void;
};

export function TodayStepRow({
  step,
  routineName = '',
  showRoutineName = true,
  phaseKeys,
  reorderMode = false,
  isDragging = false,
  onToggle,
  onLongPress,
  onDrag,
}: TodayStepRowProps) {
  const categoryColor = categoryColors[step.category];

  const content = (
    <>
      {reorderMode ? (
        <Pressable onPressIn={onDrag} disabled={!onDrag} hitSlop={s(8)} style={styles.dragHandle}>
          <DragHandleIcon />
        </Pressable>
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
        {showRoutineName || phaseKeys?.length || step.productName ? (
          <View style={styles.meta}>
            {showRoutineName ? <Text style={styles.routineName}>{routineName}</Text> : null}
            {phaseKeys?.map((phaseKey) => (
              <PhaseChip key={phaseKey} phaseKey={phaseKey} />
            ))}
          </View>
        ) : null}
        {step.productName ? (
          <Text style={styles.productName}>{step.productName}</Text>
        ) : null}
      </View>
    </>
  );

  const cardStyle = [styles.card, isDragging && styles.cardDragging];

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
  cardDragging: {
    opacity: 0.92,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.12,
    shadowRadius: s(6),
    elevation: 4,
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
  dragHandle: {
    marginTop: s(1),
    paddingVertical: vs(2),
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
    fontFamily: fonts.dmSans,
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
