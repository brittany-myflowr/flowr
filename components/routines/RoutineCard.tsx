import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { categoryColors, type Category } from '@/constants/categories';
import { colors } from '@/constants/colors';
import {
  guidedFlowSizes,
  guidedFlowTypography,
} from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import {
  formatFrequency,
  formatTimeOfDay,
} from '@/providers/RoutinesProvider';
import type { Routine, ScheduleFrequency } from '@/types';
import { s, vs, fs } from '@/lib/scale';

type RoutineCardProps = {
  routine: Routine;
  onPress?: () => void;
  onToggleActive?: () => void;
};

export function RoutineCard({ routine, onPress, onToggleActive }: RoutineCardProps) {
  const categoryColor = categoryColors[routine.category];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, !routine.active && styles.cardInactive]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${categoryColor}28` }]}>
          <Daisy color={categoryColor} size={s(16)} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.name}>{routine.name}</Text>
          <Text style={styles.subtitle}>
            {routine.steps.length} steps · {routine.category}
          </Text>
        </View>
        <Toggle value={routine.active} onValueChange={onToggleActive} />
      </View>

      <View style={styles.scheduleChip}>
        <Text style={styles.scheduleText}>
          {formatFrequency(routine.schedule.frequency)} · Edit
        </Text>
      </View>

      <View style={styles.badges}>
        {routine.steps.slice(0, 3).map((step) => (
          <Badge key={step.id} label={step.name} color={colors.gray} backgroundColor={colors.inputBg} />
        ))}
      </View>
    </Pressable>
  );
}

export type RoutineReviewStep = {
  name: string;
  note?: string;
  productName?: string;
  scheduleLabel?: string;
  reminderEnabled?: boolean;
};

type RoutineReviewCardProps = {
  name: string;
  category: Category;
  frequency: ScheduleFrequency;
  timeOfDay: Routine['timeOfDay'];
  steps: RoutineReviewStep[];
};

export function RoutineReviewCard({
  name,
  category,
  frequency,
  timeOfDay,
  steps,
}: RoutineReviewCardProps) {
  const categoryColor = categoryColors[category];

  return (
    <View style={styles.reviewCard}>
      <View style={styles.headerRow}>
        <View style={[styles.reviewIconWrap, { backgroundColor: `${categoryColor}28` }]}>
          <Daisy color={categoryColor} size={guidedFlowSizes.reviewIcon} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.reviewName}>{name}</Text>
          <Text style={styles.reviewSubtitle}>
            {formatFrequency(frequency)} · {formatTimeOfDay(timeOfDay)}
          </Text>
        </View>
      </View>

      {steps.map((step, index) => (
        <View key={`${step.name}-${index}`} style={styles.reviewStep}>
          <View style={styles.reviewStepNumber}>
            <Text style={styles.reviewStepNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.reviewStepCopy}>
            <Text style={styles.reviewStepName}>{step.name}</Text>
            {step.note ? <Text style={styles.reviewStepMeta}>{step.note}</Text> : null}
            {step.productName ? (
              <Text style={styles.reviewStepMeta}>Product: {step.productName}</Text>
            ) : null}
            {step.scheduleLabel ? (
              <Text style={styles.reviewStepMeta}>{step.scheduleLabel}</Text>
            ) : null}
            {step.reminderEnabled ? (
              <Text style={styles.reviewStepMeta}>Reminder on</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: s(10),
    padding: s(10),
    marginBottom: s(6),
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardInactive: {
    opacity: 0.55,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: s(14),
    padding: s(14),
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  iconWrap: {
    width: s(30),
    height: vs(30),
    borderRadius: s(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewIconWrap: {
    width: guidedFlowSizes.reviewIconWrap,
    height: guidedFlowSizes.reviewIconWrap,
    borderRadius: s(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
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
  },
  scheduleChip: {
    alignSelf: 'flex-start',
    marginTop: s(6),
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: '#c8d9e6',
    borderRadius: s(6),
    paddingHorizontal: s(7),
    paddingVertical: vs(3),
  },
  scheduleText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    color: colors.blue,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(4),
    marginTop: s(5),
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
  reviewSubtitle: {
    marginTop: s(2),
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.reviewMeta,
    color: colors.muted,
  },
  reviewStepNumber: {
    width: guidedFlowSizes.reviewStepBadge,
    height: guidedFlowSizes.reviewStepBadge,
    borderRadius: guidedFlowSizes.reviewStepBadge / 2,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewStepNumberText: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: guidedFlowTypography.stepNumber,
    color: colors.blue,
    fontWeight: '600',
  },
  reviewStepCopy: {
    flex: 1,
    gap: s(2),
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
