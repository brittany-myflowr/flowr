import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CheckIcon, CloseIcon, DragHandleIcon } from '@/components/icons/ActionIcons';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { Step } from '@/types';
import { s, vs, fs } from '@/lib/scale';

type RoutineStepRowProps = {
  step: Step;
  index: number;
  isEditing?: boolean;
  isDragging?: boolean;
  onPress?: () => void;
  onDrag?: () => void;
  onChangeName?: (name: string) => void;
  onBlurName?: () => void;
  onDelete?: () => void;
  onTagProduct?: () => void;
  onCustomSchedule?: () => void;
};

export function RoutineStepRow({
  step,
  index,
  isEditing = false,
  isDragging = false,
  onPress,
  onDrag,
  onChangeName,
  onBlurName,
  onDelete,
  onTagProduct,
  onCustomSchedule,
}: RoutineStepRowProps) {
  return (
    <View style={[styles.card, isDragging && styles.cardDragging]}>
      <View style={styles.mainRow}>
        <Pressable onLongPress={onDrag} disabled={!onDrag} delayLongPress={150} hitSlop={8}>
          <DragHandleIcon />
        </Pressable>

        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{index + 1}</Text>
        </View>

        <Pressable style={styles.copy} onPress={onPress}>
          {isEditing ? (
            <TextInput
              value={step.name}
              onChangeText={onChangeName}
              onBlur={onBlurName}
              autoFocus
              style={styles.stepInput}
              placeholder="Step name"
              placeholderTextColor={colors.muted}
            />
          ) : (
            <>
              <Text style={styles.stepName}>{step.name}</Text>
              <Text style={styles.editHint}>tap to edit</Text>
            </>
          )}
        </Pressable>

        <View style={styles.actions}>
          <Pressable onPress={onDelete} hitSlop={8}>
            <CloseIcon color="#c8d9e6" />
          </Pressable>
        </View>
      </View>

      <View style={styles.chips}>
        <Pressable onPress={onCustomSchedule} style={styles.scheduleChip}>
          <Text style={styles.chipText}>
            {step.schedule ? 'Custom schedule · Edit' : '+ Custom schedule'}
          </Text>
        </Pressable>
        {step.productName ? (
          <View style={styles.productChip}>
            <CheckIcon size={s(10)} color={colors.blue} />
            <Text style={styles.chipText}>{step.productName}</Text>
          </View>
        ) : (
          <Pressable onPress={onTagProduct} style={styles.tagProductChip}>
            <Text style={styles.tagProductText}>+ Tag a product</Text>
          </Pressable>
        )}
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
  stepInput: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(13),
    color: colors.navy,
    padding: s(0),
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(5),
    paddingHorizontal: s(12),
    paddingBottom: s(8),
  },
  scheduleChip: {
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: '#c8d9e6',
    borderRadius: s(7),
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
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
  tagProductChip: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#c8d9e6',
    borderRadius: s(7),
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
  },
  chipText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    color: colors.blue,
  },
  tagProductText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.blue,
  },
});
