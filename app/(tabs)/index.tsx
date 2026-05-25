import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CyclePhaseBanner } from '@/components/cycle/CyclePhaseBanner';
import { FirstRoutineCard } from '@/components/onboarding/FirstRoutineCard';
import { TodayStepRow } from '@/components/today/TodayStepRow';
import {
  getTimeOfDayGreeting,
  TimeOfDayHeader,
} from '@/components/today/TimeOfDayHeader';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useTodayProgress, useCurrentPhaseInfo } from '@/hooks/useTodaySteps';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import {
  moveTodayStepOrder,
  syncTodayStepOrder,
} from '@/lib/todayOrder';
import { useAuth, useAppStore, useRoutines } from '@/providers/AppStore';
import type { TimeOfDay } from '@/types';

export default function TodayScreen() {
  const router = useRouter();
  const actualTimeOfDay = useTimeOfDay();
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState(actualTimeOfDay);
  const [reorderMode, setReorderMode] = useState(false);
  const { user } = useAuth();
  const { todayStepOrders } = useAppStore();
  const { routines, toggleStepDone, reorderTodaySteps } = useRoutines();
  const { steps, done, total, percent } = useTodayProgress(selectedTimeOfDay);
  const phaseInfo = useCurrentPhaseInfo();

  const stepIds = useMemo(() => steps.map(({ step }) => step.id), [steps]);

  const stepsLabel =
    total === 0 ? 'No steps for this time of day' : `${done} of ${total} steps done`;

  const handleTimeOfDayChange = (timeOfDay: TimeOfDay) => {
    setSelectedTimeOfDay(timeOfDay);
    setReorderMode(false);
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    const order = syncTodayStepOrder(todayStepOrders[selectedTimeOfDay] ?? [], stepIds);
    reorderTodaySteps(selectedTimeOfDay, moveTodayStepOrder(order, fromIndex, toIndex));
  };

  return (
    <View style={styles.screen}>
      <TimeOfDayHeader
        percent={percent}
        brandPlacement="center"
        greeting={getTimeOfDayGreeting(selectedTimeOfDay, user?.firstName)}
        stepsLabel={stepsLabel}
        selectedTimeOfDay={selectedTimeOfDay}
        onTimeOfDayChange={handleTimeOfDayChange}
      />
      {phaseInfo ? (
        <CyclePhaseBanner
          phaseInfo={phaseInfo}
          onDetails={() => router.push('/(tabs)/routines/cycle-settings')}
        />
      ) : null}
      {reorderMode ? (
        <View style={styles.reorderBanner}>
          <Text style={styles.reorderBannerText}>
            Reorder mode — use ↑ ↓ or tap Done when finished
          </Text>
          <Text onPress={() => setReorderMode(false)} style={styles.reorderDone}>
            Done
          </Text>
        </View>
      ) : null}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {routines.length === 0 ? (
          <FirstRoutineCard onGetStarted={() => router.push('/(tabs)/routines/guided')} />
        ) : total === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nothing scheduled</Text>
            <Text style={styles.emptyBody}>
              No active steps are set for {selectedTimeOfDay}. Check another time of day or
              add steps to your routines.
            </Text>
          </View>
        ) : (
          <>
            {!reorderMode && total > 1 ? (
              <Pressable onPress={() => setReorderMode(true)} style={styles.reorderLinkWrap}>
                <Text style={styles.reorderLink}>Reorder steps</Text>
              </Pressable>
            ) : null}
            {steps.map(({ step, routine }, index) => {
              const schedule = step.schedule ?? routine.schedule;
              const phaseKeys =
                schedule.frequency === 'cycle' ? schedule.phases : undefined;

              return (
                <TodayStepRow
                  key={step.id}
                  step={step}
                  routineName={routine.name}
                  phaseKeys={phaseKeys}
                  reorderMode={reorderMode}
                  index={index}
                  total={steps.length}
                  onToggle={() => toggleStepDone(routine.id, step.id)}
                  onLongPress={() => setReorderMode(true)}
                  onMoveUp={() => moveStep(index, index - 1)}
                  onMoveDown={() => moveStep(index, index + 1)}
                />
              );
            })}
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
  content: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 24,
  },
  reorderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.light,
    borderBottomWidth: 1,
    borderBottomColor: '#c8d9e6',
  },
  reorderBannerText: {
    flex: 1,
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.blue,
  },
  reorderDone: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: 10,
    color: colors.navy,
    fontWeight: '600',
  },
  reorderLinkWrap: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  reorderLink: {
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.blue,
    textDecorationLine: 'underline',
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
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
});
