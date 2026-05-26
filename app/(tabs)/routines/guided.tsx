import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GuidedProgressHeader } from '@/components/routines/guided/GuidedProgressHeader';
import {
  createEmptyGuidedStepDraft,
  GuidedStepCard,
  type GuidedStepDraft,
} from '@/components/routines/guided/GuidedStepCard';
import { StepReminderSheet } from '@/components/routines/StepReminderSheet';
import { RoutineReviewCard } from '@/components/routines/RoutineCard';
import { Chip } from '@/components/ui/Chip';
import { FullWidthButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectableTile } from '@/components/ui/SelectableTile';
import { categories, type Category } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { cloneSchedule, defaultScheduleForTimeOfDay, formatSchedulePreview } from '@/constants/schedules';
import {
  guidedFlowTypography,
  tabPageStyles,
} from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { useProducts, useRoutines } from '@/providers/RoutinesProvider';
import { useToast } from '@/providers/ToastProvider';
import type { ScheduleFrequency, StepReminder, TimeOfDay } from '@/types';
import { s, vs } from '@/lib/scale';

const FREQUENCIES: { value: ScheduleFrequency; label: string }[] = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

const TIME_OF_DAY_OPTIONS: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildRoutineDefaultSchedule(timeOfDay: TimeOfDay, frequency: ScheduleFrequency) {
  return {
    ...defaultScheduleForTimeOfDay(timeOfDay),
    frequency,
  };
}

