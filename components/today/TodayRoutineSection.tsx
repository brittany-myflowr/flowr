import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { ChevronRightIcon } from '@/components/icons/ProfileIcons';
import { Badge } from '@/components/ui/Badge';
import { categoryColors } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { todayGlassCard } from '@/constants/todayCardStyles';
import { fonts } from '@/constants/typography';
import { formatFrequency } from '@/providers/RoutinesProvider';
import type { TodayRoutineGroup } from '@/lib/todayGroups';
import { s, vs, fs } from '@/lib/scale';

type TodayRoutineSectionProps = {
  group: TodayRoutineGroup;
  expanded: boolean;
  completed?: boolean;
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
  onToggleExpanded,
  renderStepRow,
}: TodayRoutineSectionProps) {
  const categoryColor = categoryColors[group.routine.category];
  const progressLabel = `${group.doneCount}/${group.totalCount} done`;

  return (
    <View style={[styles.card, todayGlassCard(categoryColor), completed && styles.cardCompleted]}>
      <Pressable onPress={onToggleExpanded} style={styles.headerPressable}>
        <View style={styles.headerRow}>
          <View style={[styles.iconWrap, { backgroundColor: `${categoryColor}28` }]}>
            <Daisy color={categoryColor} size={s(16)} />
          </View>

          <View style={styles.meta}>
            <Text style={[styles.name, completed && styles.nameCompleted]} numberOfLines={1}>
              {group.routine.name}
            </Text>
            <Text style={[styles.subtitle, completed && styles.subtitleCompleted]}>
              {group.totalCount} steps · {group.routine.category}
            </Text>
          </View>

          <Text style={[styles.progress, completed && styles.progressCompleted]}>{progressLabel}</Text>

          <View style={[styles.chevronWrap, expanded && styles.chevronExpanded]}>
            <ChevronRightIcon size={s(14)} color={completed ? colors.muted : colors.gray} />
          </View>
        </View>

        <View style={styles.scheduleChip}>
          <Text style={styles.scheduleText}>
            {formatFrequency(group.routine.schedule.frequency)}
          </Text>
        </View>

        {!expanded ? (
          <View style={styles.badges}>
            {group.steps.slice(0, 3).map((item) => (
              <Badge
                key={item.step.id}
                label={item.step.name}
                color={colors.gray}
                backgroundColor={colors.inputBg}
              />
            ))}
          </View>
        ) : null}
      </Pressable>

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
    opacity: 0.55,
  },
  headerPressable: {
    gap: 0,
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
  stepsSection: {
    marginTop: s(8),
    borderTopWidth: 1,
    borderTopColor: colors.inputBg,
  },
  stepWrap: {
    paddingTop: s(6),
  },
  stepWrapDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.inputBg,
    marginTop: s(2),
    paddingTop: s(8),
  },
});
