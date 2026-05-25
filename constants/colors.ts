export const colors = {
  navy: '#1a1a2e',
  blue: '#7ba7c2',
  light: '#f0f7fc',
  border: '#e8e8e4',
  bg: '#fafaf8',
  gray: '#6b7280',
  muted: '#9ca3af',
  pink: '#fda4af',
  white: '#ffffff',
  danger: '#ef4444',
  dangerLight: '#fca5a5',
  dangerBg: '#fff5f5',
  dangerBorder: '#fee2e2',
  completedBg: '#f8f8f6',
  inputBg: '#f5f5f3',
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export type ColorName = keyof typeof colors;
