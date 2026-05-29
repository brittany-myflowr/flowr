import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { RoutineReviewCard } from '@/components/routines/RoutineCard';
import { ScheduleEditorForm } from '@/components/schedule/ScheduleEditorForm';
import { Chip } from '@/components/ui/Chip';
import { FullWidthButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { categories, type Category } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { plannerCornerRadius } from '@/constants/plannerCardStyles';
import {
  cloneSchedule,
  defaultScheduleForTimeOfDay,
  formatSchedulePreview,
  normalizeSchedule,
} from '@/constants/schedules';
import {
  guidedFlowTypography,
  tabPageStyles,
} from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { useProducts, useRoutines } from '@/providers/RoutinesProvider';
import { useToast } from '@/providers/ToastProvider';
import type { Schedule } from '@/types';
import { s, vs } from '@/lib/scale';

export default function GuidedSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    addRoutine,
    consumePendingGuidedStepScheduleResult,
    consumePendingGuidedStepProductResult,
    setPendingGuidedStepScheduleInit,
  } = useRoutines();
  const { products } = useProducts();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Skincare');
  const [routineSchedule, setRoutineSchedule] = useState<Schedule>(() =>
    normalizeSchedule(defaultScheduleForTimeOfDay('morning')),
  );
  const [steps, setSteps] = useState<GuidedStepDraft[]>([]);

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
        entry.productId,
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

  const goNext = () => {
    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }

    addRoutine({
      name,
      category,
      schedule: routineSchedule,
      steps: validSteps.map((entry) => ({
        name: entry.name,
        note: entry.note.trim() || undefined,
        schedule: entry.schedule ?? undefined,
        productId: entry.productId ?? undefined,
      })),
    });

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
      cloneSchedule(entry.schedule ?? routineSchedule),
    );
    router.push({
      pathname: '/(tabs)/routines/schedule',
      params: {
        guided: '1',
        stepIndex: String(index),
        stepName: entry.name.trim() || `Step ${index + 1}`,
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
    };
  });

  const canContinue =
    step === 1
      ? name.trim().length > 0
      : step === 3
        ? validSteps.length > 0
        : true;

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
              Sets the default schedule for the whole routine. Individual steps can customize
              their own schedule later.
            </Text>
            <ScheduleEditorForm
              schedule={routineSchedule}
              onScheduleChange={setRoutineSchedule}
              showSaveButton={false}
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Text style={styles.helper}>
              Add each action with its name, note, schedule, and product.
            </Text>
            {steps.map((entry, index) => {
              const product = entry.productId
                ? products.find((item) => item.id === entry.productId)
                : undefined;
              const scheduleLabel = entry.schedule
                ? formatSchedulePreview(entry.schedule)
                : `${formatSchedulePreview(routineSchedule)} (routine default)`;

              return (
                <GuidedStepCard
                  key={`guided-step-${index}`}
                  index={index}
                  total={steps.length}
                  draft={entry}
                  scheduleLabel={scheduleLabel}
                  productName={product?.name}
                  onChangeName={(value) => updateStepDraft(index, { name: value })}
                  onChangeNote={(value) => updateStepDraft(index, { note: value })}
                  onCustomizeSchedule={() => openScheduleCustomizer(index)}
                  onTagProduct={() => openTagProduct(index)}
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
            scheduleLabel={formatSchedulePreview(routineSchedule)}
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
  addStepButton: {
    paddingVertical: vs(10),
    borderRadius: plannerCornerRadius,
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
