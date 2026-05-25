import Svg, { Circle, Line, Path } from 'react-native-svg';

import { colors } from '@/constants/colors';
import { s } from '@/lib/scale';

type IconProps = {
  size?: number;
  color?: string;
};

export function DragHandleIcon({ size = s(10), color = '#d1d5db' }: IconProps) {
  const height = size * 1.4;
  const positions = [2, 7, 12];

  return (
    <Svg width={size} height={height} viewBox="0 0 10 14">
      {positions.map((y) => (
        <Circle key={`left-${y}`} cx={3} cy={y} r={1.2} fill={color} />
      ))}
      {positions.map((y) => (
        <Circle key={`right-${y}`} cx={7} cy={y} r={1.2} fill={color} />
      ))}
    </Svg>
  );
}

export function BellIcon({ size = s(13), color = colors.border }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CloseIcon({ size = s(11), color = colors.border }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={18} y1={6} x2={6} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1={6} y1={6} x2={18} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckIcon({ size = s(10), color = colors.blue }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6 9 17 4 12"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
