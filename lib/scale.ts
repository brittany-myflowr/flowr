import { Dimensions, PixelRatio } from 'react-native';

/** Design reference: iPhone 14 (390 × 844 logical points). */
export const BASE_WIDTH = 390;
export const BASE_HEIGHT = 844;

/** Global bump so UI reads closer to native apps (Instagram, Spotify) on large iPhones. */
export const BASE_SIZE_MULTIPLIER = 1.2;

function getScreen() {
  return Dimensions.get('window');
}

function widthScaleFactor(): number {
  return (getScreen().width / BASE_WIDTH) * BASE_SIZE_MULTIPLIER;
}

function heightScaleFactor(): number {
  return (getScreen().height / BASE_HEIGHT) * BASE_SIZE_MULTIPLIER;
}

export function scale(size: number): number {
  return PixelRatio.roundToNearestPixel(widthScaleFactor() * size);
}

export function verticalScale(size: number): number {
  return PixelRatio.roundToNearestPixel(heightScaleFactor() * size);
}

/** Blends linear scaling with the adjusted base size — good for typography. */
export function moderateScale(size: number, factor = 0.5): number {
  const adjustedBase = size * BASE_SIZE_MULTIPLIER;
  const scaled = widthScaleFactor() * size;
  return PixelRatio.roundToNearestPixel(adjustedBase + (scaled - adjustedBase) * factor);
}

export function scaleFont(size: number): number {
  return moderateScale(size, 0.5);
}

/** Shorthand aliases used throughout StyleSheets. */
export const s = scale;
export const vs = verticalScale;
export const ms = moderateScale;
export const fs = scaleFont;
