import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CyclePhaseBanner } from '@/components/cycle/CyclePhaseBanner';
import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { FirstRoutineCard } from '@/components/onboarding/FirstRoutineCard';
import { TodayCompletedRoutineRow } from '@/components/today/TodayCompletedRoutineRow';
import { TodayRoutineSection } from '@/components/today/TodayRoutineSection';
import { TodayStepRow } from '@/components/today/TodayStepRow';
import {
  getTimeOfDayGreeting,
  getTodayDateLabel,
  TimeOfDayHeader,
} from '@/components/today/TimeOfDayHeader';
import { FullWidthButton } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { colors } from '@/constants/colors';
import { tabPageTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import {
  useCurrentPhaseInfo,
  useTodayDayProgress,
  useTodaySections,
} from '@/hooks/useTodaySteps';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import { useAuth, useRoutines } from '@/providers/AppStore';
import type { TodayStep } from '@/hooks/useTodaySteps';
import type { TodayRoutineGroup } from '@/lib/todayGroups';
import type { TimeOfDay } from '@/types';
import { s, fs } from '@/lib/scale';

type CompletedTodayItem = {
  group: TodayRoutineGroup;
  periodLabel: string;
  timeOfDay: TimeOfDay;
};

function buildPeriodDividerLabel(
  label: string,
  done: number,
  total: number,
  isNow: boolean,
) {
  const parts = [label];
  if (isNow) parts.push('now');
  if (total > 0) parts.push(`${done}/${total}`);
  return parts.join(' · ');
}

export default function TodayScreen() {
  const router = useRouter();
  const actualTimeOfDay = useTimeOfDay();
  const [expandedByRoutineId, setExpandedByRoutineId] = useState<Record<string, boolean>>({});
  const [expandedDoneRoutineIds, setExpandedDoneRoutineIds] = useState<Record<string, boolean>>({});
  const [showDoneToday, setShowDoneToday] = useState(false);
  const initialExpandDone = useRef(false);
  const { user } = useAuth();
  const { routines, toggleStepDone } = useRoutines();
  const { done: dayDone, total: dayTotal, percent: dayPercent } = useTodayDayProgress();
  const periodSections = useTodaySections();
  const phaseInfo = useCurrentPhaseInfo();

  const dayStepsLabel =
    dayTotal === 0
      ? 'Nothing scheduled today'
      : `${dayDone} of ${dayTotal} steps done today`;

  const completedToday = useMemo(() => {
    const items: CompletedTodayItem[] = [];

    for (const section of periodSections) {
      for (const group of section.completedGroups) {
        items.push({
          group,
          periodLabel: section.label,
          timeOfDay: section.timeOfDay,
        });
      }
    }

    return items;
  }, [periodSections]);

  const activePeriodSections = useMemo(
    () => periodSections.filter((section) => section.activeGroups.length > 0),
    [periodSections],
  );

  useEffect(() => {
    if (initialExpandDone.current) return;

    const currentSection = periodSections.find((section) => section.timeOfDay === actualTimeOfDay);
    if (!currentSection) {
      initialExpandDone.current = true;
      return;
    }

    setExpandedByRoutineId((current) => {
      const next = { ...current };
      for (const group of currentSection.activeGroups) {
        next[group.routine.id] = true;
      }
      return next;
    });
    initialExpandDone.current = true;
  }, [periodSections, actualTimeOfDay]);

  const renderStepRow = ({ step, routine }: TodayStep, index: number) => {
    const schedule = step.schedule ?? routine.schedule;
    const phaseKeys = schedule.frequency === 'cycle' ? schedule.phases : undefined;

    return (
      <TodayStepRow
        step={step}
        index={index}
        embedded
        phaseKeys={phaseKeys}
        onToggle={() => toggleStepDone(routine.id, step.id)}
      />
    );
  };

  const renderActiveRoutineSection = (group: TodayRoutineGroup) => (
    <TodayRoutineSection
      key={group.routine.id}
      group={group}
      expanded={expandedByRoutineId[group.routine.id] === true}
      onToggleExpanded={() =>
        setExpandedByRoutineId((current) => ({
          ...current,
          [group.routine.id]: !current[group.routine.id],
        }))
      }
      renderStepRow={(item, index, _listLength) => renderStepRow(item, index)}
    />
  );

  const renderPeriodSection = (section: (typeof periodSections)[number]) => (
    <View key={section.timeOfDay}>
      <Divider
        label={buildPeriodDividerLabel(
          section.label,
          section.done,
          section.total,
          section.timeOfDay === actualTimeOfDay,
        )}
        large
      />
      {section.activeGroups.map((group) => renderActiveRoutineSection(group))}
    </View>
  );

  const renderDoneTodaySection = () => {
    if (completedToday.length === 0) return null;

    return (
      <View style={styles.doneTodaySection}>
        <Pressable
          onPress={() => setShowDoneToday((current) => !current)}
          style={styles.doneTodayToggle}
          accessibilityRole="button"
          accessibilityState={{ expanded: showDoneToday }}
          accessibilityLabel={`Done today, ${completedToday.length} routine${completedToday.length === 1 ? '' : 's'}`}
        >
          <Text style={styles.doneTodayLabel}>
            Done today ({completedToday.length})
          </Text>
          <Text style={styles.doneTodayChevron}>{showDoneToday ? '▾' : '▸'}</Text>
        </Pressable>

        {showDoneToday
          ? completedToday.map(({ group, periodLabel }) => (
              <TodayCompletedRoutineRow
                key={group.routine.id}
                group={group}
                periodLabel={periodLabel}
                expanded={expandedDoneRoutineIds[group.routine.id] === true}
                onToggleExpanded={() =>
                  setExpandedDoneRoutineIds((current) => ({
                    ...current,
                    [group.routine.id]: !current[group.routine.id],
                  }))
                }
                renderStepRow={(item, index, _listLength) => renderStepRow(item, index)}
              />
            ))
          : null}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <TimeOfDayHeader
        percent={dayPercent}
        greeting={getTimeOfDayGreeting(actualTimeOfDay, user?.firstName)}
        dateLabel={getTodayDateLabel()}
        dayStepsLabel={dayStepsLabel}
      />
      {phaseInfo ? (
        <CyclePhaseBanner
          phaseInfo={phaseInfo}
          onDetails={() => router.push('/(tabs)/routines/cycle-settings')}
        />
      ) : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {routines.length === 0 ? (
          <FirstRoutineCard onGetStarted={() => router.push('/(tabs)/routines/guided')} />
        ) : dayTotal === 0 ? (
          <InlineEmptyCard
            title="Nothing scheduled today"
            body="Your routines aren't due today based on their schedules. Check Calendar or Routines to adjust."
          />
        ) : (
          <>
            {activePeriodSections.length === 0 ? (
              <InlineEmptyCard
                compact
                title="All done for today"
                body="Nice work — everything scheduled for today is complete."
              />
            ) : (
              activePeriodSections.map((section) => renderPeriodSection(section))
            )}
            {renderDoneTodaySection()}
            <View style={styles.addStepButton}>
              <FullWidthButton
                label="+ Add a Routine"
                onPress={() => router.push('/(tabs)/routines/guided')}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: s(14),
    paddingTop: s(16),
    paddingBottom: s(24),
  },
  doneTodaySection: {
    marginTop: s(8),
  },
  doneTodayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: s(6),
    marginBottom: s(4),
  },
  doneTodayLabel: {
    fontFamily: fonts.dmSans,
    fontSize: tabPageTypography.sectionLabel,
    letterSpacing: s(1.5),
    textTransform: 'uppercase',
    color: colors.muted,
  },
  doneTodayChevron: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.muted,
  },
  addStepButton: {
    marginTop: s(12),
  },
});
