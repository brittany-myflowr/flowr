import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CheckIcon, CloseIcon } from '@/components/icons/ActionIcons';
import { colors } from '@/constants/colors';
import { guidedFlowSizes, guidedFlowTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { s, vs } from '@/lib/scale';

export type GuidedStepDraft = {
  name: string;
  note: string;
  schedule: import('@/types').Schedule | null;
  productId: string | null;
};

export function createEmptyGuidedStepDraft(): GuidedStepDraft {
  return {
    name: '',
    note: '',
    schedule: null,
    productId: null,
  };
}

type GuidedStepCardProps = {
  index: number;
  total: number;
  draft: GuidedStepDraft;
  scheduleLabel: string;
  productName?: string;
  onChangeName: (name: string) => void;
  onChangeNote: (note: string) => void;
  onCustomizeSchedule: () => void;
  onTagProduct: () => void;
  onRemove?: () => void;
};

export function GuidedStepCard({
  index,
  total,
  draft,
  scheduleLabel,
  productName,
  onChangeName,
  onChangeNote,
  onCustomizeSchedule,
  onTagProduct,
  onRemove,
}: GuidedStepCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{index + 1}</Text>
        </View>
        <Text style={styles.headerLabel}>Step {index + 1}</Text>
        <View style={styles.headerActions}>
          {total > 1 && onRemove ? (
            <Pressable onPress={onRemove} hitSlop={8}>
              <CloseIcon color="#c8d9e6" />
            </Pressable>
          ) : null}
        </View>
      </View>

      <Text style={styles.fieldLabel}>Step name</Text>
      <TextInput
        value={draft.name}
        onChangeText={onChangeName}
        placeholder="e.g. Vitamin C Serum"
        placeholderTextColor={colors.muted}
        style={styles.nameInput}
        autoCapitalize="words"
      />

      <Text style={styles.fieldLabel}>Note (optional)</Text>
      <TextInput
        value={draft.note}
        onChangeText={onChangeNote}
        placeholder="e.g. 3 drops"
        placeholderTextColor={colors.muted}
        style={styles.noteInput}
        autoCapitalize="sentences"
      />

      <Text style={styles.fieldLabel}>Schedule</Text>
      <Pressable onPress={onCustomizeSchedule} style={styles.scheduleRow}>
        <Text style={styles.scheduleValue}>{scheduleLabel}</Text>
        <Text style={styles.scheduleAction}>Customize</Text>
      </Pressable>

      <View style={styles.chips}>
        {productName ? (
          <View style={styles.productChip}>
            <CheckIcon size={s(10)} color={colors.blue} />
            <Text style={styles.chipText}>{productName}</Text>
          </View>
        ) : (
          <Pressable onPress={onTagProduct} style={styles.tagProductChip}>
            <Text style={styles.tagProductText}>+ Tag a product</Text>
          </Pressable>
        )}
        {productName ? (
          <Pressable onPress={onTagProduct} style={styles.editProductChip}>
            <Text style={styles.chipText}>Edit product</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: guidedFlowSizes.stepRowRadius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: guidedFlowSizes.stepRowPaddingH,
    paddingVertical: guidedFlowSizes.stepRowPaddingV,
    marginBottom: s(10),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginBottom: s(10),
  },
  stepNumber: {
    width: guidedFlowSizes.stepBadge,
    height: guidedFlowSizes.stepBadge,
    borderRadius: guidedFlowSizes.stepBadge / 2,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: guidedFlowTypography.stepNumber,
    color: colors.blue,
    fontWeight: '600',
  },
  headerLabel: {
    flex: 1,
    fontFamily: fonts.cardTitle,
    fontSize: guidedFlowTypography.body,
    color: colors.navy,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
  },
  fieldLabel: {
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.fieldLabel,
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(6),
  },
  nameInput: {
    fontFamily: fonts.cardTitle,
    fontSize: guidedFlowTypography.body,
    color: colors.navy,
    paddingVertical: vs(8),
    paddingHorizontal: s(10),
    backgroundColor: colors.bg,
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: s(10),
  },
  noteInput: {
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.helper,
    color: colors.navy,
    paddingVertical: vs(8),
    paddingHorizontal: s(10),
    backgroundColor: colors.bg,
    borderRadius: s(8),
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: s(10),
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(10),
    paddingHorizontal: s(10),
    backgroundColor: colors.light,
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: '#c8d9e6',
    gap: s(8),
    marginBottom: s(10),
  },
  scheduleValue: {
    flex: 1,
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.helper,
    color: colors.navy,
  },
  scheduleAction: {
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.link,
    color: colors.blue,
    textDecorationLine: 'underline',
    flexShrink: 0,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(5),
  },
  productChip: {
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: '#c8d9e6',
    borderRadius: s(7),
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(3),
  },
  editProductChip: {
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: '#c8d9e6',
    borderRadius: s(7),
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
  },
  tagProductChip: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#c8d9e6',
    borderRadius: s(7),
    paddingHorizontal: s(10),
    paddingVertical: vs(6),
  },
  chipText: {
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.fieldLabel,
    color: colors.blue,
  },
  tagProductText: {
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.link,
    color: colors.blue,
  },
});
