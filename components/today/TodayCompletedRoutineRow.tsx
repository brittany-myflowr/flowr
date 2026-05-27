import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Daisy } from '@/components/brand';
import { CheckIcon } from '@/components/icons/ActionIcons';
import { ChevronRightIcon } from '@/components/icons/ProfileIcons';
import { categoryColors } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { TodayRoutineGroup } from '@/lib/todayGroups';
import { s, vs, fs } from '@/lib/scale';

type TodayCompletedRoutineRowProps = {
  group: TodayRoutineGroup;
  periodLabel: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  renderStepRow: (
    item: TodayRoutineGroup['steps'][number],
    index: number,
    listLength: number,
  ) => React.ReactNode;
};

export function TodayCompletedRoutineRow({
  group,
  periodLabel,
  expanded,
  onToggleExpanded,
  renderStepRow,
}: TodayCompletedRoutineRowProps) {
  const categoryColor = categoryColors[group.routine.category];

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onToggleExpanded}
        style={styles.headerPressable}
        accessibilityRole="button"
        accessibilityLabel={`${group.routine.name}, completed, ${periodLabel}`}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${categoryColor}28` }]}>
          <Daisy color={categoryColor} size={s(14)} />
        </View>

        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {group.routine.name}
          </Text>
          <Text style={styles.subtitle}>{periodLabel}</Text>
        </View>

        <View style={styles.checkWrap}>
          <CheckIcon size={s(10)} color={colors.white} />
        </View>

        <Text style={styles.progress}>
          {group.doneCount}/{group.totalCount}
        </Text>

        <View style={[styles.chevronWrap, expanded && styles.chevronExpanded]}>
          <ChevronRightIcon size={s(12)} color={colors.muted} />
        </View>
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
    backgroundColor: colors.white,
    borderRadius: s(10),
    paddingHorizontal: s(10),
    paddingVertical: vs(8),
    marginBottom: s(5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  iconWrap: {
    width: s(26),
    height: vs(26),
    borderRadius: s(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(11),
    color: colors.navy,
  },
  subtitle: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(0.6),
    textTransform: 'uppercase',
    color: colors.muted,
  },
  checkWrap: {
    width: s(18),
    height: vs(18),
    borderRadius: s(9),
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.muted,
    flexShrink: 0,
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
