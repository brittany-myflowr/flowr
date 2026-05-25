import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

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
    paddingTop: s(18),
    paddingHorizontal: s(14),
    paddingBottom: s(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s(10),
  },
  back: {
    width: s(52),
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    color: colors.blue,
  },
  backHidden: {
    opacity: 0,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
  },
  progressBar: {
    height: vs(3),
    width: s(12),
    borderRadius: s(2),
    backgroundColor: colors.border,
  },
  progressComplete: {
    backgroundColor: colors.navy,
  },
  progressCurrent: {
    width: s(18),
    backgroundColor: colors.blue,
  },
  stepCount: {
    width: s(52),
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    color: colors.muted,
    textAlign: 'right',
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: fs(16),
    color: colors.navy,
    lineHeight: fs(20),
  },
});
