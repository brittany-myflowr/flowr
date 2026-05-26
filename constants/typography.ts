import { fs, s } from '@/lib/scale';

export const fonts = {
  lora: 'Lora_700Bold_Italic',
  loraBold: 'Lora_700Bold',
  cardTitle: 'Lora_700Bold',
  dmSans: 'DMSans_400Regular',
  dmSansMedium: 'DMSans_500Medium',
  dmSansSemiBold: 'DMSans_600SemiBold',
} as const;

export const textStyles = {
  pageTitle: {
    fontFamily: fonts.lora,
    fontSize: fs(22.8),
    color: '#1a1a2e',
  },
  sectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: fs(7.6),
    letterSpacing: s(2),
    textTransform: 'uppercase' as const,
    color: '#9ca3af',
  },
  body: {
    fontFamily: fonts.dmSans,
    fontSize: fs(12),
    color: '#6b7280',
  },
  button: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
    letterSpacing: s(2),
    textTransform: 'uppercase' as const,
  },
} as const;
