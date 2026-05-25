import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { ScheduleDefaultRow } from '@/components/routines/ScheduleDefaultRow';
import { FullWidthButton } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { formatSchedulePreview } from '@/constants/schedules';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useRoutines } from '@/providers/RoutinesProvider';
import { useToast } from '@/providers/ToastProvider';
import type { Schedule } from '@/types';

export default function AddStepScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { routineId: initialRoutineId } = useLocalSearchParams<{ routineId?: string }>();
  const {
    routines,
    addStep,
    consumePendingAddStepSchedule,
    setPendingAddStepSchedule,
  } = useRoutines();
  const { showToast } = useToast();

  const initialIndex = useMemo(() => {
    if (!initialRoutineId) return 0;
    const index = routines.findIndex((routine) => routine.id === initialRoutineId);
    return index >= 0 ? index : 0;
  }, [initialRoutineId, routines]);

  const [selectedRoutineIndex, setSelectedRoutineIndex] = useState(initialIndex);
  const [stepName, setStepName] = useState('');
  const [note, setNote] = useState('');
  const [customSchedule, setCustomSchedule] = useState<Schedule | null>(null);

  const selectedRoutine = routines[selectedRoutineIndex];

  useFocusEffect(
    useCallback(() => {
      const pending = consumePendingAddStepSchedule();
      if (pending) {
        setCustomSchedule(pending);
      }
    }, [consumePendingAddStepSchedule]),
  );

  const scheduleLabel = selectedRoutine
    ? `${formatSchedulePreview(customSchedule ?? selectedRoutine.schedule)}${
        customSchedule ? '' : ' (routine default)'
      }`
    : '';

  const openScheduleCustomizer = () => {
    if (!selectedRoutine) return;
    router.push({
      pathname: '/(tabs)/routines/schedule',
      params: { routineId: selectedRoutine.id, draft: '1' },
    });
  };

  const handleSubmit = () => {
    if (!selectedRoutine || !stepName.trim()) return;

    addStep(selectedRoutine.id, {
      name: stepName,
      note: note.trim() || undefined,
      schedule: customSchedule ?? undefined,
    });
    setPendingAddStepSchedule(null);
    showToast('Step added');
    router.back();
  };

  if (routines.length === 0) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <SubPageHeader title="Add a Step" onBack={() => router.back()} />
        <Text style={styles.emptyText}>Create a routine first, then add steps to it.</Text>
        <FullWidthButton label="← Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SubPageHeader title="Add a Step" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormField
          label="Routine"
          chips={routines.map((routine) => routine.name)}
          selectedChipIndex={selectedRoutineIndex}
          onChipPress={(index) => {
            setSelectedRoutineIndex(index);
            setCustomSchedule(null);
          }}
        />

        <FormField
          label="Step Name"
          placeholder="e.g. Vitamin C Serum"
          value={stepName}
          onChangeText={setStepName}
          autoCapitalize="words"
        />

        <FormField
          label="Note (optional)"
          placeholder="e.g. 3 drops"
          value={note}
          onChangeText={setNote}
          autoCapitalize="sentences"
        />

        <ScheduleDefaultRow label={scheduleLabel} onCustomize={openScheduleCustomizer} />

        <FullWidthButton
          label="Add Step"
          onPress={handleSubmit}
          disabled={!stepName.trim()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    paddingHorizontal: 14,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
  },
  emptyText: {
    fontFamily: fonts.dmSans,
    fontSize: 12,
    color: colors.gray,
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 14,
  },
});
