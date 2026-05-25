import { flowerColors, type FlowerColor } from '@/constants/flowerColors';

export function getFlowerColorByName(name: string | undefined): FlowerColor {
  return flowerColors.find((color) => color.name === name) ?? flowerColors[2];
}
