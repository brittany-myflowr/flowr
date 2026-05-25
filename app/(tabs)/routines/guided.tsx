import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GuidedProgressHeader } from '@/components/routines/guided/GuidedProgressHeader';
import { RoutineReviewCard } from '@/components/routines/RoutineCard';
import { Chip } from '@/components/ui/Chip';
import { FullWidthButton } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SelectableTile } from '@/components/ui/SelectableTile';
import { categories, type Category } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useRoutines } from '@/providers/RoutinesProvider';
import { useToast } from '@/providers/ToastProvider';
import type { ScheduleFrequency, TimeOfDay } from '@/types';
import { s, vs, fs } from '@/lib/scale';

const FREQUENCIES: { value: ScheduleFrequency; label: string }[] = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

const TIME_OF_DAY_OPTIONS: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function GuidedSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addRoutine } = useRoutines();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Skincare');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [frequency, setFrequency] = useState<ScheduleFrequency>('daily');
  const [steps, setSteps] = useState<string[]>([]);

  const goBack = () => {
    if (step > 1) {
      setStep((current) => current - 1);
      return;
    }
    router.back();
  };

  const goNext = () => {
    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }

    addRoutine({
      name,
      category,
      timeOfDay,
      frequency,
      stepNames: steps,
    });
    showToast('Routine created');
    router.replace('/(tabs)/routines');
  };

  const updateStepName = (index: number, value: string) => {
    setSteps((current) => current.map((stepName, i) => (i === index ? value : stepName)));
  };

  const addStep = () => {
    setSteps((current) => [...current, '']);
  };

  const trimmedSteps = steps.map((stepName) => stepName.trim()).filter(Boolean);
  const canContinue =
    step === 1
      ? name.trim().length > 0
      : step === 3
        ? trimmedSteps.length > 0
        : true;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top }}>
        <GuidedProgressHeader step={step} onBack={goBack} />
      </View>

      <ScrollView
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
            />
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.chips}>
              {categories.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={category === item}
                  small
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
                  onPress={() => setFrequency(item.value)}
                />
              ))}
            </View>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Text style={styles.helper}>Add each action as a step.</Text>
            {steps.map((stepName, index) => (
              <View key={`step-${index}`} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <TextInput
                  value={stepName}
                  onChangeText={(value) => updateStepName(index, value)}
                  placeholder="Step name"
                  placeholderTextColor={colors.muted}
                  style={styles.stepInput}
                />
              </View>
            ))}
            <Pressable onPress={addStep} style={styles.addStepButton}>
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
            steps={trimmedSteps}
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
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: s(12),
    paddingTop: s(12),
    paddingBottom: s(24),
  },
  helper: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.gray,
    lineHeight: fs(15),
    marginBottom: s(10),
  },
  fieldLabel: {
    marginTop: s(10),
    marginBottom: s(6),
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(2),
    textTransform: 'uppercase',
    color: colors.muted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(4),
    marginBottom: s(12),
  },
  tileRow: {
    flexDirection: 'row',
    gap: s(5),
    marginBottom: s(10),
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    backgroundColor: colors.white,
    borderRadius: s(8),
    paddingHorizontal: s(10),
    paddingVertical: vs(8),
    marginBottom: s(5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepNumber: {
    width: s(18),
    height: vs(18),
    borderRadius: s(9),
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(8),
    color: colors.blue,
    fontWeight: '600',
  },
  stepInput: {
    flex: 1,
    fontFamily: fonts.lora,
    fontSize: fs(12),
    color: colors.navy,
    padding: s(0),
  },
  addStepButton: {
    paddingVertical: vs(8),
    borderRadius: s(8),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#c8d9e6',
    alignItems: 'center',
    marginTop: s(4),
    marginBottom: s(10),
  },
  addStepLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.blue,
  },
  footer: {
    marginTop: s(10),
  },
});
