import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DailyCompletionMap } from '@/lib/completion';
import { EMPTY_TODAY_STEP_ORDERS, type TodayStepOrderMap } from '@/lib/todayOrder';
import type { CycleSettings, Product, Routine, User } from '@/types';
import { DEFAULT_CYCLE_SETTINGS } from '@/types';

export const STORAGE_KEY = '@flowr/v1/app-state';
export const PERSISTENCE_VERSION = 1;

export type LocalCredentials = {
  email: string;
  password: string;
};

export type PersistedAppState = {
  version: number;
  isLoggedIn: boolean;
  user: User | null;
  credentials: LocalCredentials | null;
  routines: Routine[];
  products: Product[];
  dailyCompletions: DailyCompletionMap;
  cycleSettings: CycleSettings;
  todayStepOrders?: TodayStepOrderMap;
};

export const EMPTY_PERSISTED_STATE: PersistedAppState = {
  version: PERSISTENCE_VERSION,
  isLoggedIn: false,
  user: null,
  credentials: null,
  routines: [],
  products: [],
  dailyCompletions: {},
  cycleSettings: DEFAULT_CYCLE_SETTINGS,
  todayStepOrders: EMPTY_TODAY_STEP_ORDERS,
};

/** Step completion is session-only — reset when loading from disk. */
export function routinesForPersistence(routines: Routine[]): Routine[] {
  return routines.map((routine) => ({
    ...routine,
    steps: routine.steps.map((step) => ({ ...step, done: false })),
  }));
}

export function buildPersistedState(input: {
  isLoggedIn: boolean;
  user: User | null;
  credentials: LocalCredentials | null;
  routines: Routine[];
  products: Product[];
  dailyCompletions: DailyCompletionMap;
  cycleSettings: CycleSettings;
  todayStepOrders: TodayStepOrderMap;
}): PersistedAppState {
  return {
    version: PERSISTENCE_VERSION,
    isLoggedIn: input.isLoggedIn,
    user: input.user,
    credentials: input.credentials,
    routines: routinesForPersistence(input.routines),
    products: input.products,
    dailyCompletions: input.dailyCompletions,
    cycleSettings: input.cycleSettings,
    todayStepOrders: input.todayStepOrders,
  };
}

export async function loadPersistedState(): Promise<PersistedAppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PERSISTED_STATE;

    const parsed = JSON.parse(raw) as PersistedAppState;
    if (!parsed || parsed.version !== PERSISTENCE_VERSION) {
      return EMPTY_PERSISTED_STATE;
    }

    return {
      ...EMPTY_PERSISTED_STATE,
      ...parsed,
      routines: parsed.routines ?? [],
      products: parsed.products ?? [],
      dailyCompletions: parsed.dailyCompletions ?? {},
      cycleSettings: parsed.cycleSettings ?? DEFAULT_CYCLE_SETTINGS,
      todayStepOrders: parsed.todayStepOrders ?? EMPTY_TODAY_STEP_ORDERS,
    };
  } catch {
    return EMPTY_PERSISTED_STATE;
  }
}

export async function savePersistedState(state: PersistedAppState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearPersistedState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
