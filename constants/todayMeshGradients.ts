import type { TimeOfDay } from '@/types';

export type MeshColorPool = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
  peakOpacity: number;
};

export type TodayMeshGradient = {
  pools: MeshColorPool[];
  vignette: readonly [string, string, string];
};

/** Soft inspo palette — cream, peach, periwinkle, lavender (never cycle-based). */
const glow = {
  cream: '#fffbf6',
  blush: '#fceee0',
  peach: '#ecb090',
  coral: '#e8a898',
  gold: '#f0dcc0',
  plum: '#c4a8b8',
  periwinkle: '#9eb0d4',
  lavender: '#c0b0d8',
} as const;

/**
 * Gentle mesh glow pools on the soft linear gradient — airy and planner-like,
 * with subtle TOD warmth shifts (morning peach, afternoon balanced, evening lavender).
 */
export const todayMeshGradients: Record<TimeOfDay, TodayMeshGradient> = {
  morning: {
    pools: [
      { cx: 78, cy: 18, rx: 58, ry: 50, color: glow.blush, peakOpacity: 0.42 },
      { cx: 20, cy: 40, rx: 50, ry: 46, color: glow.peach, peakOpacity: 0.32 },
      { cx: 72, cy: 48, rx: 38, ry: 34, color: glow.gold, peakOpacity: 0.22 },
      { cx: 88, cy: 72, rx: 44, ry: 40, color: glow.periwinkle, peakOpacity: 0.2 },
      { cx: 42, cy: 82, rx: 52, ry: 38, color: glow.lavender, peakOpacity: 0.14 },
    ],
    vignette: ['rgba(26,26,46,0.025)', 'rgba(26,26,46,0)', 'rgba(26,26,46,0.02)'],
  },
  afternoon: {
    pools: [
      { cx: 68, cy: 32, rx: 54, ry: 48, color: glow.peach, peakOpacity: 0.34 },
      { cx: 22, cy: 58, rx: 48, ry: 44, color: glow.coral, peakOpacity: 0.22 },
      { cx: 82, cy: 28, rx: 40, ry: 36, color: glow.lavender, peakOpacity: 0.26 },
      { cx: 52, cy: 78, rx: 56, ry: 42, color: glow.periwinkle, peakOpacity: 0.24 },
      { cx: 14, cy: 22, rx: 34, ry: 30, color: glow.gold, peakOpacity: 0.16 },
    ],
    vignette: ['rgba(26,26,46,0.025)', 'rgba(26,26,46,0)', 'rgba(26,26,46,0.025)'],
  },
  evening: {
    pools: [
      { cx: 74, cy: 20, rx: 52, ry: 46, color: glow.lavender, peakOpacity: 0.36 },
      { cx: 18, cy: 38, rx: 46, ry: 42, color: glow.plum, peakOpacity: 0.24 },
      { cx: 86, cy: 62, rx: 48, ry: 44, color: glow.periwinkle, peakOpacity: 0.3 },
      { cx: 48, cy: 72, rx: 44, ry: 40, color: glow.peach, peakOpacity: 0.16 },
      { cx: 58, cy: 28, rx: 36, ry: 32, color: glow.coral, peakOpacity: 0.12 },
    ],
    vignette: ['rgba(26,26,46,0.03)', 'rgba(26,26,46,0)', 'rgba(26,26,46,0.02)'],
  },
};

export { glow as todayGlowPalette };
