import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TodayProgressCard } from '@/components/calendar/TodayProgressCard';
import { Divider } from '@/components/ui/Divider';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useCalendarStats } from '@/hooks/useCalendarStats';
import { useTodayProgressByTimeOfDay } from '@/hooks/useTodayProgressByTimeOfDay';
import { useRoutines } from '@/providers/AppStore';

const MONTH_WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { routines } = useRoutines();
  const todayPeriods = useTodayProgressByTimeOfDay();
  const {
    streak,
    daysThisMonth,
    monthProgress,
    weekDays,
    monthGrid,
    hasAnyHistory,
  } = useCalendarStats();

  const showCalendarContent = hasAnyHistory || routines.length > 0;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: 18 + insets.top }]}>
        <Text style={styles.title}>My Calendar</Text>
        <Text style={styles.subtitle}>Your consistency</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!showCalendarContent ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptyBody}>
              Create a routine and complete steps on the Today tab to start tracking your
              consistency.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <StatCard value={String(streak)} label="Streak" />
              <StatCard value={String(daysThisMonth)} label="This Month" />
              <StatCard value={`${monthProgress}%`} label="Done" />
            </View>

            <Divider label="This Week" />
            <View style={styles.weekRow}>
              {weekDays.map((day) => (
                <View key={day.key} style={styles.weekCell}>
                  <Text style={styles.weekLabel}>{day.label}</Text>
                  <View
                    style={[
                      styles.dayCircle,
                      day.isToday && styles.dayCircleToday,
                      day.isComplete && !day.isToday && styles.dayCircleComplete,
                      day.hasProgress && !day.isComplete && !day.isToday && styles.dayCircleProgress,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        day.isToday && styles.dayNumberToday,
                        day.isComplete && !day.isToday && styles.dayNumberComplete,
                      ]}
                    >
                      {day.date.getDate()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.weekDot,
                      day.isComplete ? styles.weekDotComplete : styles.weekDotEmpty,
                    ]}
                  />
                </View>
              ))}
            </View>

            <Divider label="Today" />
            {todayPeriods.length === 0 ? (
              <View style={styles.todayEmpty}>
                <Text style={styles.todayEmptyText}>No steps scheduled for today.</Text>
              </View>
            ) : (
              todayPeriods.map((period) => (
                <TodayProgressCard key={period.timeOfDay} period={period} />
              ))
            )}

            <Divider label="This Month" />
            <View style={styles.monthCard}>
              <View style={styles.monthWeekdayRow}>
                {MONTH_WEEKDAY_LABELS.map((label, index) => (
                  <Text key={`${label}-${index}`} style={styles.monthWeekdayLabel}>
                    {label}
                  </Text>
                ))}
              </View>
              <View style={styles.monthGrid}>
                {monthGrid.map((cell, index) => (
                  <View key={`${cell.key ?? 'empty'}-${index}`} style={styles.monthCell}>
                    {cell.day ? (
                      <View
                        style={[
                          styles.monthDay,
                          cell.isToday && styles.dayCircleToday,
                          cell.isComplete && !cell.isToday && styles.dayCircleComplete,
                          cell.hasProgress &&
                            !cell.isComplete &&
                            !cell.isToday &&
                            styles.dayCircleProgress,
                        ]}
                      >
                        <Text
                          style={[
                            styles.monthDayText,
                            cell.isToday && styles.dayNumberToday,
                            cell.isComplete && !cell.isToday && styles.dayNumberComplete,
                          ]}
                        >
                          {cell.day}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: 20,
    color: colors.navy,
  },
  subtitle: {
    marginTop: 1,
    fontFamily: fonts.dmSans,
    fontSize: 10,
    color: colors.blue,
  },
  content: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginHorizontal: 4,
  },
  emptyTitle: {
    fontFamily: fonts.lora,
    fontSize: 16,
    color: colors.navy,
    marginBottom: 6,
  },
  emptyBody: {
    fontFamily: fonts.dmSans,
    fontSize: 11,
    color: colors.gray,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.lora,
    fontSize: 16,
    color: colors.navy,
  },
  statLabel: {
    marginTop: 1,
    fontFamily: fonts.dmSans,
    fontSize: 7,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 8,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  weekLabel: {
    fontFamily: fonts.dmSans,
    fontSize: 6,
    color: colors.muted,
  },
  dayCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  dayCircleComplete: {
    backgroundColor: colors.light,
    borderColor: '#c8d9e6',
  },
  dayCircleProgress: {
    backgroundColor: colors.white,
    borderColor: '#c8d9e6',
  },
  dayNumber: {
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.gray,
  },
  dayNumberToday: {
    color: colors.white,
  },
  dayNumberComplete: {
    color: colors.blue,
  },
  weekDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  weekDotComplete: {
    backgroundColor: colors.blue,
  },
  weekDotEmpty: {
    backgroundColor: colors.border,
  },
  todayEmpty: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  todayEmptyText: {
    fontFamily: fonts.dmSans,
    fontSize: 11,
    color: colors.gray,
  },
  monthCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  monthWeekdayRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  monthWeekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.dmSans,
    fontSize: 6,
    color: colors.muted,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  monthDay: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDayText: {
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.gray,
  },
});