export default function GuidedSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    addRoutine,
    updateStepReminder,
    consumePendingGuidedStepScheduleResult,
    consumePendingGuidedStepProductResult,
    setPendingGuidedStepScheduleInit,
  } = useRoutines();
  const { products } = useProducts();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Skincare');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [frequency, setFrequency] = useState<ScheduleFrequency>('daily');
  const [steps, setSteps] = useState<GuidedStepDraft[]>([]);
  const [reminderIndex, setReminderIndex] = useState<number | null>(null);

  const routineDefaultSchedule = useMemo(
    () => buildRoutineDefaultSchedule(timeOfDay, frequency),
    [timeOfDay, frequency],
  );

  useEffect(() => {
    if (step === 3 && steps.length === 0) {
      setSteps([createEmptyGuidedStepDraft()]);
    }
  }, [step, steps.length]);

  useFocusEffect(
    useCallback(() => {
      const scheduleResult = consumePendingGuidedStepScheduleResult();
      if (scheduleResult) {
        setSteps((current) =>
          current.map((entry, index) =>
            index === scheduleResult.stepIndex
              ? { ...entry, schedule: scheduleResult.schedule }
              : entry,
          ),
        );
      }

      const productResult = consumePendingGuidedStepProductResult();
      if (productResult) {
        setSteps((current) =>
          current.map((entry, index) =>
            index === productResult.stepIndex
              ? { ...entry, productId: productResult.productId }
              : entry,
          ),
        );
      }
    }, [consumePendingGuidedStepScheduleResult, consumePendingGuidedStepProductResult]),
  );

  const validSteps = steps.filter((entry) => entry.name.trim().length > 0);
  const hasProgress =
    name.trim().length > 0 ||
    steps.some(
      (entry) =>
        entry.name.trim().length > 0 ||
        entry.note.trim().length > 0 ||
        entry.schedule ||
        entry.productId ||
        entry.reminder?.enabled,
    ) ||
    step > 1;

  const exitFlow = () => {
    router.back();
  };

  const handleExit = () => {
    if (hasProgress) {
      Alert.alert('Discard routine?', "Your progress won't be saved.", [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: exitFlow },
      ]);
      return;
    }

    exitFlow();
  };

  const goBack = () => {
    if (step > 1) {
      setStep((current) => current - 1);
      return;
    }

    handleExit();
  };

  const goNext = async () => {
    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }

    const routine = addRoutine({
      name,
      category,
      timeOfDay,
      frequency,
      steps: validSteps.map((entry) => ({
        name: entry.name,
        note: entry.note.trim() || undefined,
        schedule: entry.schedule ?? undefined,
        productId: entry.productId ?? undefined,
        reminder: entry.reminder,
      })),
    });

    for (const createdStep of routine.steps) {
      if (createdStep.reminder?.enabled) {
        const synced = await updateStepReminder(
          routine.id,
          createdStep.id,
          createdStep.reminder,
        );
        if (!synced) {
          showToast('Enable notifications in Settings');
          break;
        }
      }
    }

    showToast('Routine created');
    router.replace('/(tabs)/routines');
  };

  const updateStepDraft = (index: number, updates: Partial<GuidedStepDraft>) => {
    setSteps((current) =>
      current.map((entry, i) => (i === index ? { ...entry, ...updates } : entry)),
    );
  };

  const appendStep = () => {
    setSteps((current) => [...current, createEmptyGuidedStepDraft()]);
  };

  const removeStep = (index: number) => {
    setSteps((current) => current.filter((_, i) => i !== index));
  };

  const openScheduleCustomizer = (index: number) => {
    const entry = steps[index];
    if (!entry) return;

    setPendingGuidedStepScheduleInit(
      cloneSchedule(entry.schedule ?? routineDefaultSchedule),
    );
    router.push({
      pathname: '/(tabs)/routines/schedule',
      params: {
        guided: '1',
        stepIndex: String(index),
        stepName: entry.name.trim() || `Step ${index + 1}`,
        timeOfDay,
        frequency,
      },
    });
  };

  const openTagProduct = (index: number) => {
    const entry = steps[index];
    if (!entry) return;

    router.push({
      pathname: '/(tabs)/routines/tag-product',
      params: {
        guided: '1',
        stepIndex: String(index),
        stepName: entry.name.trim() || `Step ${index + 1}`,
        selectedProductId: entry.productId ?? '',
      },
    });
  };

  const reviewSteps = validSteps.map((entry) => {
    const product = entry.productId
      ? products.find((item) => item.id === entry.productId)
      : undefined;

    return {
      name: entry.name.trim(),
      note: entry.note.trim() || undefined,
      productName: product?.name,
      scheduleLabel: entry.schedule
        ? formatSchedulePreview(entry.schedule)
        : undefined,
      reminderEnabled: entry.reminder?.enabled,
    };
  });

  const canContinue =
    step === 1
      ? name.trim().length > 0
      : step === 3
        ? validSteps.length > 0
        : true;

  const reminderDraft = reminderIndex !== null ? steps[reminderIndex] : undefined;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top }}>
        <GuidedProgressHeader step={step} onBack={goBack} onCancel={handleExit} />
      </View>

      <ScrollView
        style={tabPageStyles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <>
            <Text style={styles.helper}>
              Give it a name that reflects when or what it is.
            </Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="e.g. Morning Skincare"
              autoCapitalize="words"
              style={styles.nameInput}
            />
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.chips}>
              {categories.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={category === item}
                  small
                  large
                  onPress={() => setCategory(item)}
                />
              ))}
            </View>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Text style={styles.helper}>
              Sets the default schedule for the whole routine.
            </Text>
            <View style={styles.tileRow}>
              {TIME_OF_DAY_OPTIONS.map((option) => (
                <SelectableTile
                  key={option}
                  label={capitalize(option)}
                  selected={timeOfDay === option}
                  large
                  onPress={() => setTimeOfDay(option)}
                />
              ))}
            </View>
            <Text style={styles.fieldLabel}>How often?</Text>
            <View style={styles.chips}>
              {FREQUENCIES.map((item) => (
                <Chip
                  key={item.value}
                  label={item.label}
                  selected={frequency === item.value}
                  small
                  large
                  onPress={() => setFrequency(item.value)}
                />
              ))}
            </View>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Text style={styles.helper}>
              Add each action with its name, note, schedule, product, and reminder.
            </Text>
            {steps.map((entry, index) => {
              const product = entry.productId
                ? products.find((item) => item.id === entry.productId)
                : undefined;
              const scheduleLabel = entry.schedule
                ? formatSchedulePreview(entry.schedule)
                : `${formatSchedulePreview(routineDefaultSchedule)} (routine default)`;

              return (
                <GuidedStepCard
                  key={`guided-step-${index}`}
                  index={index}
                  total={steps.length}
                  draft={entry}
                  scheduleLabel={scheduleLabel}
                  productName={product?.name}
                  reminderEnabled={entry.reminder?.enabled}
                  onChangeName={(value) => updateStepDraft(index, { name: value })}
                  onChangeNote={(value) => updateStepDraft(index, { note: value })}
                  onCustomizeSchedule={() => openScheduleCustomizer(index)}
                  onTagProduct={() => openTagProduct(index)}
                  onSetReminder={() => setReminderIndex(index)}
                  onRemove={() => removeStep(index)}
                />
              );
            })}
            <Pressable onPress={appendStep} style={styles.addStepButton}>
              <Text style={styles.addStepLabel}>+ Add a step</Text>
            </Pressable>
          </>
        ) : null}

        {step === 4 ? (
          <RoutineReviewCard
            name={name.trim()}
            category={category}
            frequency={frequency}
            timeOfDay={timeOfDay}
            steps={reviewSteps}
          />
        ) : null}

        <View style={styles.footer}>
          <FullWidthButton
            label={step === 4 ? 'Create Routine →' : 'Continue →'}
            onPress={goNext}
            disabled={!canContinue}
          />
        </View>
      </ScrollView>

      {reminderDraft && reminderIndex !== null ? (
        <StepReminderSheet
          visible
          stepName={reminderDraft.name.trim() || `Step ${reminderIndex + 1}`}
          routineName={name.trim() || 'New routine'}
          reminder={reminderDraft.reminder}
          timeOfDay={timeOfDay}
          onSave={(reminder: StepReminder) => {
            updateStepDraft(reminderIndex, { reminder });
            setReminderIndex(null);
          }}
          onCancel={() => setReminderIndex(null)}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: tabPageStyles.screen,
  content: {
    paddingHorizontal: s(12),
    paddingTop: s(14),
    paddingBottom: s(24),
  },
  nameInput: {
    fontSize: guidedFlowTypography.body,
  },
  helper: {
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.helper,
    color: colors.gray,
    lineHeight: guidedFlowTypography.helperLineHeight,
    marginBottom: s(12),
  },
  fieldLabel: {
    marginTop: s(12),
    marginBottom: s(8),
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.fieldLabel,
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(5),
    marginBottom: s(14),
  },
  tileRow: {
    flexDirection: 'row',
    gap: s(6),
    marginBottom: s(12),
  },
  addStepButton: {
    paddingVertical: vs(10),
    borderRadius: s(10),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#c8d9e6',
    alignItems: 'center',
    marginTop: s(6),
    marginBottom: s(12),
  },
  addStepLabel: {
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.link,
    color: colors.blue,
  },
  footer: {
    marginTop: s(12),
  },
});
