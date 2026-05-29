import { Pressable, StyleSheet, Text, View, type GestureResponderHandlers } from 'react-native';

import { CloseIcon } from '@/components/icons/ActionIcons';
import { StepNumberBadge } from '@/components/steps/StepNumberBadge';
import { StepProductLabel } from '@/components/steps/StepProductChip';
import type { ReorderableDragTouchHandlers } from '@/components/ui/ReorderableList';
import { colors } from '@/constants/colors';
import { plannerCard, plannerCardBorder } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import type { Step } from '@/types';
import { s, vs, fs } from '@/lib/scale';

type RoutineStepRowProps = {
  step: Step;
  index: number;
  isDragging?: boolean;
  dragHandlers?: GestureResponderHandlers;
  dragTouchHandlers?: ReorderableDragTouchHandlers;
  onDelete?: () => void;
};

export function RoutineStepRow({
  step,
  index,
  isDragging = false,
  dragHandlers,
  dragTouchHandlers,
  onDelete,
}: RoutineStepRowProps) {
  return (
    <View style={[styles.card, plannerCard(), isDragging && styles.cardDragging]}>
      <View style={styles.mainRow}>
        <View style={styles.dragArea} {...dragTouchHandlers} {...dragHandlers}>
          <StepNumberBadge number={index + 1} style={styles.stepBadge} />

          <View style={styles.copy}>
            <Text style={styles.stepName}>{step.name}</Text>
            {step.note ? <Text style={styles.noteText}>{step.note}</Text> : null}
            {step.productName ? <StepProductLabel label={step.productName} /> : null}
            <Text style={styles.editHint}>tap for details · hold to drag</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${step.name}`}
          >
            <CloseIcon color={plannerCardBorder} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
  },
  dragArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(8),
  },
  stepBadge: {
    marginTop: s(1),
  },
  copy: {
    flex: 1,
  },
  stepName: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(13),
    color: colors.navy,
  },
  noteText: {
    marginTop: s(2),
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.muted,
  },
  editHint: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    opacity: 0.5,
  },
});
