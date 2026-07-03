import { useId } from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/colors';
import { s } from '@/lib/scale';
import type { Verdict } from '@/types';

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

// Lucide heart-crack
const BROKEN_HEART_CRACK =
  'M12.409 5.824c-.702.792-1.15 1.496-1.415 2.166l2.153 2.156a.5.5 0 0 1 0 .707l-2.293 2.293a.5.5 0 0 0 0 .707L12 15';

const BROKEN_HEART_OUTLINE =
  'M13.508 20.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.677.6.6 0 0 0 .818.001A5.5 5.5 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5z';

export function getVerdictHeartColor(verdict: Verdict): string {
  return verdict === 'Not For Me' ? colors.muted : colors.blue;
}

type VerdictHeartIconProps = {
  verdict: Verdict;
  size?: number;
  color?: string;
};

export function VerdictHeartIcon({
  verdict,
  size = s(20),
  color,
}: VerdictHeartIconProps) {
  const clipId = useId().replace(/:/g, '');
  const fillColor = color ?? getVerdictHeartColor(verdict);

  if (verdict === 'Love It') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={HEART_PATH} fill={fillColor} />
      </Svg>
    );
  }

  if (verdict === 'Like It') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <ClipPath id={`${clipId}-left`}>
            <Rect x={0} y={0} width={12} height={24} />
          </ClipPath>
        </Defs>
        <G clipPath={`url(#${clipId}-left)`}>
          <Path d={HEART_PATH} fill={fillColor} />
        </G>
        <Path
          d={HEART_PATH}
          fill="none"
          stroke={fillColor}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={BROKEN_HEART_CRACK}
        stroke={fillColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d={BROKEN_HEART_OUTLINE}
        stroke={fillColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
