export const fonts = {
  lora: 'Lora_700Bold_Italic',
  loraRegular: 'Lora_400Regular',
  dmSans: 'DMSans_400Regular',
  dmSansMedium: 'DMSans_500Medium',
  dmSansSemiBold: 'DMSans_600SemiBold',
} as const;

export const textStyles = {
  pageTitle: {
    fontFamily: fonts.lora,
    fontSize: 20,
    color: '#1a1a2e',
  },
  sectionLabel: {
    fontFamily: fonts.dmSans,
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: '#9ca3af',
  },
  body: {
    fontFamily: fonts.dmSans,
    fontSize: 12,
    color: '#6b7280',
  },
  button: {
    fontFamily: fonts.dmSans,
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
} as const;
