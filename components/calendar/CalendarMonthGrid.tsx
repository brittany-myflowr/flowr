import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/icons/ProfileIcons';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { parseDateKey } from '@/lib/dateKey';
import { s, vs, fs } from '@/lib/scale';

const MONTH_WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const COLUMNS = 7;

/** Calendar grid palette — iCal layout with Flowr brand colors. */
const ical = {
  gridLine: 'rgba(60, 60, 67, 0.16)',
  weekday: colors.muted,
  dayText: colors.navy,
  mutedDay: 'rgba(26, 26, 46, 0.35)',
  today: colors.blue,
  todayText: colors.white,
  selectedFill: colors.light,
  selectedText: colors.navy,
  accent: colors.blue,
  dotComplete: colors.blue,
  dotProgress: colors.muted,
} as const;

const TODAY_CIRCLE = s(20);
const DAY_CELL_HEIGHT = vs(28);

export type CalendarMonthCell = {
  day: number | null;
  key: string | null;
  isToday: boolean;
  isSelected: boolean;
  isComplete: boolean;
  hasProgress: boolean;
  isOffDay: boolean;
};

type CalendarMonthGridProps = {
  viewDate: Date;
  cells: CalendarMonthCell[];
  showTodayButton?: boolean;
  onSelectDate: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday?: () => void;
};

function createEmptyCell(): CalendarMonthCell {
  return {
    day: null,
    key: null,
    isToday: false,
    isSelected: false,
    isComplete: false,
    hasProgress: false,
    isOffDay: false,
  };
}

function chunkWeeks(cells: CalendarMonthCell[]): CalendarMonthCell[][] {
  const padded = [...cells];
  while (padded.length % COLUMNS !== 0) {
    padded.push(createEmptyCell());
  }

  const weeks: CalendarMonthCell[][] = [];
  for (let index = 0; index < padded.length; index += COLUMNS) {
    weeks.push(padded.slice(index, index + COLUMNS));
  }

  return weeks;
}

function CalendarColumn({
  isLastColumn,
  isHeader = false,
  children,
}: {
  isLastColumn: boolean;
  isHeader?: boolean;
  children: ReactNode;
}) {
  return (
    <View
      style={[
        styles.column,
        isHeader ? styles.headerColumn : styles.dayColumn,
        !isLastColumn && styles.columnBorderRight,
      ]}
    >
      {children}
    </View>
  );
}

