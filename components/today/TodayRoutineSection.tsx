import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/icons/ProfileIcons';
import { categoryColors } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
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

  return (
    <View style={styles.section}>
      <Pressable
        onPress={onToggleExpanded}
        style={[styles.header, completed && styles.headerCompleted]}
      >
        <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />
        <View style={styles.headerBody}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.routineName, completed && styles.routineNameCompleted]}
              numberOfLines={1}
            >
              {group.routine.name}
            </Text>
          </View>
          <Text style={[styles.progress, completed && styles.progressCompleted]}>
            {group.doneCount}/{group.totalCount}
          </Text>
          <View style={[styles.chevronWrap, expanded && styles.chevronExpanded]}>
            <ChevronRightIcon size={s(14)} color={completed ? colors.muted : colors.gray} />
          </View>
        </View>
      </Pressable>

      {expanded
        ? group.steps.map((item, index) => (
            <View key={item.step.id} style={styles.stepWrap}>
              {renderStepRow(item, index, group.steps.length)}
            </View>
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: s(8),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.white,
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  headerCompleted: {
    opacity: 0.88,
  },
  categoryBar: {
    width: s(4),
  },
  headerBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
  },
  titleRow: {
    flex: 1,
    minWidth: 0,
  },
  routineName: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(14),
    color: colors.navy,
  },
  routineNameCompleted: {
    color: colors.muted,
  },
  progress: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(10),
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
  stepWrap: {
    marginTop: s(5),
  },
});
