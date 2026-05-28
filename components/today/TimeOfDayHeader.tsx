import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark, PhaseFlower } from '@/components/brand';
import { WeekProgressStrip, type WeekDay } from '@/components/today/WeekProgressStrip';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { CyclePhaseInfo } from '@/lib/cycle';
import type { TimeOfDay } from '@/types';
import { s, fs } from '@/lib/scale';

type TimeOfDayHeaderProps = {
  percent?: number;
  dayDone?: number;
  dayTotal?: number;
  phaseInfo?: CyclePhaseInfo | null;
  onPhasePress?: () => void;
  timeOfDay?: TimeOfDay;
  firstName?: string;
  dateLabel?: string;
  weekDays?: WeekDay[];
  streak?: number;
  showBrand?: boolean;
};

export function TimeOfDayHeader({
  percent = 0,
  dayDone = 0,
  dayTotal = 0,
  phaseInfo,
  onPhasePress,
  timeOfDay = 'morning',
  firstName,
  dateLabel,
  weekDays,
  streak,
  showBrand = true,
}: TimeOfDayHeaderProps) {
  const insets = useSafeAreaInsets();
  const { periodLine, nameLine } = getEditorialGreetingParts(timeOfDay, firstName);
  const soulLine = getTodaySoulLine({ timeOfDay, dayDone, dayTotal, phaseInfo });
  const accentColor = phaseInfo?.color;

  return (
    <View style={[styles.header, { paddingTop: insets.top + s(12) }]}>
      {showBrand ? (
        <BrandMark
          direction="row"
          flowerSize={s(16)}
          logoSize={s(16)}
          color="rgba(255,255,255,0.75)"
          style={styles.brandMark}
        />
      ) : null}

      <View style={styles.editorialBlock}>
        <Text style={styles.periodLine}>{periodLine}</Text>
        {nameLine ? <Text style={styles.nameLine}>{nameLine}</Text> : null}
        {dateLabel ? <Text style={styles.dateLabel}>{dateLabel}</Text> : null}

        {soulLine ? (
          soulLine.showPhaseDaisy && phaseInfo ? (
            <Pressable
              onPress={onPhasePress}
              style={styles.soulRow}
              accessibilityRole="button"
              accessibilityLabel={`${phaseInfo.label} phase. ${soulLine.text} Open cycle settings.`}
            >
              <PhaseFlower color={phaseInfo.color} size={s(13)} />
              <Text style={styles.soulLineText}>{soulLine.text}</Text>
            </Pressable>
          ) : (
            <Text style={styles.soulLine}>{soulLine.text}</Text>
          )
        ) : null}
      </View>

      {dayTotal > 0 ? (
        <Text style={styles.stepsLabel}>
          {dayDone} of {dayTotal} steps today
        </Text>
      ) : null}

      <ProgressBar percent={percent} total={dayTotal} />

      {weekDays?.length ? (
        <WeekProgressStrip
          days={weekDays}
          streak={streak}
          accentColor={accentColor}
        />
      ) : null}
    </View>
  );
}

export function getEditorialGreetingParts(timeOfDay: TimeOfDay, firstName?: string) {
  const period =
    timeOfDay === 'morning'
      ? 'morning'
      : timeOfDay === 'afternoon'
        ? 'afternoon'
        : 'evening';

  return {
    periodLine: `Good ${period},`,
    nameLine: firstName?.trim() ? `${firstName.trim()}.` : null,
  };
}

export function getTimeOfDayGreeting(timeOfDay: TimeOfDay, firstName?: string) {
  const { periodLine, nameLine } = getEditorialGreetingParts(timeOfDay, firstName);
  if (nameLine) {
    return `${periodLine} ${nameLine.replace(/\.$/, '')}.`;
  }
  return `${periodLine.replace(/,$/, '')}.`;
}

export function getTodayDateLabel(date = new Date()) {
  const weekday = date.toLocaleDateString(undefined, { weekday: 'long' });
  const monthDay = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  return `${weekday} · ${monthDay}`;
}

type SoulLineResult = {
  text: string;
  showPhaseDaisy: boolean;
};

function getTodaySoulLine({
  timeOfDay,
  dayDone,
  dayTotal,
  phaseInfo,
}: {
  timeOfDay: TimeOfDay;
  dayDone: number;
  dayTotal: number;
  phaseInfo?: CyclePhaseInfo | null;
}): SoulLineResult | null {
  if (dayTotal > 0 && dayDone === dayTotal) {
    return { text: 'You showed up for yourself today.', showPhaseDaisy: false };
  }

  if (dayTotal === 0) {
    return null;
  }

  if (phaseInfo) {
    return {
      text: `${phaseInfo.label} — ${phaseInfo.description.toLowerCase()}.`,
      showPhaseDaisy: true,
    };
  }

  const defaults: Record<TimeOfDay, string> = {
    morning: 'Start gentle.',
    afternoon: 'Keep your rhythm.',
    evening: 'Wind down slowly.',
  };

  return { text: defaults[timeOfDay], showPhaseDaisy: false };
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: s(14),
    paddingBottom: s(16),
    alignItems: 'stretch',
    gap: s(10),
    overflow: 'hidden',
  },
  brandMark: {
    alignSelf: 'flex-start',
    zIndex: 1,
  },
  editorialBlock: {
    alignSelf: 'stretch',
    gap: s(2),
    zIndex: 1,
  },
  periodLine: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(24),
    lineHeight: fs(28),
    color: colors.white,
  },
  nameLine: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(28),
    lineHeight: fs(32),
    color: colors.white,
    marginBottom: s(2),
  },
  dateLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: 'rgba(255,255,255,0.68)',
    marginTop: s(2),
  },
  soulRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    marginTop: s(4),
    alignSelf: 'flex-start',
  },
  soulLine: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    lineHeight: fs(15),
    color: 'rgba(255,255,255,0.78)',
    marginTop: s(4),
  },
  soulLineText: {
    flexShrink: 1,
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    lineHeight: fs(15),
    color: 'rgba(255,255,255,0.78)',
  },
  stepsLabel: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(11),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    zIndex: 1,
  },
});
