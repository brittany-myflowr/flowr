import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Daisy } from '@/components/brand/Daisy';
import { fonts } from '@/constants/typography';
import { fs, s } from '@/lib/scale';

type ProgressRingCenter = 'percent' | 'daisy';

type ProgressRingProps = {
  percent: number;
  total?: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  labelColor?: string;
  subtitleColor?: string;
  center?: ProgressRingCenter;
  footerLabel?: string;
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
  center = 'percent',
  footerLabel,
}: ProgressRingProps) {
  const strokeWidth = strokeWidthProp ?? s(6.5);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const centerPoint = size / 2;
  const innerDiscRadius = Math.max(radius - strokeWidth - s(3), radius * 0.62);
  const isEmpty = total === 0;
  const clamped = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (circumference * clamped) / 100;
  const showProgress = !isEmpty && clamped > 0;
  const showInnerDisc = center === 'percent';
  const daisySize = Math.round(size * 0.48);

  const centerContent =
    center === 'daisy' ? (
      <Daisy color={labelColor} size={daisySize} opacity={isEmpty ? 0.75 : 0.95} />
    ) : isEmpty ? (
      <>
        <Daisy color={labelColor} size={s(22)} opacity={0.9} />
        <Text style={[styles.emptyLabel, { color: subtitleColor }]}>Rest day</Text>
      </>
    ) : (
      <Text style={[styles.percentLabel, { color: labelColor, fontSize: size * 0.21 }]}>
        {clamped}%
      </Text>
    );

  const resolvedFooter =
    footerLabel ?? (center === 'percent' && isEmpty ? undefined : center === 'daisy' && isEmpty ? 'Rest day' : undefined);

  return (
    <View style={styles.wrap}>
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          <Circle
            cx={centerPoint}
            cy={centerPoint}
            r={radius + s(1.5)}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={s(1.5)}
          />

          <Circle
            cx={centerPoint}
            cy={centerPoint}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />

          {showProgress ? (
            <Circle
              cx={centerPoint}
              cy={centerPoint}
              r={radius}
              fill="none"
              stroke={progressColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation={-90}
              origin={`${centerPoint}, ${centerPoint}`}
            />
          ) : null}

          {showInnerDisc ? (
            <Circle
              cx={centerPoint}
              cy={centerPoint}
              r={innerDiscRadius}
              fill="rgba(255,255,255,0.14)"
            />
          ) : null}
        </Svg>

        <View style={styles.centerContent}>{centerContent}</View>
      </View>

      {resolvedFooter ? (
        <Text style={[styles.footerLabel, { color: subtitleColor }]}>{resolvedFooter}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: s(2),
  },
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
  footerLabel: {
    fontFamily: fonts.dmSansSemiBold,
    fontSize: fs(8),
    fontWeight: '600',
    letterSpacing: s(0.3),
  },
});
