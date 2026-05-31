import type { Product, Routine } from '@/types';

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

      if (step.productName === product.name) return step;

      return { ...step, productName: product.name };
    }),
  }));
}
