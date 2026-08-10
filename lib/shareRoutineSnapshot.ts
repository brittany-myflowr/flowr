import { cloneSchedule } from '@/constants/schedules';
import type { Product, Routine, Schedule } from '@/types';
import type { SharedRoutineSnapshot } from '@/types/share';

/** e.g. Brittany's Morning Skincare — first name only */
export function formatSharedRoutineTitle(
  routineName: string,
  sharedByFirstName?: string,
): string {
  const name = routineName.trim() || 'Routine';
  const person = sharedByFirstName?.trim();
  if (!person) return name;
  return `${person}'s ${name}`;
}

/** First name only for “Shared by” attribution */
export function formatSharedByName(sharedByFirstName?: string): string {
  return sharedByFirstName?.trim() || '';
}

export type BuildShareSnapshotOptions = {
  /** Include routine description — off by default (opt-in). */
  includeDescription?: boolean;
  /** Include per-step notes — off by default (opt-in). */
  includeStepNotes?: boolean;
};

/** Build a privacy-safe snapshot for sharing (no verdicts, last name, or cycle phases). */
export function buildRoutineShareSnapshot(
  routine: Routine,
  products: Product[],
  sharedBy?: { firstName?: string },
  options: BuildShareSnapshotOptions = {},
): SharedRoutineSnapshot {
  const productById = new Map(products.map((product) => [product.id, product]));
  const firstName = sharedBy?.firstName?.trim();
  const includeDescription = options.includeDescription === true;
  const includeStepNotes = options.includeStepNotes === true;
  const description = includeDescription ? routine.description?.trim() || undefined : undefined;

  return {
    name: routine.name.trim(),
    ...(firstName ? { sharedByFirstName: firstName } : {}),
    category: routine.category,
    ...(description ? { description } : {}),
    timeOfDay: routine.timeOfDay,
    schedule: cloneScheduleForShare(routine.schedule),
    steps: routine.steps.map((step) => {
      const product = step.productId ? productById.get(step.productId) : undefined;
      const sharedProduct = product
        ? { name: product.name.trim(), brand: product.brand.trim() }
        : parseProductLabel(step.productName);
      const note = includeStepNotes ? step.note?.trim() || undefined : undefined;

      return {
        name: step.name.trim(),
        ...(note ? { note } : {}),
        schedule: step.schedule ? cloneScheduleForShare(step.schedule) : undefined,
        product: sharedProduct,
      };
    }),
  };
}

/** Copy schedule for sharing without cycle phase details. */
function cloneScheduleForShare(schedule: Schedule): Schedule {
  const cloned = cloneSchedule(schedule);
  const { phases: _phases, ...rest } = cloned;
  return rest;
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
