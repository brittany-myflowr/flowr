import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import type { TimeOfDay } from '@/types';
import { s, vs, fs } from '@/lib/scale';

const TIME_OF_DAY_LABELS: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

type TimeOfDayHeaderProps = {
  percent?: number;
  stepsLabel?: string;
  greeting?: string;
  showBrand?: boolean;
  selectedTimeOfDay?: TimeOfDay;
  onTimeOfDayChange?: (timeOfDay: TimeOfDay) => void;
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function TimeOfDayHeader({
  percent = 0,
  stepsLabel,
  greeting,
  showBrand = true,
  selectedTimeOfDay,
  onTimeOfDayChange,
}: TimeOfDayHeaderProps) {
  const insets = useSafeAreaInsets();
  const actualTimeOfDay = useTimeOfDay();
  const [internalTab, setInternalTab] = useState<TimeOfDay>(actualTimeOfDay);
  const activeTab = selectedTimeOfDay ?? internalTab;

  const setActiveTab = (timeOfDay: TimeOfDay) => {
    if (onTimeOfDayChange) {
      onTimeOfDayChange(timeOfDay);
    } else {
      setInternalTab(timeOfDay);
    }
  };

  return (
    <GradientBackground
      fill={false}
      variant={actualTimeOfDay}
      style={[styles.header, { paddingTop: insets.top + s(12) }]}
    >
      {showBrand ? (
        <BrandMark
          direction="row"
          flowerSize={s(16)}
          logoSize={s(16)}
          color="rgba(255,255,255,0.75)"
          style={styles.brandMark}
        />
      ) : null}

      <View style={styles.progressWrap}>
        <ProgressRing percent={percent} size={s(125)} />
      </View>

      {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}
      {stepsLabel ? <Text style={styles.stepsLabel}>{stepsLabel}</Text> : null}

      <View style={styles.tabs}>
        {TIME_OF_DAY_LABELS.map((timeOfDay) => {
          const isActive = activeTab === timeOfDay;
          return (
            <Pressable
              key={timeOfDay}
              onPress={() => setActiveTab(timeOfDay)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {capitalize(timeOfDay)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GradientBackground>
  );
}

export function getTimeOfDayGreeting(timeOfDay: TimeOfDay, firstName?: string) {
  const period =
    timeOfDay === 'morning'
      ? 'morning'
      : timeOfDay === 'afternoon'
        ? 'afternoon'
        : 'evening';

  if (firstName?.trim()) {
    return `Good ${period}, ${firstName.trim()}.`;
  }

  return `Good ${period}.`;
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: s(14),
    paddingBottom: s(14),
    alignItems: 'center',
  },
  brandMark: {
    alignSelf: 'flex-start',
    marginBottom: s(8),
  },
  progressWrap: {
    marginBottom: s(14),
  },
  greeting: {
    fontFamily: fonts.cardTitle,
    fontSize: fs(17),
    color: colors.white,
    textAlign: 'center',
    marginBottom: s(4),
  },
  stepsLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: 'rgba(255,255,255,0.7)',
  },
  tabs: {
    flexDirection: 'row',
    width: '100%',
    marginTop: s(8),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  tab: {
    flex: 1,
    paddingVertical: vs(6),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.white,
  },
  tabLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    letterSpacing: s(1),
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.white,
  },
});
