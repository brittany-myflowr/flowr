import Svg, { Circle, Path } from 'react-native-svg';

type DaisyProps = {
  color?: string;
  size?: number;
  opacity?: number;
};

export function Daisy({ color = 'currentColor', size = 20, opacity = 1 }: DaisyProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity}>
      <Circle
        cx={12}
        cy={12}
        r={3}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 7.5V9" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M7.5 12H9" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M16.5 12H15" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M12 16.5V15" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="m8 8 1.88 1.88" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M14.12 9.88 16 8" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="m8 16 1.88-1.88" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M14.12 14.12 16 16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
