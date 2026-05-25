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
