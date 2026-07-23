import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { StepNumberBadge } from '@/components/steps/StepNumberBadge';
import { StepProductLabel } from '@/components/steps/StepProductChip';
import { Toggle } from '@/components/ui/Toggle';
import { categoryColors, type Category } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { plannerCard } from '@/constants/plannerCardStyles';
import {
  guidedFlowSizes,
  guidedFlowTypography,
} from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import type { Routine } from '@/types';
import { s, vs, fs } from '@/lib/scale';

type RoutineCardProps = {
  routine: Routine;
  onPress?: () => void;
  onLongPress?: () => void;
  onToggleActive?: () => void;
};

export function RoutineCard({ routine, onPress, onLongPress, onToggleActive }: RoutineCardProps) {
  const categoryColor = categoryColors[routine.category];

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      accessibilityRole="button"
      accessibilityLabel={`${routine.name}, ${routine.steps.length} steps, ${routine.active ? 'active' : 'inactive'}`}
      style={[
        styles.card,
        plannerCard(categoryColor),
        !routine.active && styles.cardInactive,
      ]}
    >
      <View style={styles.headerRow}>
        <Daisy color={categoryColor} size={s(16)} />
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {routine.name}
          </Text>
          <Text style={styles.subtitle}>
            {routine.steps.length} steps · {routine.category}
          </Text>
        </View>
        <Toggle
          value={routine.active}
          onValueChange={onToggleActive}
          accessibilityLabel={`${routine.active ? 'Deactivate' : 'Activate'} ${routine.name}`}
        />
      </View>
    </Pressable>
  );
}

export type RoutineReviewStep = {
  name: string;
  note?: string;
  productName?: string;
  scheduleLabel?: string;
};

type RoutineReviewCardProps = {
  name: string;
  description?: string;
  category: Category;
  scheduleLabel: string;
  steps: RoutineReviewStep[];
};

export function RoutineReviewCard({
  name,
  description,
  category,
  scheduleLabel,
  steps,
}: RoutineReviewCardProps) {
  const categoryColor = categoryColors[category];

  return (
    <View style={[styles.reviewCard, plannerCard(categoryColor)]}>
      <View style={styles.headerRow}>
        <Daisy color={categoryColor} size={guidedFlowSizes.reviewIcon} />
        <View style={styles.meta}>
          <Text style={styles.reviewName}>{name}</Text>
          {description ? <Text style={styles.reviewDescription}>{description}</Text> : null}
          <Text style={styles.reviewSubtitle}>{scheduleLabel}</Text>
        </View>
      </View>

      {steps.map((step, index) => (
        <View key={`${step.name}-${index}`} style={styles.reviewStep}>
          <StepNumberBadge number={index + 1} />
          <View style={styles.reviewStepCopy}>
            <Text style={styles.reviewStepName}>{step.name}</Text>
            {step.note ? <Text style={styles.reviewStepMeta}>{step.note}</Text> : null}
            {step.productName ? <StepProductLabel label={step.productName} /> : null}
            {step.scheduleLabel ? (
              <Text style={styles.reviewStepMeta}>{step.scheduleLabel}</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: s(10),
    marginBottom: s(6),
  },
  cardInactive: {
    opacity: 0.55,
  },
  reviewCard: {
    padding: s(14),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(12),
    color: colors.navy,
  },
  subtitle: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.muted,
    textTransform: 'capitalize',
  },
  reviewStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingVertical: vs(7),
    borderTopWidth: 1,
    borderTopColor: colors.inputBg,
  },
  reviewName: {
    fontFamily: fonts.cardTitle,
    fontSize: guidedFlowTypography.reviewName,
    color: colors.navy,
  },
  reviewDescription: {
    marginTop: s(3),
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.reviewMeta,
    color: colors.gray,
    lineHeight: guidedFlowTypography.helperLineHeight,
  },
  reviewSubtitle: {
    marginTop: s(2),
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.reviewMeta,
    color: colors.muted,
  },
  reviewStepCopy: {
    flex: 1,
    gap: s(4),
  },
  reviewStepName: {
    fontFamily: fonts.cardTitle,
    fontSize: guidedFlowTypography.reviewStepName,
    color: colors.navy,
  },
  reviewStepMeta: {
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.reviewMeta,
    color: colors.muted,
  },
});
