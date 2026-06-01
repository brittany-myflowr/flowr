import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { ScheduleDefaultRow } from '@/components/routines/ScheduleDefaultRow';
import {
  StepProductChipButton,
  TagProductButton,
} from '@/components/steps/StepProductChip';
import { FullWidthButton } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { formatSchedulePreview } from '@/constants/schedules';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useProducts } from '@/providers/AppStore';
import { useRoutines } from '@/providers/RoutinesProvider';
import { useToast } from '@/providers/ToastProvider';
import type { Schedule } from '@/types';
import { fs, s } from '@/lib/scale';

export default function AddStepScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { routineId: initialRoutineId } = useLocalSearchParams<{ routineId?: string }>();
  const {
    routines,
    addStep,
    consumePendingAddStepSchedule,
    setPendingAddStepSchedule,
    consumePendingAddStepProduct,
    setPendingAddStepProduct,
  } = useRoutines();
  const { products } = useProducts();
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
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const selectedRoutine = routines[selectedRoutineIndex];
  const selectedProduct = selectedProductId
    ? products.find((product) => product.id === selectedProductId)
    : undefined;

  useFocusEffect(
    useCallback(() => {
      const pendingSchedule = consumePendingAddStepSchedule();
      if (pendingSchedule) {
        setCustomSchedule(pendingSchedule);
      }

      const pendingProductId = consumePendingAddStepProduct();
      if (pendingProductId !== null) {
        setSelectedProductId(pendingProductId);
      }
    }, [consumePendingAddStepSchedule, consumePendingAddStepProduct]),
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

  const openTagProduct = () => {
    if (!selectedRoutine) return;
    router.push({
      pathname: '/(tabs)/routines/tag-product',
      params: {
        draft: '1',
        routineId: selectedRoutine.id,
        stepName: stepName.trim(),
        selectedProductId: selectedProductId ?? '',
      },
    });
  };

  useEffect(() => {
    if (routines.length === 0) return;
    setSelectedRoutineIndex((current) => Math.min(current, routines.length - 1));
  }, [routines.length]);

  useEffect(() => {
    if (selectedProductId && !products.some((product) => product.id === selectedProductId)) {
      setSelectedProductId(null);
    }
  }, [products, selectedProductId]);

  const handleSubmit = () => {
    if (!selectedRoutine || !stepName.trim()) return;

    const step = addStep(selectedRoutine.id, {
      name: stepName,
      note: note.trim() || undefined,
      schedule: customSchedule ?? undefined,
      productId: selectedProductId ?? undefined,
    });

    if (!step) return;

    setPendingAddStepSchedule(null);
    setPendingAddStepProduct(null);
    showToast('Step added');
    router.back();
  };

  if (routines.length === 0) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <SubPageHeader title="Add a Step" onBack={() => router.back()} />
        <InlineEmptyCard
          title="No routines yet"
          body="Create a routine first, then come back to add steps."
        />
        <FullWidthButton
          label="Create a Routine"
          onPress={() => router.replace('/(tabs)/routines/guided')}
        />
        <View style={styles.emptySpacer} />
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
            setSelectedProductId(null);
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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Product</Text>
          {selectedProduct ? (
            <StepProductChipButton
              label={selectedProduct.name}
              onPress={openTagProduct}
              actionLabel="Edit"
            />
          ) : (
            <TagProductButton onPress={openTagProduct} />
          )}
        </View>

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
    paddingHorizontal: s(14),
  },
  content: {
    paddingHorizontal: s(14),
    paddingTop: s(12),
    paddingBottom: s(24),
  },
  section: {
    marginBottom: s(16),
  },
  sectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: s(6),
  },
  emptySpacer: {
    height: s(8),
  },
});
