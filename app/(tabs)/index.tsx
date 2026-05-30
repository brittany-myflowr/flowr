import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ConfettiBurst } from '@/components/feedback/ConfettiBurst';
import { TAB_BAR_SCROLL_INSET } from '@/components/layout/TabBar';
import { FirstRoutineCard } from '@/components/onboarding/FirstRoutineCard';
import { TodayAllDoneMessage } from '@/components/today/TodayAllDoneMessage';
import { TodayCompletedRoutineRow } from '@/components/today/TodayCompletedRoutineRow';
import { TodayPeriodRoutineList } from '@/components/today/TodayPeriodRoutineList';
import { TodayStepRow } from '@/components/today/TodayStepRow';
import { TimeOfDayHeader } from '@/components/today/TimeOfDayHeader';
import { TodaySectionBar } from '@/components/today/TodaySectionBar';
import { UpNextCard, upNextReservedSpaceStyle } from '@/components/today/UpNextCard';
import { FullWidthButton } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { TodayGradientCanvas } from '@/components/today/TodayGradientCanvas';
import { colors } from '@/constants/colors';
import { tabPageTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { useUpNextStep } from '@/hooks/useUpNextStep';
import {
  TIME_OF_DAY_ORDER,
  useTodayAllPeriodSections,
  useTodayDayProgress,
  useTodaySections,
} from '@/hooks/useTodaySteps';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import { hapticDayComplete, hapticStepComplete } from '@/lib/haptics';
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
  const [showConfetti, setShowConfetti] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);
  const previousDayDone = useRef(0);
  const { user } = useAuth();
  const { routines, toggleStepDone, reorderTodayRoutineGroups } = useRoutines();
  const { done: dayDone, total: dayTotal } = useTodayDayProgress();
  const periodSections = useTodaySections();
  const allPeriodSections = useTodayAllPeriodSections();
  const upNext = useUpNextStep(actualTimeOfDay);

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

  const hasActiveWork = periodSections.some((section) => section.activeGroups.length > 0);
  const allRoutinesDoneToday = dayTotal > 0 && dayDone === dayTotal && !hasActiveWork;

  useEffect(() => {
    if (allRoutinesDoneToday && completedToday.length > 0) {
      setShowDoneToday(true);
    }
  }, [allRoutinesDoneToday, completedToday.length]);

  useEffect(() => {
    if (dayTotal > 0 && dayDone === dayTotal && previousDayDone.current < dayTotal) {
      hapticDayComplete();
      setShowConfetti(true);
    }
    previousDayDone.current = dayDone;
  }, [dayDone, dayTotal]);

  const handleToggleStep = (routineId: string, stepId: string) => {
    hapticStepComplete();
    toggleStepDone(routineId, stepId);
  };

  const handleUpNextComplete = () => {
    if (!upNext) return;
    handleToggleStep(upNext.routine.id, upNext.step.id);
  };

  const renderStepRow = ({ step, routine }: TodayStep, index: number) => {
    const schedule = step.schedule ?? routine.schedule;
    const phaseKeys = schedule.frequency === 'cycle' ? schedule.phases : undefined;

    return (
      <TodayStepRow
        step={step}
        index={index}
        embedded
        phaseKeys={phaseKeys}
        onToggle={() => handleToggleStep(routine.id, step.id)}
      />
    );
  };

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
        outlined
      />
      {section.activeGroups.length >= 2 ? (
        <Text style={styles.reorderHint}>Hold a routine to reorder</Text>
      ) : null}
      <TodayPeriodRoutineList
        timeOfDay={section.timeOfDay}
        groups={section.activeGroups}
        expandedByRoutineId={expandedByRoutineId}
        onToggleExpanded={(routineId) =>
          setExpandedByRoutineId((current) => ({
            ...current,
            [routineId]: !current[routineId],
          }))
        }
        onReorder={reorderTodayRoutineGroups}
        onScrollLockChange={setScrollLocked}
        renderStepRow={(item, index, _listLength) => renderStepRow(item, index)}
      />
    </View>
  );

  const renderEmptyPeriodSection = (section: (typeof allPeriodSections)[number]) => (
    <View key={section.timeOfDay}>
      <Divider
        label={buildPeriodDividerLabel(
          section.label,
          section.done,
          section.total,
          section.timeOfDay === actualTimeOfDay,
        )}
        large
        outlined
      />
      <Text style={styles.periodEmptyMessage}>Nothing scheduled</Text>
    </View>
  );

  const openGuidedRoutine = () => router.push('/(tabs)/routines/guided');

  const renderAddRoutineButton = () => (
    <View style={styles.addStepButton}>
      <FullWidthButton label="+ Add a Routine" onPress={openGuidedRoutine} />
    </View>
  );

  const renderEmptyDayScrollContent = () => (
    <>
      {allPeriodSections.map(renderEmptyPeriodSection)}
      {routines.length > 0 ? renderAddRoutineButton() : null}
    </>
  );

  const renderPeriodSections = () =>
    TIME_OF_DAY_ORDER.map((timeOfDay) => {
      const section = periodSections.find((entry) => entry.timeOfDay === timeOfDay);
      if (!section || section.activeGroups.length === 0) return null;

      return renderPeriodSection(section);
    });

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

  const useStickyHeader = routines.length > 0 && dayTotal > 0;

  const renderScheduledScrollContent = () => (
    <>
      {hasActiveWork ? renderPeriodSections() : null}

      {renderDoneTodaySection()}

      {renderAddRoutineButton()}
    </>
  );

  return (
    <TodayGradientCanvas timeOfDay={actualTimeOfDay} style={styles.screen}>
      <ConfettiBurst active={showConfetti} onFinished={() => setShowConfetti(false)} />

      {useStickyHeader ? (
        <>
          <View style={styles.stickyHeader}>
            <TimeOfDayHeader />

            <View style={styles.stickyCardWrap}>
              {upNext && hasActiveWork ? (
                <UpNextCard upNext={upNext} onComplete={handleUpNextComplete} />
              ) : allRoutinesDoneToday ? (
                <TodayAllDoneMessage />
              ) : (
                <View style={upNextReservedSpaceStyle.placeholder} />
              )}
            </View>

            <View style={styles.stickyCardWrap}>
              <TodaySectionBar firstName={user?.firstName} />
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!scrollLocked}
          >
            <View style={styles.body}>{renderScheduledScrollContent()}</View>
          </ScrollView>
        </>
      ) : (
        <>
          <View style={styles.stickyHeader}>
            <TimeOfDayHeader />

            {routines.length === 0 ? (
              <View style={styles.stickyCardWrap}>
                <FirstRoutineCard onGetStarted={openGuidedRoutine} />
              </View>
            ) : null}

            <View style={styles.stickyCardWrap}>
              <TodaySectionBar firstName={user?.firstName} />
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!scrollLocked}
          >
            <View style={styles.body}>{renderEmptyDayScrollContent()}</View>
          </ScrollView>
        </>
      )}
    </TodayGradientCanvas>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  stickyHeader: {
    backgroundColor: 'transparent',
  },
  stickyCardWrap: {
    paddingHorizontal: s(14),
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flexGrow: 1,
    paddingBottom: TAB_BAR_SCROLL_INSET,
  },
  body: {
    paddingHorizontal: s(14),
    paddingTop: s(6),
  },
  reorderHint: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    color: colors.muted,
    textAlign: 'center',
    marginBottom: s(6),
    marginTop: s(-2),
  },
  periodEmptyMessage: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.muted,
    textAlign: 'center',
    marginBottom: s(8),
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
    fontFamily: fonts.dmSansMedium,
    fontSize: tabPageTypography.sectionLabel,
    fontWeight: '500',
    letterSpacing: s(2.4),
    textTransform: 'uppercase',
    color: colors.navy,
  },
  doneTodayChevron: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: colors.navy,
  },
  addStepButton: {
    marginTop: s(12),
  },
});
