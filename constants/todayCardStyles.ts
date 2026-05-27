import { Platform, type ViewStyle } from 'react-native';

import { s } from '@/lib/scale';

export function todayGlassCard(accentColor?: string): ViewStyle {
  return {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
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
        shadowOpacity: 0.1,
        shadowRadius: s(10),
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  };
}
