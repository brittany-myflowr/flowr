import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

type GradientGrainOverlayProps = {
  style?: StyleProp<ViewStyle>;
  /** 0–1 multiplier on pattern opacity. Full-screen canvases use a lighter touch. */
  intensity?: number;
  tone?: 'light' | 'paper';
};

/** Subtle film grain for gradient canvases — pointerEvents none. */
export function GradientGrainOverlay({
  style,
  intensity = 0.38,
  tone = 'light',
}: GradientGrainOverlayProps) {
  const lightDots =
    tone === 'paper'
      ? [
          { cx: 1.2, cy: 0.8, r: 0.45, fill: 'rgba(0,0,0,0.045)' },
          { cx: 3.6, cy: 2.4, r: 0.35, fill: 'rgba(0,0,0,0.035)' },
          { cx: 2.1, cy: 4.1, r: 0.4, fill: 'rgba(255,255,255,0.08)' },
        ]
      : [
          { cx: 1.2, cy: 0.8, r: 0.45, fill: 'rgba(255,255,255,0.07)' },
          { cx: 3.6, cy: 2.4, r: 0.35, fill: 'rgba(255,255,255,0.05)' },
          { cx: 2.1, cy: 4.1, r: 0.4, fill: 'rgba(255,255,255,0.06)' },
        ];

  return (
    <View pointerEvents="none" style={[styles.wrap, style]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <Pattern id="gradientGrain" width={5} height={5} patternUnits="userSpaceOnUse">
            {lightDots.map((dot, index) => (
              <Circle
                key={`grain-dot-${index}`}
                cx={dot.cx}
                cy={dot.cy}
                r={dot.r}
                fill={dot.fill}
              />
            ))}
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#gradientGrain)" opacity={intensity} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
