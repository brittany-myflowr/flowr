import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CloseIcon } from '@/components/icons/ActionIcons';
import {
  StepProductLabel,
  TagProductButton,
} from '@/components/steps/StepProductChip';
import { StepNumberBadge } from '@/components/steps/StepNumberBadge';
import { colors } from '@/constants/colors';
import { plannerCard, plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
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
    <View style={[styles.card, plannerCard()]}>
      <View style={styles.headerRow}>
        <StepNumberBadge number={index + 1} size="md" />
        <Text style={styles.headerLabel}>Step {index + 1}</Text>
        <View style={styles.headerActions}>
          {total > 1 && onRemove ? (
            <Pressable onPress={onRemove} hitSlop={8}>
              <CloseIcon color={plannerCardBorder} />
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

      {productName ? (
        <View style={styles.productRow}>
          <StepProductLabel label={productName} style={styles.productLabelInline} />
          <Pressable onPress={onTagProduct} hitSlop={8}>
            <Text style={styles.editProductText}>Edit product</Text>
          </Pressable>
        </View>
      ) : null}

      <Text style={styles.fieldLabel}>Schedule</Text>
      <Pressable onPress={onCustomizeSchedule} style={styles.scheduleRow}>
        <Text style={styles.scheduleValue}>{scheduleLabel}</Text>
        <Text style={styles.scheduleAction}>Customize</Text>
      </Pressable>

      {!productName ? (
        <View style={styles.productActions}>
          <TagProductButton onPress={onTagProduct} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    marginBottom: s(10),
  },
  noteInput: {
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.helper,
    color: colors.navy,
    paddingVertical: vs(8),
    paddingHorizontal: s(10),
    backgroundColor: colors.bg,
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    marginBottom: s(6),
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: s(8),
    marginBottom: s(10),
    paddingHorizontal: s(2),
  },
  productLabelInline: {
    flex: 1,
    marginTop: 0,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(10),
    paddingHorizontal: s(10),
    backgroundColor: colors.light,
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: plannerCardBorder,
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
  productActions: {
    marginTop: s(2),
  },
  editProductText: {
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.link,
    color: colors.blue,
  },
});
