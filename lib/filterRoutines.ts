import { categories, type Category } from '@/constants/categories';
import { formatTimeOfDay } from '@/constants/schedules';
import type { Routine, TimeOfDay } from '@/types';

export type RoutineCategoryFilter = Category | 'All';

const TIME_OF_DAY_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

export function isRoutineCategoryFilter(value: string): value is RoutineCategoryFilter {
  return value === 'All' || categories.includes(value as Category);
}

export function filterRoutines(
  routines: Routine[],
  query: string,
  categoryFilter: RoutineCategoryFilter,
): Routine[] {
  const normalized = query.trim().toLowerCase();

  return routines.filter((routine) => {
    if (categoryFilter !== 'All' && routine.category !== categoryFilter) {
      return false;
    }

    if (!normalized) return true;

    const haystack = [
      routine.name,
      routine.category,
      formatTimeOfDay(routine.timeOfDay),
      ...routine.steps.map((step) => [step.name, step.note ?? '', step.productName ?? ''].join(' ')),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function groupRoutinesByTimeOfDay(routines: Routine[]): Array<{
  timeOfDay: TimeOfDay;
  label: string;
  routines: Routine[];
}> {
  return TIME_OF_DAY_ORDER.map((timeOfDay) => ({
    timeOfDay,
    label: formatTimeOfDay(timeOfDay),
    routines: routines.filter((routine) => routine.timeOfDay === timeOfDay),
  })).filter((group) => group.routines.length > 0);
}

export function getRoutineCategoryFilters(): RoutineCategoryFilter[] {
  return ['All', ...categories];
}

export function hasActiveRoutineFilters(input: {
  query: string;
  categoryFilter: RoutineCategoryFilter;
}): boolean {
  return input.query.trim().length > 0 || input.categoryFilter !== 'All';
}
