import type { TimeOfDay } from '@/types';

export type GradientStops = {
  colors: readonly [string, string, ...string[]];
  locations?: readonly [number, number, ...number[]];
};

/**
 * Soft planner palettes — cream, peach, periwinkle, and lavender.
 * Today's TOD skies are the global brand gradient story.
 */
export const todaySkyGradients: Record<TimeOfDay, GradientStops> = {
  morning: {
    colors: [
      '#fffdf9',
      '#fff8f0',
      '#fceee0',
      '#f8e4d4',
      '#f5eef5',
      '#faf7f2',
    ],
    locations: [0, 0.18, 0.38, 0.58, 0.78, 1],
  },
  afternoon: {
    colors: [
      '#fffcf8',
      '#faf6f0',
      '#f6ece4',
      '#f0e4dc',
      '#eee8f2',
      '#e8eef8',
    ],
    locations: [0, 0.16, 0.36, 0.54, 0.74, 1],
  },
  evening: {
    colors: [
      '#f6f0f8',
      '#faf4f2',
      '#f5eae8',
      '#ede4f0',
      '#e8ecf6',
      '#f2f0f8',
    ],
    locations: [0, 0.18, 0.4, 0.6, 0.8, 1],
  },
};

/** Auth headers and boot loading — soft morning brand sky. */
export const fullGradient: GradientStops = todaySkyGradients.morning;

/** Splash and launch — full-screen soft brand arc (morning → afternoon). */
export const expandedBrandGradient: GradientStops = {
  colors: [
    '#fffdf9',
    '#fff8f0',
    '#fceee0',
    '#f8e4d4',
    '#f6ece4',
    '#f0e4dc',
    '#f5eef5',
    '#eee8f2',
    '#e8eef8',
  ],
  locations: [0, 0.1, 0.22, 0.36, 0.48, 0.6, 0.72, 0.86, 1],
};

/** @deprecated Prefer todaySkyGradients — kept for GradientBackground TOD variant. */
export const timeOfDayGradients: Record<TimeOfDay, GradientStops> = todaySkyGradients;

/** Approximates the design doc's 160deg CSS gradient in RN LinearGradient */
export const gradientDirection = {
  start: { x: 0.15, y: 0 },
  end: { x: 0.85, y: 1 },
} as const;
