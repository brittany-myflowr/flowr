import { Platform, type ViewStyle } from 'react-native';

import { s } from '@/lib/scale';

export type TodayGlassVariant = 'hero' | 'routine' | 'future' | 'done';

const GLASS_VARIANTS: Record<TodayGlassVariant, { backgroundColor: string; borderColor: string }> =
  {
    hero: {
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderColor: 'rgba(255,255,255,0.62)',
    },
    routine: {
      backgroundColor: 'rgba(255,255,255,0.84)',
      borderColor: 'rgba(255,255,255,0.58)',
    },
    future: {
      backgroundColor: 'rgba(255,255,255,0.78)',
      borderColor: 'rgba(255,255,255,0.52)',
    },
    done: {
      backgroundColor: 'rgba(255,255,255,0.74)',
      borderColor: 'rgba(255,255,255,0.48)',
    },
  };

export function todayGlassCard(
  accentColor?: string,
  variant: TodayGlassVariant = 'routine',
): ViewStyle {
  const glass = GLASS_VARIANTS[variant];

  return {
    backgroundColor: glass.backgroundColor,
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: glass.borderColor,
    ...(accentColor
      ? {
          borderLeftWidth: s(3),
          borderLeftColor: accentColor,
        }
      : null),
    ...Platform.select({
      ios: {
        shadowColor: '#1a1a2e',
        shadowOffset: { width: 0, height: s(3) },
        shadowOpacity: variant === 'hero' ? 0.12 : 0.08,
        shadowRadius: s(10),
      },
      android: {
        elevation: variant === 'hero' ? 4 : 2,
      },
      default: {},
    }),
  };
}
