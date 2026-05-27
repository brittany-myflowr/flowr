import type { Routine } from '@/types';

export type ProductTagLink = {
  routineId: string;
  stepId: string;
  routineName: string;
  stepName: string;
};

export function getTaggedProductIds(routines: Routine[]): Set<string> {
  const ids = new Set<string>();

  for (const routine of routines) {
    for (const step of routine.steps) {
      if (step.productId) {
        ids.add(step.productId);
      }
    }
  }

  return ids;
}

export function getProductTagLinks(routines: Routine[], productId: string): ProductTagLink[] {
  const links: ProductTagLink[] = [];

  for (const routine of routines) {
    for (const step of routine.steps) {
      if (step.productId === productId) {
        links.push({
          routineId: routine.id,
          stepId: step.id,
          routineName: routine.name,
          stepName: step.name,
        });
      }
    }
  }

  return links;
}
