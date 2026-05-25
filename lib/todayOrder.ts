import type { TimeOfDay } from '@/types';

export type TodayStepOrderMap = Record<TimeOfDay, string[]>;

export const EMPTY_TODAY_STEP_ORDERS: TodayStepOrderMap = {
  morning: [],
  afternoon: [],
  evening: [],
};

export function sortByTodayOrder<T extends { step: { id: string } }>(
  items: T[],
  order: string[],
): T[] {
  const syncedOrder = syncTodayStepOrder(
    order,
    items.map(({ step }) => step.id),
  );

  if (syncedOrder.length === 0) return items;

  const indexById = new Map(syncedOrder.map((id, index) => [id, index]));

  return [...items].sort((left, right) => {
    const leftIndex = indexById.get(left.step.id) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = indexById.get(right.step.id) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
  });
}

export function syncTodayStepOrder(order: string[], currentStepIds: string[]): string[] {
  const currentSet = new Set(currentStepIds);
  const filtered = order.filter((id) => currentSet.has(id));
  const known = new Set(filtered);

  return [...filtered, ...currentStepIds.filter((id) => !known.has(id))];
}

export function moveTodayStepOrder(order: string[], fromIndex: number, toIndex: number): string[] {
  if (toIndex < 0 || toIndex >= order.length || fromIndex === toIndex) return order;

  const next = [...order];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}
