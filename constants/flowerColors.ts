export type FlowerColor = {
  name: string;
  stroke: string;
  bg: string;
};

export const flowerColors: FlowerColor[] = [
  { name: 'Blush', stroke: '#f9a8d4', bg: '#fdf2f8' },
  { name: 'Lavender', stroke: '#c4b5fd', bg: '#f5f3ff' },
  { name: 'Sky', stroke: '#7ba7c2', bg: '#f0f7fc' },
  { name: 'Sage', stroke: '#6ee7b7', bg: '#f0fdf4' },
  { name: 'Peach', stroke: '#fda4af', bg: '#fff1f2' },
  { name: 'Mauve', stroke: '#a78bfa', bg: '#f5f3ff' },
  { name: 'Gold', stroke: '#fbbf24', bg: '#fffbeb' },
  { name: 'Rose', stroke: '#fb7185', bg: '#fff1f2' },
];

export const defaultFlowerColor = flowerColors[2];
