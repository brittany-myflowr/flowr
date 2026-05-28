import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Rect, Circle } from 'react-native-svg';

type HeaderGrainOverlayProps = {
  style?: StyleProp<ViewStyle>;
};

/** Subtle film grain over gradient headers — pointerEvents none. */
export function HeaderGrainOverlay({ style }: HeaderGrainOverlayProps) {
  return (
    <View pointerEvents="none" style={[styles.wrap, style]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <Pattern id="headerGrain" width={5} height={5} patternUnits="userSpaceOnUse">
            <Circle cx={1.2} cy={0.8} r={0.45} fill="rgba(255,255,255,0.07)" />
            <Circle cx={3.6} cy={2.4} r={0.35} fill="rgba(255,255,255,0.05)" />
            <Circle cx={2.1} cy={4.1} r={0.4} fill="rgba(255,255,255,0.06)" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#headerGrain)" opacity={0.55} />
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
