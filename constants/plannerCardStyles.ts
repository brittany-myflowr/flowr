import type { ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { s } from '@/lib/scale';

export type PlannerCardVariant = 'hero' | 'routine' | 'future' | 'done';

/** Crisp planner outline on light backgrounds. */
export const plannerCardBorder = 'rgba(26,26,46,0.32)';

/** Square corners — minimal rounding like editorial planner apps. */
export const plannerCornerRadius = 0;

export function plannerCard(
  accentColor?: string,
  _variant: PlannerCardVariant = 'routine',
): ViewStyle {
  return {
    backgroundColor: colors.white,
    borderRadius: plannerCornerRadius,
    borderWidth: 1,
    borderColor: plannerCardBorder,
    ...(accentColor
      ? {
          borderLeftWidth: s(3),
          borderLeftColor: accentColor,
        }
      : null),
  };
}