function DayCellContent({
  cell,
  onSelectDate,
}: {
  cell: CalendarMonthCell;
  onSelectDate: (date: Date) => void;
}) {
  if (!cell.day || !cell.key) return null;

  const showTodayCircle = cell.isToday;
  const showSelectedFill = cell.isSelected && !cell.isToday;

  return (
    <Pressable
      onPress={() => onSelectDate(parseDateKey(cell.key!))}
      style={[styles.monthDay, showSelectedFill && styles.monthDaySelected]}
      accessibilityRole="button"
      accessibilityState={{ selected: cell.isSelected }}
      accessibilityLabel={`${cell.day}${cell.isToday ? ', today' : ''}${cell.isSelected ? ', selected' : ''}`}
    >
      <View style={styles.dayNumberWrap}>
        {showTodayCircle ? <View style={styles.todayCircle} /> : null}
        <Text
          style={[
            styles.monthDayText,
            cell.isOffDay && !cell.isToday && styles.monthDayTextMuted,
            showTodayCircle && styles.monthDayTextToday,
            showSelectedFill && styles.monthDayTextSelected,
          ]}
        >
          {cell.day}
        </Text>
      </View>

      {!cell.isOffDay && (cell.isComplete || cell.hasProgress) ? (
        <View style={styles.dotsRow}>
          <View
            style={[
              styles.statusDot,
              cell.isComplete ? styles.statusDotComplete : styles.statusDotProgress,
            ]}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

export function CalendarMonthGrid({
  viewDate,
  cells,
  showTodayButton = false,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarMonthGridProps) {
  const weeks = chunkWeeks(cells);
  const monthName = viewDate.toLocaleDateString(undefined, { month: 'long' });
  const year = viewDate.getFullYear().toString();

  return (
    <View style={styles.monthCard}>
      <View style={styles.monthToolbar}>
        <View style={styles.monthNav}>
          <Pressable
            onPress={onPreviousMonth}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
          >
            <View style={styles.chevronLeft}>
              <ChevronRightIcon size={s(14)} color={ical.accent} />
            </View>
          </Pressable>

          <View style={styles.monthTitleBlock}>
            <Text style={styles.monthName}>{monthName}</Text>
            <Text style={styles.monthYear}>{year}</Text>
          </View>

          <Pressable
            onPress={onNextMonth}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel="Next month"
          >
            <ChevronRightIcon size={s(14)} color={ical.accent} />
          </Pressable>
        </View>

        {showTodayButton && onToday ? (
          <Pressable
            onPress={onToday}
            style={styles.todayButton}
            accessibilityRole="button"
            accessibilityLabel="Jump to today"
          >
            <Text style={styles.todayButtonLabel}>Today</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.calendarTable}>
        <View style={[styles.weekRow, styles.weekdayRow]}>
          {MONTH_WEEKDAY_LABELS.map((label, index) => (
            <CalendarColumn key={`${label}-${index}`} isHeader isLastColumn={index === COLUMNS - 1}>
              <Text style={styles.monthWeekdayLabel}>{label}</Text>
            </CalendarColumn>
          ))}
        </View>

        {weeks.map((week, weekIndex) => (
          <View
            key={`week-${weekIndex}`}
            style={[styles.weekRow, weekIndex < weeks.length - 1 && styles.weekRowBorderBottom]}
          >
            {week.map((cell, columnIndex) => (
              <CalendarColumn
                key={`${cell.key ?? 'empty'}-${weekIndex}-${columnIndex}`}
                isLastColumn={columnIndex === COLUMNS - 1}
              >
                <DayCellContent cell={cell} onSelectDate={onSelectDate} />
              </CalendarColumn>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  monthCard: {
    marginBottom: s(6),
  },
  monthToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s(5),
    gap: s(8),
  },
  monthNav: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    width: s(28),
    height: vs(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronLeft: {
    transform: [{ rotate: '180deg' }],
  },
  monthTitleBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: s(5),
  },
  monthName: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(15),
    color: ical.dayText,
  },
  monthYear: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: ical.weekday,
  },
  todayButton: {
    paddingHorizontal: s(4),
    paddingVertical: s(2),
  },
  todayButtonLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(13),
    color: ical.today,
  },
  calendarTable: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ical.gridLine,
  },
  weekRow: {
    flexDirection: 'row',
    width: '100%',
  },
  weekdayRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ical.gridLine,
  },
  weekRowBorderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ical.gridLine,
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  headerColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: vs(22),
  },
  dayColumn: {
    height: DAY_CELL_HEIGHT,
  },
  columnBorderRight: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: ical.gridLine,
  },
  monthWeekdayLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: ical.weekday,
  },
  monthDay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  monthDaySelected: {
    backgroundColor: ical.selectedFill,
  },
  dayNumberWrap: {
    width: TODAY_CIRCLE,
    height: TODAY_CIRCLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TODAY_CIRCLE / 2,
    backgroundColor: ical.today,
  },
  monthDayText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: ical.dayText,
  },
  monthDayTextMuted: {
    color: ical.mutedDay,
  },
  monthDayTextToday: {
    color: ical.todayText,
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  monthDayTextSelected: {
    color: ical.selectedText,
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  dotsRow: {
    position: 'absolute',
    bottom: s(2),
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(2),
  },
  statusDot: {
    width: s(3),
    height: s(3),
    borderRadius: s(1.5),
  },
  statusDotComplete: {
    backgroundColor: ical.dotComplete,
  },
  statusDotProgress: {
    backgroundColor: ical.dotProgress,
  },
});
