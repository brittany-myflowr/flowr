import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { Daisy } from '@/components/brand/Daisy';
import { colors } from '@/constants/colors';
import { s } from '@/lib/scale';

type IconProps = {
  size?: number;
  color?: string;
};

export function SunIcon({ size = s(22), color = 'currentColor' }: IconProps) {
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

export function StarIcon({ size = s(22), color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21.02 7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CalendarIcon({ size = s(22), color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={18} rx={2} stroke={color} strokeWidth={1.5} />
      <Line x1={16} y1={2} x2={16} y2={6} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={8} y1={2} x2={8} y2={6} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={3} y1={10} x2={21} y2={10} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function FaceIcon({ size = s(22), color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.5} />
      <Path
        d="M8.5 14.5 Q12 18 15.5 14.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={9} cy={10} r={0.8} fill={color} />
      <Circle cx={15} cy={10} r={0.8} fill={color} />
    </Svg>
  );
}

export function DaisyTabIcon({ size = s(22), color = colors.muted }: IconProps) {
  return <Daisy color={color} size={size} />;
}
