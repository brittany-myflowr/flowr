import type { TodayMeshGradient } from '@/constants/todayMeshGradients';
import { todayGlowPalette as glow } from '@/constants/todayMeshGradients';

/** Full-brand mesh glow for splash and launch — hero sun behind the logo. */
export const brandMeshGradient: TodayMeshGradient = {
  pools: [
    { cx: 52, cy: 14, rx: 66, ry: 54, color: glow.cream, peakOpacity: 0.74 },
    { cx: 78, cy: 10, rx: 54, ry: 46, color: glow.lightGold, peakOpacity: 0.6 },
    { cx: 74, cy: 16, rx: 38, ry: 34, color: glow.gold, peakOpacity: 0.5 },
    { cx: 18, cy: 48, rx: 50, ry: 52, color: glow.orange, peakOpacity: 0.22 },
    { cx: 86, cy: 68, rx: 46, ry: 42, color: glow.plum, peakOpacity: 0.2 },
    { cx: 50, cy: 92, rx: 88, ry: 44, color: glow.night, peakOpacity: 0.32 },
  ],
  vignette: ['rgba(26,26,46,0.06)', 'rgba(26,26,46,0)', 'rgba(26,26,46,0.06)'],
};
