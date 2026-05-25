import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CycleSyncCard } from '@/components/cycle/CycleSyncCard';
import { FirstRoutineCard } from '@/components/onboarding/FirstRoutineCard';
import { RoutineCard } from '@/components/routines/RoutineCard';
import { Divider } from '@/components/ui/Divider';
import { FullWidthButton } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { formatTimeOfDay, useRoutines } from '@/providers/RoutinesProvider';
import { useCycleSettings } from '@/providers/AppStore';
import type { TimeOfDay } from '@/types';

const TIME_OF_DAY_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

export default function RoutinesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { routines, toggleRoutineActive } = useRoutines();
  const { cycleSettings, setCycleEnabled } = useCycleSettings();

  const activeCount = routines.filter((routine) => routine.active).length;
  const openGuided = () => router.push('/(tabs)/routines/guided');
  const openCycleSettings = () => router.push('/(tabs)/routines/cycle-settings');

  const handleCycleToggle = (enabled: boolean) => {
    setCycleEnabled(enabled);
    if (enabled) {
      openCycleSettings();
    }
  };

  const cycleSection = (
    <>
      <Divider label="Cycle & Hormonal Health" />
      <CycleSyncCard
        enabled={cycleSettings.enabled}
        onToggle={handleCycleToggle}
        onPress={openCycleSettings}
      />
    </>
  );

  if (routines.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: 18 + insets.top }]}>
          <Text style={styles.title}>My Routines</Text>
          <Text style={styles.subtitle}>0 active of 0 total</Text>
        </View>
        <View style={styles.emptyContent}>
          <FirstRoutineCard onGetStarted={openGuided} />
          <View style={styles.cycleSection}>{cycleSection}</View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: 18 + insets.top }]}>
        <Text style={styles.title}>My Routines</Text>
        <Text style={styles.subtitle}>
          {activeCount} active of {routines.length} total
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {TIME_OF_DAY_ORDER.map((timeOfDay) => {
          const grouped = routines.filter((routine) => routine.timeOfDay === timeOfDay);
          if (grouped.length === 0) return null;

          return (
            <View key={timeOfDay}>
              <Divider label={formatTimeOfDay(timeOfDay)} />
              {grouped.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onPress={() => router.push(`/(tabs)/routines/${routine.id}`)}
                  onToggleActive={() => toggleRoutineActive(routine.id)}
                />
              ))}
            </View>
          );
        })}

        <View style={styles.createButton}>
          <FullWidthButton label="+ Create New Routine" onPress={openGuided} />
        </View>

        <View style={styles.cycleSection}>{cycleSection}</View>
      </ScrollView>
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
  emptyContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 24,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  createButton: {
    marginTop: 4,
    marginBottom: 8,
  },
  cycleSection: {
    marginTop: 4,
  },
});
