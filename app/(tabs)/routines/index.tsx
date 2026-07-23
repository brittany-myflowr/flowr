import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CycleSyncCard } from '@/components/cycle/CycleSyncCard';
import { DeleteConfirmSheet } from '@/components/feedback/DeleteConfirmSheet';
import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { FirstRoutineCard } from '@/components/onboarding/FirstRoutineCard';
import { FocusScrollView } from '@/components/layout/FocusScrollView';
import { TabPageHeader } from '@/components/layout/TabPageHeader';
import { ProductSearchBar } from '@/components/products/ProductSearchBar';
import { RoutineCard } from '@/components/routines/RoutineCard';
import { RoutineOptionsSheet } from '@/components/routines/RoutineOptionsSheet';
import { Divider } from '@/components/ui/Divider';
import { FullWidthButton } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { tabPageStyles } from '@/constants/tabPageTypography';
import {
  filterRoutines,
  getRoutineCategoryFilters,
  groupRoutinesByTimeOfDay,
  hasActiveRoutineFilters,
  isRoutineCategoryFilter,
  type RoutineCategoryFilter,
} from '@/lib/filterRoutines';
import { useRoutines } from '@/providers/RoutinesProvider';
import { useCycleSettings } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';
import type { Routine } from '@/types';
import { s } from '@/lib/scale';

const categoryFilters = getRoutineCategoryFilters();
const scrollableCategoryFilters = categoryFilters.filter((category) => category !== 'All');

export default function RoutinesScreen() {
  const router = useRouter();
  const { routines, toggleRoutineActive, duplicateRoutine, removeRoutine } = useRoutines();
  const { cycleSettings, setCycleEnabled } = useCycleSettings();
  const { showToast } = useToast();

  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<RoutineCategoryFilter>('All');

  const activeCount = routines.filter((routine) => routine.active).length;
  const openGuided = () => router.push('/(tabs)/routines/guided');
  const openCycleSettings = () => router.push('/(tabs)/routines/cycle-settings');

  const filteredRoutines = useMemo(
    () => filterRoutines(routines, query, categoryFilter),
    [routines, query, categoryFilter],
  );

  const hasActiveFilters = hasActiveRoutineFilters({ query, categoryFilter });
  const shouldGroupByTimeOfDay = !hasActiveFilters;

  const groupedRoutines = useMemo(() => {
    if (!shouldGroupByTimeOfDay) return null;
    return groupRoutinesByTimeOfDay(filteredRoutines);
  }, [filteredRoutines, shouldGroupByTimeOfDay]);

  const subtitle = useMemo(() => {
    if (routines.length === 0) return '0 active of 0 total';

    if (hasActiveFilters) {
      return `${filteredRoutines.length} of ${routines.length} routine${routines.length === 1 ? '' : 's'}`;
    }

    return `${activeCount} active of ${routines.length} total`;
  }, [activeCount, filteredRoutines.length, hasActiveFilters, routines.length]);

  const handleCycleToggle = (enabled: boolean) => {
    setCycleEnabled(enabled);
    if (enabled) {
      openCycleSettings();
    }
  };

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

  const clearFilters = () => {
    setQuery('');
    setCategoryFilter('All');
  };

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

  const renderRoutineCard = (routine: Routine) => (
    <RoutineCard
      key={routine.id}
      routine={routine}
      onPress={() => router.push(`/(tabs)/routines/${routine.id}`)}
      onLongPress={() => setSelectedRoutine(routine)}
      onToggleActive={() => toggleRoutineActive(routine.id)}
    />
  );

  const renderRoutineList = () => {
    if (shouldGroupByTimeOfDay && groupedRoutines) {
      return groupedRoutines.map((group) => (
        <View key={group.timeOfDay}>
          <Divider label={group.label} large outlined />
          {group.routines.map((routine) => renderRoutineCard(routine))}
        </View>
      ));
    }

    return filteredRoutines.map((routine) => renderRoutineCard(routine));
  };

  const filteredActiveCount = filteredRoutines.filter((routine) => routine.active).length;

  return (
    <View style={tabPageStyles.screen}>
      <TabPageHeader
        title="My Routines"
        subtitle={subtitle}
        actionLabel="+ Add"
        onActionPress={routines.length > 0 ? openGuided : undefined}
      />

      {routines.length > 0 ? (
        <>
          <ProductSearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search routines"
          />
          <View style={styles.filtersRow}>
            <Chip
              label="All"
              selected={categoryFilter === 'All'}
              form
              onPress={() => setCategoryFilter('All')}
            />
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {scrollableCategoryFilters.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  selected={categoryFilter === category}
                  form
                  onPress={() => {
                    if (isRoutineCategoryFilter(category)) setCategoryFilter(category);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </>
      ) : null}

      <FocusScrollView
        style={tabPageStyles.scroll}
        contentContainerStyle={[
          tabPageStyles.content,
          routines.length === 0 && styles.emptyContent,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cycleSection}>{cycleSection}</View>

        {routines.length === 0 ? (
          <FirstRoutineCard onGetStarted={openGuided} />
        ) : filteredRoutines.length === 0 ? (
          <InlineEmptyCard
            title="No matches found"
            body="Try a different search term or filter."
          >
            {hasActiveFilters ? (
              <View style={styles.emptyButton}>
                <FullWidthButton label="Clear filters" onPress={clearFilters} />
              </View>
            ) : null}
          </InlineEmptyCard>
        ) : (
          <>
            {filteredActiveCount === 0 ? (
              <InlineEmptyCard
                title="No active routines"
                body="Turn a routine on to see it on Today and your calendar."
              />
            ) : null}

            {renderRoutineList()}

            <View style={styles.createButton}>
              <FullWidthButton label="+ Add a Routine" onPress={openGuided} />
            </View>
          </>
        )}
      </FocusScrollView>

      <RoutineOptionsSheet
        visible={selectedRoutine !== null}
        routineName={selectedRoutine?.name ?? ''}
        onEdit={() => {
          if (!selectedRoutine) return;
          router.push({
            pathname: '/(tabs)/routines/edit',
            params: { routineId: selectedRoutine.id },
          });
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
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: s(10),
    paddingBottom: s(6),
    gap: s(6),
  },
  categoryScroll: {
    flex: 1,
  },
  categoryScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    paddingRight: s(10),
  },
  emptyButton: {
    marginTop: s(14),
  },
  createButton: {
    marginTop: s(4),
    marginBottom: s(8),
  },
  cycleSection: {
    marginBottom: s(10),
  },
});
