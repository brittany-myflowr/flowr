import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Daisy } from '@/components/brand/Daisy';
import { fonts } from '@/constants/typography';
import { fs, s } from '@/lib/scale';

type ProgressRingProps = {
  percent: number;
  total?: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  labelColor?: string;
  subtitleColor?: string;
};

export function ProgressRing({
  percent,
  total,
  size = s(104),
  strokeWidth: strokeWidthProp,
  trackColor = 'rgba(255,255,255,0.2)',
  progressColor = 'rgba(255,255,255,0.95)',
  labelColor = '#fff',
  subtitleColor = 'rgba(255,255,255,0.72)',
}: ProgressRingProps) {
  const strokeWidth = strokeWidthProp ?? s(6.5);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const innerDiscRadius = Math.max(radius - strokeWidth - s(3), radius * 0.62);
  const isEmpty = total === 0;
  const clamped = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (circumference * clamped) / 100;
  const showProgress = !isEmpty && clamped > 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={center}
          cy={center}
          r={radius + s(1.5)}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={s(1.5)}
        />

        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        {showProgress ? (
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
        ) : null}

        <Circle
          cx={center}
          cy={center}
          r={innerDiscRadius}
          fill="rgba(255,255,255,0.14)"
        />
      </Svg>

      <View style={styles.centerContent}>
        {isEmpty ? (
          <>
            <Daisy color={labelColor} size={s(22)} opacity={0.9} />
            <Text style={[styles.emptyLabel, { color: subtitleColor }]}>Rest day</Text>
          </>
        ) : (
          <Text style={[styles.percentLabel, { color: labelColor, fontSize: size * 0.21 }]}>
            {clamped}%
          </Text>
        )}
      </View>
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
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentLabel: {
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  emptyLabel: {
    marginTop: s(2),
    fontFamily: fonts.dmSans,
    fontSize: fs(8),
    letterSpacing: s(1.2),
    textTransform: 'uppercase',
  },
});
