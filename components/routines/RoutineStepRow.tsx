import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BellIcon, CheckIcon, CloseIcon, DragHandleIcon } from '@/components/icons/ActionIcons';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { Step } from '@/types';

type RoutineStepRowProps = {
  step: Step;
  index: number;
  total: number;
  isEditing?: boolean;
  reorderMode?: boolean;
  onPress?: () => void;
  onLongPressDrag?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onChangeName?: (name: string) => void;
  onBlurName?: () => void;
  onDelete?: () => void;
  onTagProduct?: () => void;
  onCustomSchedule?: () => void;
  onReminder?: () => void;
  reminderEnabled?: boolean;
};

export function RoutineStepRow({
  step,
  index,
  total,
  isEditing = false,
  reorderMode = false,
  onPress,
  onLongPressDrag,
  onMoveUp,
  onMoveDown,
  onChangeName,
  onBlurName,
  onDelete,
  onTagProduct,
  onCustomSchedule,
  onReminder,
  reminderEnabled = false,
}: RoutineStepRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        <Pressable onLongPress={onLongPressDrag} delayLongPress={200} hitSlop={8}>
          <DragHandleIcon />
        </Pressable>

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
        ) : null}

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

        <View style={[styles.actions, reminderEnabled && styles.actionsActive]}>
          <Pressable onPress={onReminder} hitSlop={8} disabled={!onReminder}>
            <BellIcon color={reminderEnabled ? colors.blue : '#c8d9e6'} />
          </Pressable>
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
            <CheckIcon size={10} color={colors.blue} />
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 7,
    overflow: 'hidden',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reorderActions: {
    flexDirection: 'row',
    gap: 2,
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
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: 9,
    color: colors.blue,
    fontWeight: '600',
  },
  copy: {
    flex: 1,
  },
  stepName: {
    fontFamily: fonts.lora,
    fontSize: 13,
    color: colors.navy,
  },
  stepInput: {
    fontFamily: fonts.lora,
    fontSize: 13,
    color: colors.navy,
    padding: 0,
  },
  editHint: {
    marginTop: 1,
    fontFamily: fonts.dmSans,
    fontSize: 8,
    color: '#c8d9e6',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    opacity: 0.5,
  },
  actionsActive: {
    opacity: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  scheduleChip: {
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: '#c8d9e6',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  productChip: {
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: '#c8d9e6',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tagProductChip: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#c8d9e6',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    color: colors.blue,
  },
  tagProductText: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    color: colors.muted,
  },
});
