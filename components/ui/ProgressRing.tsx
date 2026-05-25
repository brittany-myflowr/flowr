import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { s } from '@/lib/scale';

type ProgressRingProps = {
  percent: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  labelColor?: string;
};

export function ProgressRing({
  percent,
  size = s(104),
  strokeWidth = s(5),
  trackColor = 'rgba(255,255,255,0.2)',
  progressColor = 'rgba(255,255,255,0.9)',
  labelColor = '#fff',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (circumference * clamped) / 100;
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      <Text style={[styles.label, { color: labelColor, fontSize: size * 0.21 }]}>
        {clamped}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  label: {
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
});
