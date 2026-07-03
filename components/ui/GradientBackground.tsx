import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { fullGradient, gradientDirection, timeOfDayGradients } from '@/constants/gradients';
import type { TimeOfDay } from '@/types';

type GradientBackgroundProps = {
  variant?: TimeOfDay | 'full';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  /** When false, sizes to content instead of expanding to fill the parent. */
  fill?: boolean;
};

export function GradientBackground({
  variant = 'full',
  style,
  children,
  fill = true,
}: GradientBackgroundProps) {
  const stops = variant === 'full' ? fullGradient : timeOfDayGradients[variant];

  return (
    <LinearGradient
      colors={[...stops.colors]}
      locations={stops.locations ? [...stops.locations] : undefined}
      start={gradientDirection.start}
      end={gradientDirection.end}
      style={[fill && styles.fill, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
