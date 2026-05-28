import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { ChevronRightIcon } from '@/components/icons/ProfileIcons';
import { categoryColors } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { todayGlassCard } from '@/constants/todayCardStyles';
import { fonts } from '@/constants/typography';
import type { TodayRoutineGroup } from '@/lib/todayGroups';
import { s, vs, fs } from '@/lib/scale';

type TodayRoutineSectionProps = {
  group: TodayRoutineGroup;
  expanded: boolean;
  completed?: boolean;
  isDragging?: boolean;
  /** When false, tap-to-expand is handled by the parent reorder list. */
  pressableHeader?: boolean;
  onToggleExpanded: () => void;
  renderStepRow: (
    item: TodayRoutineGroup['steps'][number],
    index: number,
    listLength: number,
  ) => React.ReactNode;
};

export function TodayRoutineSection({
  group,
  expanded,
  completed = false,
  isDragging = false,
  pressableHeader = true,
  onToggleExpanded,
  renderStepRow,
}: TodayRoutineSectionProps) {
  const categoryColor = categoryColors[group.routine.category];
  const progressPercent =
    group.totalCount === 0 ? 0 : Math.round((group.doneCount / group.totalCount) * 100);

  const headerContent = (
    <>
      <View style={styles.titleRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${categoryColor}28` }]}>
          <Daisy color={categoryColor} size={s(16)} />
        </View>

        <View style={styles.meta}>
          <Text style={[styles.name, completed && styles.nameCompleted]} numberOfLines={1}>
            {group.routine.name}
          </Text>
          <Text style={[styles.subtitle, completed && styles.subtitleCompleted]}>
            {group.routine.category}
          </Text>
        </View>

        <Text style={[styles.progress, completed && styles.progressCompleted]}>
          {group.doneCount}/{group.totalCount}
        </Text>

        <View style={[styles.chevronWrap, expanded && styles.chevronExpanded]}>
          <ChevronRightIcon size={s(14)} color={completed ? colors.muted : colors.gray} />
        </View>
      </View>

      {!expanded ? (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%`, backgroundColor: categoryColor },
            ]}
          />
        </View>
      ) : null}
    </>
  );

  return (
    <View
      style={[
        styles.card,
        todayGlassCard(categoryColor, 'routine'),
        completed && styles.cardCompleted,
        isDragging && styles.cardDragging,
      ]}
    >
      {pressableHeader ? (
        <Pressable onPress={onToggleExpanded} style={styles.headerPressable}>
          {headerContent}
        </Pressable>
      ) : (
        <View
          style={styles.headerPressable}
          accessibilityRole="button"
          accessibilityLabel={`${group.routine.name}. Tap to expand. Hold to reorder.`}
        >
          {headerContent}
        </View>
      )}

      {expanded ? (
        <View style={styles.stepsSection}>
          {group.steps.map((item, index) => (
            <View
              key={item.step.id}
              style={[styles.stepWrap, index > 0 ? styles.stepWrapDivider : null]}
            >
              {renderStepRow(item, index, group.steps.length)}
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
  cardDragging: {
    opacity: 0.94,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.14,
    shadowRadius: s(8),
    elevation: 4,
  },
  headerPressable: {
    gap: s(6),
  },
  titleRow: {
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
    fontSize: fs(9),
    color: colors.muted,
    textTransform: 'capitalize',
  },
  subtitleCompleted: {
    color: colors.muted,
  },
  progress: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(9),
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
  progressTrack: {
    height: s(3),
    borderRadius: s(2),
    backgroundColor: 'rgba(26,26,46,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: s(2),
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
