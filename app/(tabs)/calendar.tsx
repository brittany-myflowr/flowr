import { useCallback, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { CalendarMonthGrid } from '@/components/calendar/CalendarMonthGrid';
import { CalendarStatsFooter } from '@/components/calendar/CalendarStatsFooter';
import { PlannerDateHeader } from '@/components/calendar/PlannerDateHeader';
import { PlannerDayCompleteMessage } from '@/components/calendar/PlannerDayCompleteMessage';
import { PlannerDayEmpty } from '@/components/calendar/PlannerDayEmpty';
import { PlannerDayOutOfMonthHint } from '@/components/calendar/PlannerDayOutOfMonthHint';
import { PlannerDaySection } from '@/components/calendar/PlannerDaySection';
import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { TabPageHeader } from '@/components/layout/TabPageHeader';
import { plannerCard } from '@/constants/plannerCardStyles';
import { tabPageStyles } from '@/constants/tabPageTypography';
import { hasTrackableRoutines } from '@/lib/applicableSteps';
import { addMonths, formatDateKey, isSameMonth, startOfMonth } from '@/lib/dateKey';
import { useCalendarStats } from '@/hooks/useCalendarStats';
import { usePlannerDay } from '@/hooks/usePlannerDay';
import { useRoutines } from '@/providers/AppStore';
import { s } from '@/lib/scale';

function hapticDateSelect() {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;
  void Haptics.selectionAsync();
}

export default function CalendarScreen() {
  const { routines } = useRoutines();
  const hasScheduledSteps = hasTrackableRoutines(routines);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [expandedByRoutineId, setExpandedByRoutineId] = useState<Record<string, boolean>>({});
  const selectedDateKey = formatDateKey(selectedDate);
  const today = new Date();
  const isSelectedInViewMonth = isSameMonth(selectedDate, viewMonth);

  const {
    streak,
    daysThisMonth,
    monthProgress,
    monthGrid,
  } = useCalendarStats(viewMonth, selectedDateKey);

  const plannerDay = usePlannerDay(selectedDate);
  const activeSections = useMemo(
    () => plannerDay.sections.filter((section) => section.total > 0),
    [plannerDay.sections],
  );
  const isDayComplete =
    plannerDay.hasScheduledSteps && plannerDay.dayDone === plannerDay.dayTotal;

  const showTodayButton =
    !isSameMonth(viewMonth, today) || selectedDateKey !== formatDateKey(today);

  const selectedMonthLabel = selectedDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
  const monthShortLabel = viewMonth.toLocaleDateString(undefined, { month: 'short' });

  const handleSelectDate = useCallback((date: Date) => {
    hapticDateSelect();
    setSelectedDate(date);
    setExpandedByRoutineId({});
  }, []);

  const handlePreviousMonth = useCallback(() => {
    hapticDateSelect();
    setViewMonth((current) => addMonths(current, -1));
  }, []);

  const handleNextMonth = useCallback(() => {
    hapticDateSelect();
    setViewMonth((current) => addMonths(current, 1));
  }, []);

  const handleToday = useCallback(() => {
    hapticDateSelect();
    const now = new Date();
    setViewMonth(startOfMonth(now));
    setSelectedDate(now);
    setExpandedByRoutineId({});
  }, []);

  const handleJumpToSelectedMonth = useCallback(() => {
    hapticDateSelect();
    setViewMonth(startOfMonth(selectedDate));
  }, [selectedDate]);

  const handleToggleRoutineExpanded = useCallback((routineId: string) => {
    setExpandedByRoutineId((current) => ({
      ...current,
      [routineId]: !current[routineId],
    }));
  }, []);

  return (
    <View style={tabPageStyles.screen}>
      <TabPageHeader title="Calendar" />

      <ScrollView
        style={tabPageStyles.scroll}
        contentContainerStyle={tabPageStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {!hasScheduledSteps ? (
          <InlineEmptyCard
            compact
            title="No routines to track yet"
            body="Create a routine with steps on the Routines tab. Your schedule will show up here."
          />
        ) : null}

        {!isSelectedInViewMonth ? (
          <PlannerDayOutOfMonthHint
            selectedMonthLabel={selectedMonthLabel}
            onJumpToMonth={handleJumpToSelectedMonth}
          />
        ) : null}

        <CalendarMonthGrid
          viewDate={viewMonth}
          cells={monthGrid}
          showTodayButton={showTodayButton}
          onSelectDate={handleSelectDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />

        {hasScheduledSteps ? (
          <View style={[styles.dayDetailCard, plannerCard()]}>
            <PlannerDateHeader
              date={selectedDate}
              dayDone={plannerDay.dayDone}
              dayTotal={plannerDay.dayTotal}
              isToday={plannerDay.isToday}
            />

            {isDayComplete ? <PlannerDayCompleteMessage isToday={plannerDay.isToday} /> : null}

            {plannerDay.hasScheduledSteps ? (
              activeSections.map((section) => (
                <PlannerDaySection
                  key={section.timeOfDay}
                  section={section}
                  expandedByRoutineId={expandedByRoutineId}
                  onToggleRoutineExpanded={handleToggleRoutineExpanded}
                />
              ))
            ) : (
              <PlannerDayEmpty
                isToday={plannerDay.isToday}
                isFuture={plannerDay.isFuture}
              />
            )}
          </View>
        ) : null}

        {hasScheduledSteps ? (
          <CalendarStatsFooter
            streak={streak}
            daysThisMonth={daysThisMonth}
            monthProgress={monthProgress}
            monthLabel={monthShortLabel}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dayDetailCard: {
    padding: s(12),
    marginBottom: s(4),
  },
});
