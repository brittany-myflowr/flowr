import { cloneSchedule } from '@/constants/schedules';
import type { Product, Routine } from '@/types';
import type { SharedRoutineSnapshot } from '@/types/share';

/** Build a privacy-safe snapshot for sharing (no verdicts / personal product notes). */
export function buildRoutineShareSnapshot(
  routine: Routine,
  products: Product[],
): SharedRoutineSnapshot {
  const productById = new Map(products.map((product) => [product.id, product]));

  return {
    name: routine.name.trim(),
    category: routine.category,
    description: routine.description?.trim() || undefined,
    timeOfDay: routine.timeOfDay,
    schedule: cloneSchedule(routine.schedule),
    steps: routine.steps.map((step) => {
      const product = step.productId ? productById.get(step.productId) : undefined;
      const sharedProduct = product
        ? { name: product.name.trim(), brand: product.brand.trim() }
        : parseProductLabel(step.productName);

      return {
        name: step.name.trim(),
        note: step.note?.trim() || undefined,
        schedule: step.schedule ? cloneSchedule(step.schedule) : undefined,
        product: sharedProduct,
      };
    }),
  };
}

function parseProductLabel(
  label: string | undefined,
): { name: string; brand: string } | undefined {
  if (!label?.trim()) return undefined;
  const parts = label.split('·').map((part) => part.trim());
  if (parts.length >= 2) {
    return { brand: parts[0], name: parts.slice(1).join(' · ') };
  }
  return { brand: '', name: label.trim() };
}

export function sharedProductKey(brand: string, name: string): string {
  return `${brand.trim().toLowerCase()}::${name.trim().toLowerCase()}`;
}
