export const categoryColors = {
  Skincare: '#fda4af',
  'Body Care': '#fbcfe8',
  'Hair Care': '#c4b5fd',
  'Nail Care': '#f5d0fe',
  'Oral Care': '#a7f3d0',
  Supplements: '#7dd3fc',
  Medications: '#bfdbfe',
  Exercise: '#fca5a5',
  Wellness: '#6ee7b7',
  Other: '#fde68a',
} as const;

export type Category = keyof typeof categoryColors;

export const categories = Object.keys(categoryColors) as Category[];
