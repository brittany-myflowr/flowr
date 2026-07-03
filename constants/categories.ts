/** Pastel category accents — aligned with Today mesh (cream, blush, peach, periwinkle, lavender, sage). */
export const categoryColors = {
  Skincare: '#e8a0b0',
  'Body Care': '#f0c0d0',
  'Hair Care': '#c0b0d8',
  'Nail Care': '#c4a8b8',
  'Oral Care': '#c4d4b8',
  Supplements: '#9eb0d4',
  Medications: '#b0c8e0',
  Exercise: '#ecb090',
  Wellness: '#9cb088',
  Other: '#e8d4a8',
} as const;

export type Category = keyof typeof categoryColors;

export const categories = Object.keys(categoryColors) as Category[];
