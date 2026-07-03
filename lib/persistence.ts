import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DailyCompletionMap } from '@/lib/completion';
import { EMPTY_TODAY_STEP_ORDERS, type TodayStepOrderMap } from '@/lib/todayOrder';
import type { CycleSettings, Product, Routine, User } from '@/types';
import { DEFAULT_CYCLE_SETTINGS } from '@/types';

export const STORAGE_KEY = '@flowr/v2/app-state';
export const PERSISTENCE_VERSION = 2;

export type PersistedAppState = {
  version: number;
  authUserId: string | null;
  isLoggedIn: boolean;
  user: User | null;
  trialStartedAt: string | null;
  routines: Routine[];
  products: Product[];
  dailyCompletions: DailyCompletionMap;
  cycleSettings: CycleSettings;
  todayStepOrders: TodayStepOrderMap;
  pendingSync: boolean;
  lastSyncedAt: string | null;
};

export const EMPTY_PERSISTED_STATE: PersistedAppState = {
  version: PERSISTENCE_VERSION,
  authUserId: null,
  isLoggedIn: false,
  user: null,
  trialStartedAt: null,
  routines: [],
  products: [],
  dailyCompletions: {},
  cycleSettings: DEFAULT_CYCLE_SETTINGS,
  todayStepOrders: EMPTY_TODAY_STEP_ORDERS,
  pendingSync: false,
  lastSyncedAt: null,
};

/** Step completion is session-only — reset when loading from disk. */
export function routinesForPersistence(routines: Routine[]): Routine[] {
  return routines.map((routine) => ({
    ...routine,
    steps: routine.steps.map((step) => ({ ...step, done: false })),
  }));
}

export function buildPersistedState(input: {
  authUserId: string | null;
  isLoggedIn: boolean;
  user: User | null;
  trialStartedAt: string | null;
  routines: Routine[];
  products: Product[];
  dailyCompletions: DailyCompletionMap;
  cycleSettings: CycleSettings;
  todayStepOrders: TodayStepOrderMap;
  pendingSync?: boolean;
  lastSyncedAt?: string | null;
}): PersistedAppState {
  return {
    version: PERSISTENCE_VERSION,
    authUserId: input.authUserId,
    isLoggedIn: input.isLoggedIn,
    user: input.user,
    trialStartedAt: input.trialStartedAt,
    routines: routinesForPersistence(input.routines),
    products: input.products,
    dailyCompletions: input.dailyCompletions,
    cycleSettings: input.cycleSettings,
    todayStepOrders: input.todayStepOrders,
    pendingSync: input.pendingSync ?? false,
    lastSyncedAt: input.lastSyncedAt ?? null,
  };
}

const LEGACY_STORAGE_KEY = '@flowr/v1/app-state';

async function loadLegacyState(): Promise<PersistedAppState | null> {
  try {
    const raw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || parsed.version !== 1) return null;

    const user = parsed.user as User | null;
    return {
      ...EMPTY_PERSISTED_STATE,
      isLoggedIn: Boolean(parsed.isLoggedIn),
      user: user
        ? {
            id: (user as User & { id?: string }).id ?? '',
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            flowerColorName: user.flowerColorName,
          }
        : null,
      trialStartedAt: (parsed.trialStartedAt as string | null) ?? null,
      routines: (parsed.routines as Routine[]) ?? [],
      products: (parsed.products as Product[]) ?? [],
      dailyCompletions: (parsed.dailyCompletions as DailyCompletionMap) ?? {},
      cycleSettings: (parsed.cycleSettings as CycleSettings) ?? DEFAULT_CYCLE_SETTINGS,
      todayStepOrders: (parsed.todayStepOrders as TodayStepOrderMap) ?? EMPTY_TODAY_STEP_ORDERS,
      pendingSync: true,
    };
  } catch {
    return null;
  }
}

export async function loadPersistedState(): Promise<PersistedAppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = await loadLegacyState();
      return legacy ?? EMPTY_PERSISTED_STATE;
    }

    const parsed = JSON.parse(raw) as PersistedAppState;
    if (!parsed || parsed.version !== PERSISTENCE_VERSION) {
      const legacy = await loadLegacyState();
      return legacy ?? EMPTY_PERSISTED_STATE;
    }

    return {
      ...EMPTY_PERSISTED_STATE,
      ...parsed,
      authUserId: parsed.authUserId ?? null,
      trialStartedAt: parsed.trialStartedAt ?? null,
      routines: parsed.routines ?? [],
      products: parsed.products ?? [],
      dailyCompletions: parsed.dailyCompletions ?? {},
      cycleSettings: parsed.cycleSettings ?? DEFAULT_CYCLE_SETTINGS,
      todayStepOrders: parsed.todayStepOrders ?? EMPTY_TODAY_STEP_ORDERS,
      pendingSync: parsed.pendingSync ?? false,
      lastSyncedAt: parsed.lastSyncedAt ?? null,
    };
  } catch {
    return EMPTY_PERSISTED_STATE;
  }
}

export async function savePersistedState(state: PersistedAppState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearPersistedState(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEY, LEGACY_STORAGE_KEY]);
}
