import type { Routine } from '@/types';

export type ProductTagLink = {
  routineName: string;
  stepName: string;
};

export function getProductTagLinks(routines: Routine[], productId: string): ProductTagLink[] {
  const links: ProductTagLink[] = [];

  for (const routine of routines) {
    for (const step of routine.steps) {
      if (step.productId === productId) {
        links.push({ routineName: routine.name, stepName: step.name });
      }
    }
  }

  return links;
}
