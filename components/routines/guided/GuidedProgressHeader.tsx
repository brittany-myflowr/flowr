import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import {
  guidedFlowSizes,
  guidedFlowTypography,
} from '@/constants/tabPageTypography';
import { fonts } from '@/constants/typography';
import { s } from '@/lib/scale';

const STEP_TITLES = [
  'Name your routine',
  'When do you do this?',
  'Add your steps',
  'Looks good!',
] as const;

type GuidedProgressHeaderProps = {
  step: number;
  onBack?: () => void;
  onCancel?: () => void;
};

export function GuidedProgressHeader({ step, onBack, onCancel }: GuidedProgressHeaderProps) {
  const backLabel = step <= 1 ? 'Cancel' : '← Back';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable
          onPress={step <= 1 ? onCancel : onBack}
          disabled={step <= 1 ? !onCancel : !onBack}
        >
          <Text style={styles.back}>{backLabel}</Text>
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
    paddingTop: guidedFlowSizes.headerPaddingTop,
    paddingHorizontal: guidedFlowSizes.headerPaddingHorizontal,
    paddingBottom: guidedFlowSizes.headerPaddingBottom,
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
    width: s(56),
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.back,
    color: colors.blue,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(5),
  },
  progressBar: {
    height: guidedFlowSizes.progressBarHeight,
    width: guidedFlowSizes.progressBarWidth,
    borderRadius: s(2),
    backgroundColor: colors.border,
  },
  progressComplete: {
    backgroundColor: colors.navy,
  },
  progressCurrent: {
    width: guidedFlowSizes.progressBarCurrentWidth,
    backgroundColor: colors.blue,
  },
  stepCount: {
    width: s(56),
    fontFamily: fonts.dmSans,
    fontSize: guidedFlowTypography.stepCount,
    color: colors.muted,
    textAlign: 'right',
  },
  title: {
    fontFamily: fonts.lora,
    fontSize: guidedFlowTypography.title,
    color: colors.navy,
    lineHeight: guidedFlowTypography.titleLineHeight,
  },
});
