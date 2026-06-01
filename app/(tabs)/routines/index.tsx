import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CycleSyncCard } from '@/components/cycle/CycleSyncCard';
import { DeleteConfirmSheet } from '@/components/feedback/DeleteConfirmSheet';
import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { FirstRoutineCard } from '@/components/onboarding/FirstRoutineCard';
import { TabPageHeader } from '@/components/layout/TabPageHeader';
import { RoutineCard } from '@/components/routines/RoutineCard';
import { RoutineOptionsSheet } from '@/components/routines/RoutineOptionsSheet';
import { Divider } from '@/components/ui/Divider';
import { FullWidthButton } from '@/components/ui/Button';
import { tabPageStyles } from '@/constants/tabPageTypography';
import { formatTimeOfDay, useRoutines } from '@/providers/RoutinesProvider';
import { useCycleSettings } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';
import type { Routine } from '@/types';
import type { TimeOfDay } from '@/types';
import { s } from '@/lib/scale';

const TIME_OF_DAY_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

export default function RoutinesScreen() {
  const router = useRouter();
  const { routines, toggleRoutineActive, duplicateRoutine, removeRoutine } = useRoutines();
  const { cycleSettings, setCycleEnabled } = useCycleSettings();
  const { showToast } = useToast();

  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);

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

  const closeOptions = () => setSelectedRoutine(null);

  const handleDuplicate = (routineId: string) => {
    const duplicated = duplicateRoutine(routineId);
    if (!duplicated) return;

    closeOptions();
    showToast('Routine duplicated');
    router.push({
      pathname: '/(tabs)/routines/[id]',
      params: { id: duplicated.id, promptRename: '1' },
    });
  };

  const routinePendingDelete = deleteRoutineId
    ? routines.find((routine) => routine.id === deleteRoutineId)
    : undefined;

  const confirmDeleteRoutine = () => {
    if (!deleteRoutineId) return;

    removeRoutine(deleteRoutineId);
    showToast('Routine removed', 'destructive');
    setDeleteRoutineId(null);
  };

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
            {activeCount === 0 ? (
              <InlineEmptyCard
                title="No active routines"
                body="Turn a routine on to see it on Today and your calendar."
              />
            ) : null}

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
                      onLongPress={() => setSelectedRoutine(routine)}
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

      <RoutineOptionsSheet
        visible={selectedRoutine !== null}
        routineName={selectedRoutine?.name ?? ''}
        onEdit={() => {
          if (!selectedRoutine) return;
          router.push(`/(tabs)/routines/${selectedRoutine.id}`);
          closeOptions();
        }}
        onDuplicate={() => {
          if (!selectedRoutine) return;
          handleDuplicate(selectedRoutine.id);
        }}
        onDelete={() => {
          if (!selectedRoutine) return;
          setDeleteRoutineId(selectedRoutine.id);
          closeOptions();
        }}
        onCancel={closeOptions}
      />

      <DeleteConfirmSheet
        visible={deleteRoutineId !== null}
        title="Remove routine?"
        message={
          routinePendingDelete
            ? `${routinePendingDelete.name} and all of its steps will be permanently deleted.`
            : 'This routine will be permanently deleted.'
        }
        onConfirm={confirmDeleteRoutine}
        onCancel={() => setDeleteRoutineId(null)}
      />
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
