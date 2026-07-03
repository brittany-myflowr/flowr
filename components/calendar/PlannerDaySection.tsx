import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { PlannerPeriodSection } from '@/hooks/usePlannerDay';
import { s, vs, fs } from '@/lib/scale';

import { PlannerRoutineRow } from './PlannerRoutineRow';

type PlannerDaySectionProps = {
  section: PlannerPeriodSection;
  expandedByRoutineId: Record<string, boolean>;
  onToggleRoutineExpanded: (routineId: string) => void;
};

function buildSectionLabel(section: PlannerPeriodSection) {
  if (section.total === 0) return `${section.label} · off day`;
  return `${section.label} · ${section.done}/${section.total}`;
}

export function PlannerDaySection({
  section,
  expandedByRoutineId,
  onToggleRoutineExpanded,
}: PlannerDaySectionProps) {
  const isOffDay = section.total === 0;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{buildSectionLabel(section)}</Text>

      {isOffDay ? (
        <Text style={styles.offDayBody}>No steps scheduled for this time of day.</Text>
      ) : (
        section.routines.map((group) => (
          <PlannerRoutineRow
            key={group.routine.id}
            group={group}
            expanded={expandedByRoutineId[group.routine.id] === true}
            onToggleExpanded={() => onToggleRoutineExpanded(group.routine.id)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: s(8),
  },
  sectionLabel: {
    marginBottom: s(5),
    fontFamily: fonts.dmSans,
    fontSize: fs(9.5),
    letterSpacing: s(0.6),
    textTransform: 'uppercase',
    color: colors.muted,
  },
  offDayBody: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.muted,
    paddingVertical: vs(4),
  },
});
