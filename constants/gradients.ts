import type { TimeOfDay } from '@/types';

export type GradientStops = {
  colors: readonly [string, string, ...string[]];
  locations?: readonly [number, number, ...number[]];
};

/** Full brand gradient — launch, splash, auth headers */
export const fullGradient: GradientStops = {
  colors: ['#f5c842', '#e8854a', '#c95c4a', '#a87898', '#3d2d5c'],
  locations: [0, 0.3, 0.55, 0.78, 1],
};

/**
 * Expanded brand TOD palettes for Today — more stops within the same hue
 * families (yellow → orange → coral, etc.). Lighter tints at the lit edge
 * create the sun/glow; mesh pools reinforce it. Never cycle-based.
 */
export const todaySkyGradients: Record<TimeOfDay, GradientStops> = {
  morning: {
    colors: [
      '#fff6d0',
      '#fde68a',
      '#f5c842',
      '#f0b040',
      '#eca058',
      '#e8854a',
      '#de7048',
      '#d06048',
      '#c95c4a',
    ],
    locations: [0, 0.08, 0.18, 0.28, 0.38, 0.5, 0.62, 0.76, 1],
  },
  afternoon: {
    colors: [
      '#fde68a',
      '#f5c842',
      '#f0a050',
      '#e8854a',
      '#d86850',
      '#c95c4a',
      '#b87078',
      '#a87898',
      '#906888',
    ],
    locations: [0, 0.1, 0.22, 0.36, 0.48, 0.58, 0.72, 0.86, 1],
  },
  evening: {
    colors: [
      '#a87898',
      '#b88088',
      '#c88878',
      '#d88068',
      '#e8854a',
      '#c97868',
      '#7a5c8a',
      '#5a4070',
      '#3d2d5c',
    ],
    locations: [0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.74, 0.87, 1],
  },
};

export const timeOfDayGradients: Record<TimeOfDay, GradientStops> = {
  morning: {
    colors: ['#f5c842', '#e8854a', '#c95c4a'],
    locations: [0, 0.45, 1],
  },
  afternoon: {
    colors: ['#e8854a', '#c95c4a', '#a87898'],
    locations: [0, 0.4, 1],
  },
  evening: {
    colors: ['#a87898', '#7a5c8a', '#3d2d5c'],
    locations: [0, 0.45, 1],
  },
};

/** Approximates the design doc's 160deg CSS gradient in RN LinearGradient */
export const gradientDirection = {
  start: { x: 0.15, y: 0 },
  end: { x: 0.85, y: 1 },
} as const;
