import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Daisy, Logo } from '@/components/brand';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import type { TimeOfDay } from '@/types';

const TIME_OF_DAY_LABELS: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

type TimeOfDayHeaderProps = {
  percent?: number;
  stepsLabel?: string;
  greeting?: string;
  brandPlacement?: 'corner' | 'center' | 'hidden';
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
  brandPlacement = 'corner',
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
    <GradientBackground variant={actualTimeOfDay} style={[styles.header, { paddingTop: 18 + insets.top }]}>
      {brandPlacement === 'corner' ? (
        <View style={[styles.brandCorner, { top: insets.top + 18 }]}>
          <Daisy color="rgba(255,255,255,0.75)" size={13} />
          <Logo size={13} color="rgba(255,255,255,0.75)" />
        </View>
      ) : null}

      <ProgressRing percent={percent} />

      {brandPlacement === 'center' ? (
        <View style={styles.brandCenter}>
          <Daisy color="rgba(255,255,255,0.95)" size={12} />
          <Logo size={12} color="rgba(255,255,255,0.7)" />
        </View>
      ) : null}

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
    paddingHorizontal: 14,
    paddingBottom: 14,
    alignItems: 'center',
  },
  brandCorner: {
    position: 'absolute',
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brandCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    marginBottom: 6,
  },
  greeting: {
    fontFamily: fonts.lora,
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 2,
  },
  stepsLabel: {
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
  },
  tabs: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.white,
  },
  tabLabel: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.white,
  },
});
