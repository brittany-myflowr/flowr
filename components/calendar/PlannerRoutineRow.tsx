import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { ChevronRightIcon } from '@/components/icons/ProfileIcons';
import { TodayStepRow } from '@/components/today/TodayStepRow';
import { categoryColors } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { plannerCard } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import type { PlannerRoutineGroup } from '@/hooks/usePlannerDay';
import { s, vs, fs } from '@/lib/scale';

type PlannerRoutineRowProps = {
  group: PlannerRoutineGroup;
  expanded: boolean;
  onToggleExpanded: () => void;
};

export function PlannerRoutineRow({ group, expanded, onToggleExpanded }: PlannerRoutineRowProps) {
  const categoryColor = categoryColors[group.routine.category];
  const completed = group.isFullyComplete;

  return (
    <View style={[styles.card, plannerCard(categoryColor), completed && styles.cardCompleted]}>
      <Pressable onPress={onToggleExpanded} style={styles.headerPressable}>
        <View style={styles.titleRow}>
          <Daisy color={categoryColor} size={s(16)} />

          <View style={styles.meta}>
            <Text style={[styles.name, completed && styles.nameCompleted]} numberOfLines={1}>
              {group.routine.name}
            </Text>
            <Text style={styles.subtitle}>{group.routine.category}</Text>
          </View>

          <Text style={[styles.progress, completed && styles.progressCompleted]}>
            {group.doneCount}/{group.totalCount}
          </Text>

          <View style={[styles.chevronWrap, expanded && styles.chevronExpanded]}>
            <ChevronRightIcon size={s(14)} color={completed ? colors.muted : colors.gray} />
          </View>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.stepsSection}>
          {group.steps.map((item, index) => (
            <View
              key={item.step.id}
              style={[styles.stepWrap, index > 0 ? styles.stepWrapDivider : null]}
            >
              <TodayStepRow
                step={{ ...item.step, done: item.done }}
                index={index}
                embedded
              />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: s(10),
    marginBottom: s(6),
  },
  cardCompleted: {
    opacity: 0.72,
  },
  headerPressable: {
    gap: s(4),
  },
  titleRow: {
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
  nameCompleted: {
    color: colors.muted,
  },
  subtitle: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.muted,
    textTransform: 'capitalize',
  },
  progress: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(12),
    fontWeight: '600',
    color: colors.blue,
    flexShrink: 0,
  },
  progressCompleted: {
    color: colors.muted,
  },
  chevronWrap: {
    flexShrink: 0,
  },
  chevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  stepsSection: {
    marginTop: s(8),
    borderTopWidth: 1,
    borderTopColor: 'rgba(26,26,46,0.06)',
  },
  stepWrap: {
    paddingTop: s(6),
  },
  stepWrapDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(26,26,46,0.06)',
    marginTop: s(2),
    paddingTop: s(8),
  },
});
