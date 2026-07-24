import { cloneSchedule } from '@/constants/schedules';
import type { Product, Routine } from '@/types';
import type { SharedRoutineSnapshot } from '@/types/share';

/** e.g. Brittany's Morning Skincare */
export function formatSharedRoutineTitle(
  routineName: string,
  sharedByFirstName?: string,
): string {
  const name = routineName.trim() || 'Routine';
  const person = sharedByFirstName?.trim();
  if (!person) return name;
  return `${person}'s ${name}`;
}

/** Build a privacy-safe snapshot for sharing (no verdicts / personal product notes). */
export function buildRoutineShareSnapshot(
  routine: Routine,
  products: Product[],
  sharedByFirstName?: string,
): SharedRoutineSnapshot {
  const productById = new Map(products.map((product) => [product.id, product]));
  const firstName = sharedByFirstName?.trim();

  return {
    name: routine.name.trim(),
    ...(firstName ? { sharedByFirstName: firstName } : {}),
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
