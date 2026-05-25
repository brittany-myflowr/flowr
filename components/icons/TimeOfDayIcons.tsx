import Svg, { Circle, Line, Path } from 'react-native-svg';

import { colors } from '@/constants/colors';

type IconProps = {
  size?: number;
  color?: string;
};

export function MorningIcon({ size = 14, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={4} stroke={color} strokeWidth={1.5} />
      <Line x1={12} y1={2} x2={12} y2={4} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={12} y1={20} x2={12} y2={22} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={2} y1={12} x2={4} y2={12} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={20} y1={12} x2={22} y2={12} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={4.93} y1={4.93} x2={6.34} y2={6.34} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={17.66} y1={17.66} x2={19.07} y2={19.07} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={4.93} y1={19.07} x2={6.34} y2={17.66} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={17.66} y1={6.34} x2={19.07} y2={4.93} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function AfternoonIcon({ size = 14, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12 A7 7 0 0 1 19 12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={12} y1={2} x2={12} y2={4} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={4.22} y1={5.22} x2={5.64} y2={6.64} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={19.78} y1={5.22} x2={18.36} y2={6.64} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={2} y1={10} x2={4} y2={10} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={20} y1={10} x2={22} y2={10} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={2} y1={12} x2={22} y2={12} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={2} y1={15} x2={22} y2={15} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function EveningIcon({ size = 14, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function getTimeOfDayIcon(timeOfDay: 'morning' | 'afternoon' | 'evening', color?: string) {
  const stroke = color ?? colors.muted;
  switch (timeOfDay) {
    case 'morning':
      return <MorningIcon color={stroke} />;
    case 'afternoon':
      return <AfternoonIcon color={stroke} />;
    case 'evening':
      return <EveningIcon color={stroke} />;
  }
}
