import type { Routine } from '@/types';

export function getLinkedStepNames(routines: Routine[], productId: string): string[] {
  const names: string[] = [];

  for (const routine of routines) {
    for (const step of routine.steps) {
      if (step.productId === productId) {
        names.push(step.name);
      }
    }
  }

  return names;
}
