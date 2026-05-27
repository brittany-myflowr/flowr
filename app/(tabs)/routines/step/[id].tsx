import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeleteConfirmSheet } from '@/components/feedback/DeleteConfirmSheet';
import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { CheckIcon } from '@/components/icons/ActionIcons';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { ScheduleDefaultRow } from '@/components/routines/ScheduleDefaultRow';
import { FullWidthButton } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { formatSchedulePreview } from '@/constants/schedules';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useRoutine, useRoutines } from '@/providers/RoutinesProvider';
import { useToast } from '@/providers/ToastProvider';
import { s, vs, fs } from '@/lib/scale';

export default function StepDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id: stepId, routineId } = useLocalSearchParams<{ id: string; routineId: string }>();
  const routine = useRoutine(routineId ?? '');
  const { updateStep, removeStep } = useRoutines();
  const { showToast } = useToast();

  const step = routine?.steps.find((item) => item.id === stepId);

  const [stepName, setStepName] = useState('');
  const [note, setNote] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!step) return;
      setStepName(step.name);
      setNote(step.note ?? '');
    }, [step]),
  );

  const scheduleLabel = useMemo(() => {
    if (!routine) return '';
    const schedule = step?.schedule ?? routine.schedule;
    return `${formatSchedulePreview(schedule)}${step?.schedule ? '' : ' (routine default)'}`;
  }, [routine, step?.schedule]);

  const canSave = stepName.trim().length > 0;

  if (!routine || !step) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <SubPageHeader title="Step" onBack={() => router.back()} />
        <InlineEmptyCard
          title="Step not found"
          body="It may have been removed or this link is out of date."
        />
        <View style={styles.footerSpacer} />
        <FullWidthButton label="← Back" onPress={() => router.back()} />
      </View>
    );
  }

  const openScheduleEditor = () => {
    router.push({
      pathname: '/(tabs)/routines/schedule',
      params: { routineId: routine.id, stepId: step.id },
    });
  };

  const openTagProduct = () => {
    router.push({
      pathname: '/(tabs)/routines/tag-product',
      params: { routineId: routine.id, stepId: step.id },
    });
  };

  const handleSave = () => {
    if (!canSave) return;

    updateStep(routine.id, step.id, {
      name: stepName.trim(),
      note: note.trim() || undefined,
    });
    showToast('Step saved');
    router.back();
  };

  const handleDelete = () => {
    removeStep(routine.id, step.id);
    setShowDelete(false);
    showToast('Step removed', 'destructive');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SubPageHeader title="Edit Step" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.contextLabel}>{routine.name}</Text>

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

        <ScheduleDefaultRow label={scheduleLabel} onCustomize={openScheduleEditor} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Product</Text>
          {step.productName ? (
            <Pressable onPress={openTagProduct} style={styles.productChip}>
              <CheckIcon size={s(10)} color={colors.blue} />
              <Text style={styles.productChipText}>{step.productName}</Text>
              <Text style={styles.productChipAction}>Edit</Text>
            </Pressable>
          ) : (
            <Pressable onPress={openTagProduct} style={styles.tagProductChip}>
              <Text style={styles.tagProductText}>+ Tag a product</Text>
            </Pressable>
          )}
        </View>

        <FullWidthButton label="Save Changes" onPress={handleSave} disabled={!canSave} />

        <View style={styles.footerSpacer} />

        <FullWidthButton
          label="Remove Step"
          variant="danger"
          onPress={() => setShowDelete(true)}
        />
      </ScrollView>

      <DeleteConfirmSheet
        visible={showDelete}
        title="Remove step?"
        message={`${step.name} will be permanently deleted from ${routine.name}.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
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
  contextLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.blue,
    marginBottom: s(12),
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
  productChip: {
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: '#c8d9e6',
    borderRadius: s(7),
    paddingHorizontal: s(10),
    paddingVertical: vs(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  productChipText: {
    flex: 1,
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.navy,
  },
  productChipAction: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.blue,
    textDecorationLine: 'underline',
  },
  tagProductChip: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#c8d9e6',
    borderRadius: s(7),
    paddingHorizontal: s(10),
    paddingVertical: vs(8),
    alignItems: 'center',
  },
  tagProductText: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    color: colors.blue,
  },
  footerSpacer: {
    height: vs(12),
  },
});
