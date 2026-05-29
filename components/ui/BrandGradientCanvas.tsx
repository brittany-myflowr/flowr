import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { GradientGrainOverlay } from '@/components/today/GradientGrainOverlay';
import { TodayMeshGradientBackdrop } from '@/components/today/TodayMeshGradientBackdrop';
import { brandMeshGradient } from '@/constants/brandMeshGradient';
import { expandedBrandGradient, gradientDirection } from '@/constants/gradients';

type BrandGradientCanvasProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/** Full brand sky — expanded gradient arc with hero glow for splash and launch. */
export function BrandGradientCanvas({ style, children }: BrandGradientCanvasProps) {
  const mesh = brandMeshGradient;

  return (
    <View style={[styles.root, style]}>
      <View pointerEvents="none" style={styles.backdrop}>
        <LinearGradient
          colors={[...expandedBrandGradient.colors]}
          locations={
            expandedBrandGradient.locations ? [...expandedBrandGradient.locations] : undefined
          }
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
