import { Pressable, StyleSheet, Text, View, type GestureResponderHandlers } from 'react-native';

import { CloseIcon } from '@/components/icons/ActionIcons';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { Step } from '@/types';
import { s, vs, fs } from '@/lib/scale';

type RoutineStepRowProps = {
  step: Step;
  index: number;
  isDragging?: boolean;
  dragHandlers?: GestureResponderHandlers;
  onDelete?: () => void;
};

export function RoutineStepRow({
  step,
  index,
  isDragging = false,
  dragHandlers,
  onDelete,
}: RoutineStepRowProps) {
  return (
    <View style={[styles.card, isDragging && styles.cardDragging]}>
      <View style={styles.mainRow}>
        <View style={styles.dragArea} {...dragHandlers}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>

          <View style={styles.copy}>
            <Text style={styles.stepName}>{step.name}</Text>
            {step.note ? <Text style={styles.noteText}>{step.note}</Text> : null}
            <Text style={styles.editHint}>tap for details · hold to drag</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onDelete} hitSlop={8}>
            <CloseIcon color="#c8d9e6" />
          </Pressable>
        </View>
      </View>
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
  stepNumber: {
    width: s(20),
    height: vs(20),
    borderRadius: s(10),
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: s(1),
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
    color: '#c8d9e6',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    opacity: 0.5,
  },
});
