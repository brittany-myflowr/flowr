import type { Product, Routine } from '@/types';

import { formatTaggedProductLabel } from '@/lib/formatTaggedProductLabel';

export function reconcileStepProducts(routines: Routine[], products: Product[]): Routine[] {
  const productById = new Map(products.map((product) => [product.id, product]));

  return routines.map((routine) => ({
    ...routine,
    steps: routine.steps.map((step) => {
      if (!step.productId) return step;

      const product = productById.get(step.productId);
      if (!product) {
        return { ...step, productId: undefined, productName: undefined };
      }

      const productName = formatTaggedProductLabel(product);
      if (step.productName === productName) return step;

      return { ...step, productName };
    }),
  }));
}
