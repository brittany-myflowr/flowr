import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ConfettiBurst } from '@/components/feedback/ConfettiBurst';
import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { FirstRoutineCard } from '@/components/onboarding/FirstRoutineCard';
import { FuturePeriodPreview } from '@/components/today/FuturePeriodPreview';
import { TodayAllDoneCard } from '@/components/today/TodayAllDoneCard';
import { TodayCompletedRoutineRow } from '@/components/today/TodayCompletedRoutineRow';
import { TodayPeriodRoutineList } from '@/components/today/TodayPeriodRoutineList';
import { TodayStepRow } from '@/components/today/TodayStepRow';
import { getTodayDateLabel, TimeOfDayHeader } from '@/components/today/TimeOfDayHeader';
import { UpNextCard } from '@/components/today/UpNextCard';
import { FullWidthButton } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { tabPageTypography } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { useCalendarStats } from '@/hooks/useCalendarStats';
import { useUpNextStep } from '@/hooks/useUpNextStep';
import {
  TIME_OF_DAY_ORDER,
  useCurrentPhaseInfo,
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

const PERIOD_INDEX: Record<TimeOfDay, number> = {
  morning: 0,
  afternoon: 1,
  evening: 2,
};

function isFuturePeriod(timeOfDay: TimeOfDay, current: TimeOfDay) {
  return PERIOD_INDEX[timeOfDay] > PERIOD_INDEX[current];
}

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
  const [expandedFuturePeriods, setExpandedFuturePeriods] = useState<Record<string, boolean>>({});
  const [showDoneToday, setShowDoneToday] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);
  const initialExpandDone = useRef(false);
  const previousDayDone = useRef(0);
  const { user } = useAuth();
  const { routines, toggleStepDone, reorderTodayRoutineGroups } = useRoutines();
  const { done: dayDone, total: dayTotal, percent: dayPercent } = useTodayDayProgress();
  const periodSections = useTodaySections();
  const phaseInfo = useCurrentPhaseInfo();
  const upNext = useUpNextStep(actualTimeOfDay);
  const { streak, weekDays } = useCalendarStats();

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
        light
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

  const renderPeriodSections = () =>
    TIME_OF_DAY_ORDER.map((timeOfDay) => {
      const section = periodSections.find((entry) => entry.timeOfDay === timeOfDay);
      if (!section || section.activeGroups.length === 0) return null;

      const isFuture = isFuturePeriod(section.timeOfDay, actualTimeOfDay);
      const isExpanded = expandedFuturePeriods[section.timeOfDay] === true;

      if (isFuture && !isExpanded) {
        const remainingSteps = section.total - section.done;

        return (
          <FuturePeriodPreview
            key={section.timeOfDay}
            label={section.label}
            timeOfDay={section.timeOfDay}
            remainingSteps={remainingSteps}
            onPress={() =>
              setExpandedFuturePeriods((current) => ({
                ...current,
                [section.timeOfDay]: true,
              }))
            }
          />
        );
      }

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

  const hasActiveWork = periodSections.some((section) => section.activeGroups.length > 0);

  return (
    <GradientBackground fill variant={actualTimeOfDay} style={styles.screen}>
      <ConfettiBurst active={showConfetti} onFinished={() => setShowConfetti(false)} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!scrollLocked}
      >
        <TimeOfDayHeader
          percent={dayPercent}
          dayDone={dayDone}
          dayTotal={dayTotal}
          phaseInfo={phaseInfo}
          onPhasePress={() => router.push('/(tabs)/routines/cycle-settings')}
          timeOfDay={actualTimeOfDay}
          firstName={user?.firstName}
          dateLabel={getTodayDateLabel()}
          weekDays={weekDays}
          streak={streak}
        />

        <View style={styles.body}>
          {routines.length === 0 ? (
            <FirstRoutineCard onGetStarted={() => router.push('/(tabs)/routines/guided')} />
          ) : dayTotal === 0 ? (
            <InlineEmptyCard
              title="Nothing scheduled today"
              body="Your routines aren't due today based on their schedules. Check Calendar or Routines to adjust."
            />
          ) : (
            <>
              {upNext && hasActiveWork ? (
                <UpNextCard upNext={upNext} onComplete={handleUpNextComplete} />
              ) : null}

              {!hasActiveWork ? (
                <TodayAllDoneCard firstName={user?.firstName} streak={streak} />
              ) : (
                renderPeriodSections()
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
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flexGrow: 1,
    paddingBottom: s(24),
  },
  body: {
    paddingHorizontal: s(14),
    paddingTop: s(4),
  },
  reorderHint: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    color: 'rgba(255,255,255,0.58)',
    textAlign: 'center',
    marginBottom: s(6),
    marginTop: s(-2),
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
    color: 'rgba(255,255,255,0.78)',
  },
  doneTodayChevron: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: 'rgba(255,255,255,0.78)',
  },
  addStepButton: {
    marginTop: s(12),
  },
});
