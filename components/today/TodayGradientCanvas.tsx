import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { GradientGrainOverlay } from '@/components/today/GradientGrainOverlay';
import { TodayMeshGradientBackdrop } from '@/components/today/TodayMeshGradientBackdrop';
import { gradientDirection, todaySkyGradients } from '@/constants/gradients';
import { todayMeshGradients } from '@/constants/todayMeshGradients';
import type { TimeOfDay } from '@/types';

type TodayGradientCanvasProps = {
  timeOfDay: TimeOfDay;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function TodayGradientCanvas({ timeOfDay, style, children }: TodayGradientCanvasProps) {
  const mesh = todayMeshGradients[timeOfDay];
  const sky = todaySkyGradients[timeOfDay];

  return (
    <View style={[styles.root, style]}>
      <View pointerEvents="none" style={styles.backdrop}>
        <LinearGradient
          colors={[...sky.colors]}
          locations={sky.locations ? [...sky.locations] : undefined}
          start={gradientDirection.start}
          end={gradientDirection.end}
          style={styles.fill}
        />

        <TodayMeshGradientBackdrop mesh={mesh} />

        <LinearGradient
          colors={[...mesh.vignette]}
          locations={[0, 0.52, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.fill}
        />

        <GradientGrainOverlay style={styles.fill} intensity={0.4} tone="paper" />
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});
