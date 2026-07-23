import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { categoryColors } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { plannerCardBorder, plannerCornerRadius } from '@/constants/plannerCardStyles';
import { tabPageTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import {
  formatFrequency,
  formatTimeOfDay,
} from '@/providers/RoutinesProvider';
import type { Routine } from '@/types';
import { s, fs } from '@/lib/scale';

const FLOWER_SIZE = s(18);
const TITLE_GAP = s(8);

type RoutineDetailHeaderProps = {
  routine: Routine;
  onBack?: () => void;
  onEdit?: () => void;
};

export function RoutineDetailHeader({
  routine,
  onBack,
  onEdit,
}: RoutineDetailHeaderProps) {
  const categoryColor = categoryColors[routine.category];

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        {onEdit ? (
          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit routine"
            style={styles.editButton}
          >
            <Text style={styles.editLabel}>Edit</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.titleLine}>
        <View style={styles.flower}>
          <Daisy color={categoryColor} size={FLOWER_SIZE} />
        </View>
        <Text style={styles.name}>{routine.name}</Text>
      </View>

      <View style={styles.details}>
        {routine.description ? (
          <Text style={styles.description}>{routine.description}</Text>
        ) : null}
        <Text style={styles.subtitle}>
          {routine.category} · {routine.steps.length} steps ·{' '}
          {formatFrequency(routine.schedule.frequency)} ·{' '}
          {formatTimeOfDay(routine.timeOfDay)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: s(18),
    paddingHorizontal: s(14),
    paddingBottom: s(10),
    borderBottomWidth: 1,
    borderBottomColor: plannerCardBorder,
    backgroundColor: colors.bg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s(8),
  },
  back: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.blue,
  },
  editButton: {
    paddingHorizontal: s(10),
    paddingVertical: s(6),
    borderRadius: plannerCornerRadius,
    backgroundColor: colors.navy,
  },
  editLabel: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: tabPageTypography.actionLabel,
    color: colors.white,
    fontWeight: '600',
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TITLE_GAP,
  },
  flower: {
    width: FLOWER_SIZE,
    height: FLOWER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontFamily: fonts.lora,
    fontSize: fs(18),
    lineHeight: fs(22),
    color: colors.navy,
  },
  details: {
    marginTop: s(8),
    alignItems: 'flex-start',
    gap: s(4),
  },
  description: {
    fontFamily: fonts.dmSans,
    fontSize: fs(13),
    lineHeight: fs(18),
    color: colors.gray,
    textAlign: 'left',
  },
  subtitle: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.muted,
    textAlign: 'left',
  },
});
