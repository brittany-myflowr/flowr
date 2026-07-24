import { Pressable, StyleSheet, Text, View, type GestureResponderHandlers } from 'react-native';

import { CloseIcon } from '@/components/icons/ActionIcons';
import { StepNumberBadge } from '@/components/steps/StepNumberBadge';
import { StepProductLabel } from '@/components/steps/StepProductChip';
import type { ReorderableDragTouchHandlers } from '@/components/ui/ReorderableList';
import { colors } from '@/constants/colors';
import { plannerCard, plannerCardBorder } from '@/constants/plannerCardStyles';
import { compactCardSizes } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import type { Step } from '@/types';
import { s, vs } from '@/lib/scale';

type RoutineStepRowProps = {
  step: Step;
  index: number;
  editable?: boolean;
  isDragging?: boolean;
  dragHandlers?: GestureResponderHandlers;
  dragTouchHandlers?: ReorderableDragTouchHandlers;
  onDelete?: () => void;
};

export function RoutineStepRow({
  step,
  index,
  editable = false,
  isDragging = false,
  dragHandlers,
  dragTouchHandlers,
  onDelete,
}: RoutineStepRowProps) {
  const body = (
    <>
      <StepNumberBadge number={index + 1} />
      <View style={styles.copy}>
        <Text style={styles.stepName}>{step.name}</Text>
        {step.note ? <Text style={styles.noteText}>{step.note}</Text> : null}
        {step.productName ? <StepProductLabel label={step.productName} /> : null}
        {editable ? (
          <Text style={styles.editHint}>tap to edit · hold to drag</Text>
        ) : null}
      </View>
    </>
  );

  return (
    <View style={[styles.card, plannerCard(), isDragging && styles.cardDragging]}>
      <View style={styles.mainRow}>
        {editable ? (
          <View style={styles.dragArea} {...dragTouchHandlers} {...dragHandlers}>
            {body}
          </View>
        ) : (
          <View style={styles.dragArea}>{body}</View>
        )}

        {editable && onDelete ? (
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
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: compactCardSizes.gap,
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
    padding: compactCardSizes.padding,
  },
  dragArea: {
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
    fontSize: compactCardSizes.title,
    color: colors.navy,
  },
  noteText: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: compactCardSizes.meta,
    color: colors.muted,
  },
  editHint: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: compactCardSizes.secondary,
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    opacity: 0.5,
  },
});
