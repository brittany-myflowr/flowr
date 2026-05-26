import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { TodayProgressCard } from '@/components/calendar/TodayProgressCard';
import { TabPageHeader } from '@/components/layout/TabPageHeader';
import { Divider } from '@/components/ui/Divider';
import { colors } from '@/constants/colors';
import { tabPageStyles } from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { useCalendarStats } from '@/hooks/useCalendarStats';
import { useTodayProgressByTimeOfDay } from '@/hooks/useTodayProgressByTimeOfDay';
import { s, vs, fs } from '@/lib/scale';

const MONTH_WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarScreen() {
  const todayPeriods = useTodayProgressByTimeOfDay();
  const {
    streak,
    daysThisMonth,
    monthProgress,
    weekDays,
    monthGrid,
  } = useCalendarStats();

  return (
    <View style={tabPageStyles.screen}>
      <TabPageHeader title="My Calendar" subtitle="Your consistency" />

      <ScrollView
        style={tabPageStyles.scroll}
        contentContainerStyle={tabPageStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <StatCard value={String(streak)} label="Streak" />
          <StatCard value={String(daysThisMonth)} label="This Month" />
          <StatCard value={`${monthProgress}%`} label="Done" />
        </View>

        <Divider label="This Week" large />
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

        <Divider label="Today" large />
        {todayPeriods.map((period) => (
          <TodayProgressCard key={period.timeOfDay} period={period} />
        ))}

        <Divider label="This Month" large />
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
  statsRow: {
    flexDirection: 'row',
    gap: s(5),
    marginBottom: s(8),
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: vs(9),
    paddingHorizontal: s(4),
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(18.05),
    color: colors.navy,
  },
  statLabel: {
    marginTop: s(1),
    fontFamily: fonts.dmSans,
    fontSize: fs(7.6),
    letterSpacing: s(1),
    textTransform: 'uppercase',
    color: colors.muted,
  },
  weekRow: {
    flexDirection: 'row',
    gap: s(3),
    marginBottom: s(8),
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    gap: s(2),
  },
  weekLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(6.65),
    color: colors.muted,
  },
  dayCircle: {
    width: s(24),
    height: vs(24),
    borderRadius: s(12),
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
    fontSize: fs(10.45),
    color: colors.gray,
  },
  dayNumberToday: {
    color: colors.white,
  },
  dayNumberComplete: {
    color: colors.blue,
  },
  weekDot: {
    width: s(5),
    height: vs(5),
    borderRadius: s(2.5),
  },
  weekDotComplete: {
    backgroundColor: colors.blue,
  },
  weekDotEmpty: {
    backgroundColor: colors.border,
  },
  monthCard: {
    backgroundColor: colors.white,
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: colors.border,
    padding: s(10),
  },
  monthWeekdayRow: {
    flexDirection: 'row',
    marginBottom: s(3),
  },
  monthWeekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.dmSans,
    fontSize: fs(6.65),
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
    padding: s(2),
  },
  monthDay: {
    width: s(26),
    height: vs(26),
    borderRadius: s(13),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDayText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10.45),
    color: colors.gray,
  },
});
