import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

const STEP_TITLES = [
  'Name your routine',
  'When do you do this?',
  'Add your steps',
  'Looks good!',
] as const;

type GuidedProgressHeaderProps = {
  step: number;
  onBack?: () => void;
};

export function GuidedProgressHeader({ step, onBack }: GuidedProgressHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack} disabled={step <= 1 || !onBack}>
          <Text style={[styles.back, step <= 1 && styles.backHidden]}>← Back</Text>
        </Pressable>
        <View style={styles.progress}>
          {[1, 2, 3, 4].map((index) => (
            <View
              key={index}
              style={[
                styles.progressBar,
                index < step && styles.progressComplete,
                index === step && styles.progressCurrent,
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepCount}>Step {step}/4</Text>
      </View>
      <Text style={styles.title}>{STEP_TITLES[step - 1]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 18,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  back: {
    width: 52,
    fontFamily: fonts.dmSans,
    fontSize: 10,
    color: colors.blue,
  },
  backHidden: {
    opacity: 0,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressBar: {
    height: 3,
    width: 12,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressComplete: {
    backgroundColor: colors.navy,
  },
  progressCurrent: {
    width: 18,
    backgroundColor: colors.blue,
  },
  stepCount: {
    width: 52,
    fontFamily: fonts.dmSans,
    fontSize: 9,
    color: colors.muted,
    textAlign: 'right',
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: 16,
    color: colors.navy,
    lineHeight: 20,
  },
});
