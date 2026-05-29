import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CycleSyncCard } from '@/components/cycle/CycleSyncCard';
import { FirstRoutineCard } from '@/components/onboarding/FirstRoutineCard';
import { TabPageHeader } from '@/components/layout/TabPageHeader';
import { RoutineCard } from '@/components/routines/RoutineCard';
import { Divider } from '@/components/ui/Divider';
import { FullWidthButton } from '@/components/ui/Button';
import { tabPageStyles } from '@/constants/tabPageTypography';
import { formatTimeOfDay, useRoutines } from '@/providers/RoutinesProvider';
import { useCycleSettings } from '@/providers/AppStore';
import type { TimeOfDay } from '@/types';
import { s } from '@/lib/scale';

const TIME_OF_DAY_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

export default function RoutinesScreen() {
  const router = useRouter();
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

  const subtitle =
    routines.length === 0
      ? '0 active of 0 total'
      : `${activeCount} active of ${routines.length} total`;

  const cycleSection = (
    <>
      <Divider label="Cycle & Hormonal Health" large outlined />
      <CycleSyncCard
        enabled={cycleSettings.enabled}
        onToggle={handleCycleToggle}
        onPress={openCycleSettings}
      />
    </>
  );

  return (
    <View style={tabPageStyles.screen}>
      <TabPageHeader title="My Routines" subtitle={subtitle} />

      <ScrollView
        style={tabPageStyles.scroll}
        contentContainerStyle={[
          tabPageStyles.content,
          routines.length === 0 && styles.emptyContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cycleSection}>{cycleSection}</View>

        {routines.length === 0 ? (
          <FirstRoutineCard onGetStarted={openGuided} />
        ) : (
          <>
            {TIME_OF_DAY_ORDER.map((timeOfDay) => {
              const grouped = routines.filter((routine) => routine.timeOfDay === timeOfDay);
              if (grouped.length === 0) return null;

              return (
                <View key={timeOfDay}>
                  <Divider label={formatTimeOfDay(timeOfDay)} large outlined />
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
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContent: {
    paddingTop: s(8),
  },
  createButton: {
    marginTop: s(4),
    marginBottom: s(8),
  },
  cycleSection: {
    marginBottom: s(10),
  },
});
