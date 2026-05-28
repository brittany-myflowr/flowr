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

/** Brand palette tints used for glow pools — same families as todaySkyGradients. */
const glow = {
  cream: '#fff6d0',
  lightGold: '#fde68a',
  gold: '#f5c842',
  orange: '#e8854a',
  coral: '#c95c4a',
  plum: '#a87898',
  purple: '#7a5c8a',
  night: '#3d2d5c',
} as const;

/**
 * Soft light pools on top of the expanded linear gradient — sun position
 * shifts by time of day (morning high, afternoon mid, evening top-right).
 */
export const todayMeshGradients: Record<TimeOfDay, TodayMeshGradient> = {
  morning: {
    pools: [
      { cx: 82, cy: 16, rx: 56, ry: 48, color: glow.cream, peakOpacity: 0.65 },
      { cx: 78, cy: 20, rx: 40, ry: 36, color: glow.lightGold, peakOpacity: 0.55 },
      { cx: 72, cy: 24, rx: 28, ry: 26, color: glow.gold, peakOpacity: 0.45 },
      { cx: 20, cy: 42, rx: 48, ry: 52, color: glow.orange, peakOpacity: 0.22 },
      { cx: 88, cy: 78, rx: 44, ry: 40, color: glow.coral, peakOpacity: 0.2 },
    ],
    vignette: ['rgba(26,26,46,0.05)', 'rgba(26,26,46,0)', 'rgba(26,26,46,0.04)'],
  },
  afternoon: {
    pools: [
      { cx: 70, cy: 38, rx: 54, ry: 46, color: glow.cream, peakOpacity: 0.52 },
      { cx: 66, cy: 42, rx: 38, ry: 34, color: glow.gold, peakOpacity: 0.48 },
      { cx: 62, cy: 46, rx: 26, ry: 24, color: glow.orange, peakOpacity: 0.38 },
      { cx: 18, cy: 68, rx: 50, ry: 44, color: glow.coral, peakOpacity: 0.28 },
      { cx: 50, cy: 88, rx: 72, ry: 36, color: glow.plum, peakOpacity: 0.22 },
    ],
    vignette: ['rgba(26,26,46,0.05)', 'rgba(26,26,46,0)', 'rgba(26,26,46,0.05)'],
  },
  evening: {
    pools: [
      { cx: 50, cy: 10, rx: 68, ry: 38, color: glow.plum, peakOpacity: 0.28 },
      { cx: 88, cy: 8, rx: 62, ry: 54, color: glow.cream, peakOpacity: 0.68 },
      { cx: 84, cy: 12, rx: 46, ry: 40, color: glow.lightGold, peakOpacity: 0.58 },
      { cx: 80, cy: 16, rx: 32, ry: 28, color: glow.gold, peakOpacity: 0.5 },
      { cx: 72, cy: 26, rx: 50, ry: 46, color: glow.orange, peakOpacity: 0.32 },
      { cx: 58, cy: 38, rx: 44, ry: 40, color: glow.coral, peakOpacity: 0.18 },
      { cx: 50, cy: 92, rx: 86, ry: 42, color: glow.night, peakOpacity: 0.35 },
    ],
    vignette: ['rgba(0,0,0,0.06)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.05)'],
  },
};

export { glow as todayGlowPalette };
