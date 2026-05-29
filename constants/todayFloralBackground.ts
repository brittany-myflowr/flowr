import type { GradientStops } from '@/constants/gradients';
import type { TimeOfDay } from '@/types';

export type FloralBlob = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
  peakOpacity: number;
};

export type TodayFloralBackground = {
  baseGradient: GradientStops;
  blooms: FloralBlob[];
  /** Softens the lower half so routine cards sit on calmer paper. */
  bottomWash: readonly [string, string, string];
};

/** Soft brand tints for blurry planner florals — never cycle-based. */
export const floralPalette = {
  cream: '#fffbf6',
  paper: '#faf7f2',
  peach: '#ecb090',
  coral: '#d88478',
  gold: '#f0cc78',
  plum: '#b898b0',
  periwinkle: '#9eb0d4',
  lavender: '#c0b0d8',
} as const;

const plannerBase: GradientStops = {
  colors: [floralPalette.cream, floralPalette.paper, '#f7f4ef'],
  locations: [0, 0.55, 1],
};

const bottomWash: readonly [string, string, string] = [
  'rgba(250,247,242,0)',
  'rgba(250,247,242,0.72)',
  'rgba(250,247,242,0.96)',
];

/**
 * Large, out-of-focus floral pools on cream — subtle TOD warmth shifts only.
 * Inspired by soft daisy-like blurs; uses flowr brand hue families.
 */
export const todayFloralBackgrounds: Record<TimeOfDay, TodayFloralBackground> = {
  morning: {
    baseGradient: {
      colors: ['#fffdf8', floralPalette.cream, floralPalette.paper],
      locations: [0, 0.45, 1],
    },
    blooms: [
      { cx: 22, cy: 38, rx: 46, ry: 42, color: floralPalette.peach, peakOpacity: 0.28 },
      { cx: 14, cy: 62, rx: 38, ry: 34, color: floralPalette.coral, peakOpacity: 0.18 },
      { cx: 48, cy: 22, rx: 32, ry: 28, color: floralPalette.gold, peakOpacity: 0.16 },
      { cx: 82, cy: 18, rx: 34, ry: 30, color: floralPalette.lavender, peakOpacity: 0.14 },
      { cx: 88, cy: 68, rx: 42, ry: 38, color: floralPalette.periwinkle, peakOpacity: 0.2 },
      { cx: 58, cy: 52, rx: 28, ry: 26, color: floralPalette.peach, peakOpacity: 0.1 },
    ],
    bottomWash,
  },
  afternoon: {
    baseGradient: plannerBase,
    blooms: [
      { cx: 18, cy: 44, rx: 44, ry: 40, color: floralPalette.peach, peakOpacity: 0.24 },
      { cx: 36, cy: 28, rx: 36, ry: 32, color: floralPalette.gold, peakOpacity: 0.14 },
      { cx: 78, cy: 24, rx: 38, ry: 34, color: floralPalette.plum, peakOpacity: 0.16 },
      { cx: 86, cy: 62, rx: 46, ry: 42, color: floralPalette.periwinkle, peakOpacity: 0.22 },
      { cx: 52, cy: 72, rx: 40, ry: 36, color: floralPalette.coral, peakOpacity: 0.12 },
    ],
    bottomWash,
  },
  evening: {
    baseGradient: {
      colors: ['#f9f6fb', '#faf7f4', floralPalette.paper],
      locations: [0, 0.5, 1],
    },
    blooms: [
      { cx: 24, cy: 36, rx: 40, ry: 36, color: floralPalette.coral, peakOpacity: 0.16 },
      { cx: 72, cy: 20, rx: 42, ry: 38, color: floralPalette.plum, peakOpacity: 0.2 },
      { cx: 88, cy: 58, rx: 44, ry: 40, color: floralPalette.periwinkle, peakOpacity: 0.24 },
      { cx: 46, cy: 64, rx: 36, ry: 32, color: floralPalette.lavender, peakOpacity: 0.18 },
      { cx: 12, cy: 70, rx: 32, ry: 28, color: floralPalette.peach, peakOpacity: 0.1 },
    ],
    bottomWash,
  },
};
