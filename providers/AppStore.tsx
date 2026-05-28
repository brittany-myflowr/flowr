import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { defaultFlowerColor } from '@/constants/flowerColors';
import { createId } from '@/lib/createId';
import { defaultScheduleForTimeOfDay, normalizeSchedule } from '@/constants/schedules';
import {
  type DailyCompletionMap,
  reconcileDailyCompletionsOnLoad,
  snapshotTodayCompletion,
} from '@/lib/completion';
import {
  buildPersistedState,
  clearPersistedState,
  loadPersistedState,
  savePersistedState,
  type LocalCredentials,
} from '@/lib/persistence';
import type { Category } from '@/constants/categories';
import { formatDateKey } from '@/lib/dateKey';
import type {
  CycleSettings,
  Product,
  Routine,
  Schedule,
  ScheduleFrequency,
  Step,
  TimeOfDay,
  User,
} from '@/types';
import { DEFAULT_CYCLE_SETTINGS } from '@/types';
import {
  collectStepIds,
  EMPTY_TODAY_STEP_ORDERS,
  mergeReorderedActiveStepIds,
  pruneTodayStepOrders,
  type TodayStepOrderMap,
} from '@/lib/todayOrder';

export type CreateRoutineStepInput = {
  name: string;
  note?: string;
  schedule?: Schedule;
  productId?: string;
};

export type CreateRoutineInput = {
  name: string;
  category: Category;
  schedule: Schedule;
  steps: CreateRoutineStepInput[];
};

export type AddStepInput = {
  name: string;
  note?: string;
  schedule?: Schedule;
};

type SignUpInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type SignInInput = {
  email: string;
  password: string;
};

type UpdateAccountInput = {
  firstName: string;
  lastName: string;
  email: string;
  flowerColorName: string;
};

type AppStoreValue = {
  hydrated: boolean;
  isLoggedIn: boolean;
  user: User | null;
  routines: Routine[];
  products: Product[];
  dailyCompletions: DailyCompletionMap;
  cycleSettings: CycleSettings;
  todayStepOrders: TodayStepOrderMap;
  pendingAddStepSchedule: Schedule | null;
  pendingGuidedStepScheduleInit: Schedule | null;
  pendingGuidedStepScheduleResult: { stepIndex: number; schedule: Schedule } | null;
  pendingGuidedStepProductResult: { stepIndex: number; productId: string | null } | null;
  signUp: (input: SignUpInput) => string | null;
  signIn: (input: SignInInput) => string | null;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateAccount: (input: UpdateAccountInput) => string | null;
  resetAllData: () => Promise<void>;
  addRoutine: (input: CreateRoutineInput) => Routine;
  toggleRoutineActive: (id: string) => void;
  removeRoutine: (id: string) => void;
  reorderSteps: (routineId: string, steps: Step[]) => void;
  reorderTodayRoutineGroups: (
    timeOfDay: TimeOfDay,
    groups: Array<{ steps: Array<{ step: { id: string } }> }>,
  ) => void;
  removeStep: (routineId: string, stepId: string) => void;
  updateStep: (
    routineId: string,
    stepId: string,
    updates: Partial<Pick<Step, 'name' | 'note' | 'productName' | 'productId' | 'done'>>,
  ) => void;
  toggleStepDone: (routineId: string, stepId: string) => void;
  addStep: (routineId: string, input: AddStepInput) => Step | null;
  updateRoutine: (
    routineId: string,
    updates: Partial<Pick<Routine, 'name' | 'category' | 'timeOfDay' | 'active'>>,
  ) => void;
  updateRoutineSchedule: (routineId: string, schedule: Schedule) => void;
  updateStepSchedule: (routineId: string, stepId: string, schedule: Schedule) => void;
  setPendingAddStepSchedule: (schedule: Schedule | null) => void;
  consumePendingAddStepSchedule: () => Schedule | null;
  setPendingGuidedStepScheduleInit: (schedule: Schedule | null) => void;
  consumePendingGuidedStepScheduleInit: () => Schedule | null;
  setPendingGuidedStepScheduleResult: (
    result: { stepIndex: number; schedule: Schedule } | null,
  ) => void;
  consumePendingGuidedStepScheduleResult: () => {
    stepIndex: number;
    schedule: Schedule;
  } | null;
  setPendingGuidedStepProductResult: (
    result: { stepIndex: number; productId: string | null } | null,
  ) => void;
  consumePendingGuidedStepProductResult: () => {
    stepIndex: number;
    productId: string | null;
  } | null;
  addProduct: (input: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id'>>) => void;
  removeProduct: (id: string) => void;
  tagStepProduct: (routineId: string, stepId: string, productId: string | null) => void;
  updateCycleSettings: (updates: Partial<CycleSettings>) => void;
  setCycleEnabled: (enabled: boolean) => void;
};

const AppStoreContext = createContext<AppStoreValue | null>(null);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [credentials, setCredentials] = useState<LocalCredentials | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dailyCompletions, setDailyCompletions] = useState<DailyCompletionMap>({});
  const [cycleSettings, setCycleSettings] = useState<CycleSettings>(DEFAULT_CYCLE_SETTINGS);
  const [todayStepOrders, setTodayStepOrders] =
    useState<TodayStepOrderMap>(EMPTY_TODAY_STEP_ORDERS);
  const [pendingAddStepSchedule, setPendingAddStepSchedule] = useState<Schedule | null>(null);
  const [pendingGuidedStepScheduleInit, setPendingGuidedStepScheduleInit] =
    useState<Schedule | null>(null);
  const [pendingGuidedStepScheduleResult, setPendingGuidedStepScheduleResult] = useState<{
    stepIndex: number;
    schedule: Schedule;
  } | null>(null);
  const [pendingGuidedStepProductResult, setPendingGuidedStepProductResult] = useState<{
    stepIndex: number;
    productId: string | null;
  } | null>(null);
  const skipNextSave = useRef(true);
  const cycleSettingsRef = useRef(cycleSettings);
  cycleSettingsRef.current = cycleSettings;
  const routinesRef = useRef(routines);
  routinesRef.current = routines;

  const applyRoutineUpdate = useCallback((updater: (current: Routine[]) => Routine[]) => {
    setRoutines((current) => {
      const next = updater(current);
      setDailyCompletions((existing) =>
        snapshotTodayCompletion(next, cycleSettingsRef.current, existing),
      );
      setTodayStepOrders((orders) => pruneTodayStepOrders(orders, collectStepIds(next)));
      return next;
    });
  }, []);

  useEffect(() => {
    loadPersistedState().then((state) => {
      const routines = state.routines;
      const loadedCycleSettings = state.cycleSettings ?? DEFAULT_CYCLE_SETTINGS;
      setIsLoggedIn(state.isLoggedIn);
      setUser(state.user);
      setCredentials(state.credentials);
      setRoutines(routines);
      setProducts(state.products);
      setCycleSettings(loadedCycleSettings);
      setDailyCompletions(
        reconcileDailyCompletionsOnLoad(
          routines,
          loadedCycleSettings,
          state.dailyCompletions ?? {},
        ),
      );
      setTodayStepOrders(
        pruneTodayStepOrders(
          state.todayStepOrders ?? EMPTY_TODAY_STEP_ORDERS,
          collectStepIds(routines),
        ),
      );
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    void savePersistedState(
      buildPersistedState({
        isLoggedIn,
        user,
        credentials,
        routines,
        products,
        dailyCompletions,
        cycleSettings,
        todayStepOrders,
      }),
    );
  }, [
    hydrated,
    isLoggedIn,
    user,
    credentials,
    routines,
    products,
    dailyCompletions,
    cycleSettings,
    todayStepOrders,
  ]);

  const signUp = useCallback(
    (input: SignUpInput): string | null => {
      const email = normalizeEmail(input.email);
      const firstName = input.firstName.trim();
      const lastName = input.lastName.trim();

      if (!firstName) return 'First name is required.';
      if (!email) return 'Email is required.';
      if (input.password.length < 8) return 'Password must be at least 8 characters.';

      if (credentials) {
        return 'An account already exists on this device. Log in instead.';
      }

      const nextUser: User = {
        firstName,
        lastName,
        email,
        flowerColorName: defaultFlowerColor.name,
      };

      setUser(nextUser);
      setCredentials({ email, password: input.password });
      setIsLoggedIn(true);
      return null;
    },
    [credentials],
  );

  const signIn = useCallback(
    (input: SignInInput): string | null => {
      const email = normalizeEmail(input.email);

      if (!email || !input.password) return 'Email and password are required.';
      if (!credentials || !user) return 'No account found. Sign up first.';
      if (credentials.email !== email || credentials.password !== input.password) {
        return 'Email or password is incorrect.';
      }

      setIsLoggedIn(true);
      return null;
    },
    [credentials, user],
  );

  const signOut = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...updates } : current));
  }, []);

  const updateAccount = useCallback(
    (input: UpdateAccountInput): string | null => {
      const firstName = input.firstName.trim();
      const lastName = input.lastName.trim();
      const email = normalizeEmail(input.email);
      const flowerColorName = input.flowerColorName.trim();

      if (!firstName) return 'First name is required.';
      if (!email) return 'Email is required.';

      setUser((current) =>
        current
          ? {
              ...current,
              firstName,
              lastName,
              email,
              flowerColorName,
            }
          : current,
      );

      setCredentials((current) => (current ? { ...current, email } : current));
      return null;
    },
    [],
  );

  const resetAllData = useCallback(async () => {
    await clearPersistedState();
    setIsLoggedIn(false);
    setUser(null);
    setCredentials(null);
    setRoutines([]);
    setProducts([]);
    setDailyCompletions({});
    setCycleSettings(DEFAULT_CYCLE_SETTINGS);
    setTodayStepOrders(EMPTY_TODAY_STEP_ORDERS);
    setPendingAddStepSchedule(null);
    setPendingGuidedStepScheduleInit(null);
    setPendingGuidedStepScheduleResult(null);
    setPendingGuidedStepProductResult(null);
  }, []);

  const addRoutine = useCallback(
    (input: CreateRoutineInput) => {
      const routineId = createId('routine');
      const steps: Step[] = input.steps
        .map((stepInput) => ({
          name: stepInput.name.trim(),
          note: stepInput.note?.trim(),
          schedule: stepInput.schedule,
          productId: stepInput.productId,
        }))
        .filter((stepInput) => stepInput.name.length > 0)
        .map((stepInput) => {
          const product = stepInput.productId
            ? products.find((item) => item.id === stepInput.productId)
            : undefined;

          return {
            id: createId('step'),
            name: stepInput.name,
            note: stepInput.note || undefined,
            category: input.category,
            done: false,
            schedule: stepInput.schedule,
            productId: product?.id,
            productName: product?.name,
          };
        });

      const routineSchedule = normalizeSchedule(input.schedule);

      const routine: Routine = {
        id: routineId,
        name: input.name.trim(),
        category: input.category,
        timeOfDay: routineSchedule.timeOfDay,
        active: true,
        steps,
        schedule: routineSchedule,
      };

      applyRoutineUpdate((current) => [...current, routine]);
      return routine;
    },
    [products, applyRoutineUpdate],
  );

  const toggleRoutineActive = useCallback(
    (id: string) => {
      applyRoutineUpdate((current) =>
        current.map((routine) =>
          routine.id === id ? { ...routine, active: !routine.active } : routine,
        ),
      );
    },
    [applyRoutineUpdate],
  );

  const removeRoutine = useCallback(
    (id: string) => {
      applyRoutineUpdate((current) => current.filter((routine) => routine.id !== id));
    },
    [applyRoutineUpdate],
  );

  const reorderSteps = useCallback((routineId: string, steps: Step[]) => {
    setRoutines((current) =>
      current.map((routine) => (routine.id === routineId ? { ...routine, steps } : routine)),
    );
  }, []);

  const reorderTodayRoutineGroups = useCallback(
    (
      timeOfDay: TimeOfDay,
      groups: Array<{ steps: Array<{ step: { id: string } }> }>,
    ) => {
      setTodayStepOrders((orders) => ({
        ...orders,
        [timeOfDay]: mergeReorderedActiveStepIds(orders[timeOfDay] ?? [], groups),
      }));
    },
    [],
  );

  const removeStep = useCallback(
    (routineId: string, stepId: string) => {
      applyRoutineUpdate((current) =>
        current.map((routine) =>
          routine.id === routineId
            ? { ...routine, steps: routine.steps.filter((step) => step.id !== stepId) }
            : routine,
        ),
      );
    },
    [applyRoutineUpdate],
  );

  const updateStep = useCallback(
    (
      routineId: string,
      stepId: string,
      updates: Partial<Pick<Step, 'name' | 'note' | 'productName' | 'productId' | 'done'>>,
    ) => {
      setRoutines((current) =>
        current.map((routine) =>
          routine.id === routineId
            ? {
                ...routine,
                steps: routine.steps.map((step) =>
                  step.id === stepId ? { ...step, ...updates } : step,
                ),
              }
            : routine,
        ),
      );
    },
    [],
  );

  const toggleStepDone = useCallback(
    (routineId: string, stepId: string) => {
      applyRoutineUpdate((current) =>
        current.map((routine) =>
          routine.id === routineId
            ? {
                ...routine,
                steps: routine.steps.map((step) =>
                  step.id === stepId ? { ...step, done: !step.done } : step,
                ),
              }
            : routine,
        ),
      );
    },
    [applyRoutineUpdate],
  );

  const addStep = useCallback(
    (routineId: string, input: AddStepInput) => {
      const trimmedName = input.name.trim();
      if (!trimmedName) return null;

      let created: Step | null = null;

      applyRoutineUpdate((current) =>
        current.map((routine) => {
          if (routine.id !== routineId) return routine;

          created = {
            id: createId('step'),
            name: trimmedName,
            note: input.note?.trim() || undefined,
            category: routine.category,
            done: false,
            schedule: input.schedule,
          };

          return { ...routine, steps: [...routine.steps, created] };
        }),
      );

      return created;
    },
    [applyRoutineUpdate],
  );

  const updateRoutine = useCallback(
    (
      routineId: string,
      updates: Partial<Pick<Routine, 'name' | 'category' | 'timeOfDay' | 'active'>>,
    ) => {
      setRoutines((current) =>
        current.map((routine) => {
          if (routine.id !== routineId) return routine;

          const nextRoutine = { ...routine, ...updates };

          if (updates.category && updates.category !== routine.category) {
            nextRoutine.steps = routine.steps.map((step) => ({
              ...step,
              category: updates.category!,
            }));
          }

          return nextRoutine;
        }),
      );
    },
    [],
  );

  const consumePendingAddStepSchedule = useCallback(() => {
    let schedule: Schedule | null = null;
    setPendingAddStepSchedule((current) => {
      schedule = current;
      return null;
    });
    return schedule;
  }, []);

  const consumePendingGuidedStepScheduleInit = useCallback(() => {
    let schedule: Schedule | null = null;
    setPendingGuidedStepScheduleInit((current) => {
      schedule = current;
      return null;
    });
    return schedule;
  }, []);

  const consumePendingGuidedStepScheduleResult = useCallback(() => {
    let result: { stepIndex: number; schedule: Schedule } | null = null;
    setPendingGuidedStepScheduleResult((current) => {
      result = current;
      return null;
    });
    return result;
  }, []);

  const consumePendingGuidedStepProductResult = useCallback(() => {
    let result: { stepIndex: number; productId: string | null } | null = null;
    setPendingGuidedStepProductResult((current) => {
      result = current;
      return null;
    });
    return result;
  }, []);

  const updateRoutineSchedule = useCallback(
    (routineId: string, schedule: Schedule) => {
      applyRoutineUpdate((current) =>
        current.map((routine) =>
          routine.id === routineId
            ? { ...routine, timeOfDay: schedule.timeOfDay, schedule }
            : routine,
        ),
      );
    },
    [applyRoutineUpdate],
  );

  const updateStepSchedule = useCallback(
    (routineId: string, stepId: string, schedule: Schedule) => {
      applyRoutineUpdate((current) =>
        current.map((routine) =>
          routine.id === routineId
            ? {
                ...routine,
                steps: routine.steps.map((step) =>
                  step.id === stepId ? { ...step, schedule } : step,
                ),
              }
            : routine,
        ),
      );
    },
    [applyRoutineUpdate],
  );

  const addProduct = useCallback((input: Omit<Product, 'id'>) => {
    const product: Product = { ...input, id: createId('product') };
    setProducts((current) => [...current, product]);
    return product;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Omit<Product, 'id'>>) => {
    setProducts((current) =>
      current.map((product) => (product.id === id ? { ...product, ...updates } : product)),
    );

    if (updates.name !== undefined) {
      const nextName = updates.name.trim();
      setRoutines((current) =>
        current.map((routine) => ({
          ...routine,
          steps: routine.steps.map((step) =>
            step.productId === id ? { ...step, productName: nextName } : step,
          ),
        })),
      );
    }
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((current) => current.filter((product) => product.id !== id));
    setRoutines((current) =>
      current.map((routine) => ({
        ...routine,
        steps: routine.steps.map((step) =>
          step.productId === id
            ? { ...step, productId: undefined, productName: undefined }
            : step,
        ),
      })),
    );
  }, []);

  const tagStepProduct = useCallback(
    (routineId: string, stepId: string, productId: string | null) => {
      setRoutines((current) =>
        current.map((routine) => {
          if (routine.id !== routineId) return routine;

          return {
            ...routine,
            steps: routine.steps.map((step) => {
              if (step.id !== stepId) return step;

              if (!productId) {
                return { ...step, productId: undefined, productName: undefined };
              }

              const product = products.find((item) => item.id === productId);
              if (!product) {
                return { ...step, productId: undefined, productName: undefined };
              }

              return {
                ...step,
                productId: product.id,
                productName: product.name,
              };
            }),
          };
        }),
      );
    },
    [products],
  );

  const updateCycleSettings = useCallback((updates: Partial<CycleSettings>) => {
    setCycleSettings((current) => {
      const next = { ...current, ...updates };
      setDailyCompletions((existing) =>
        snapshotTodayCompletion(routinesRef.current, next, existing),
      );
      return next;
    });
  }, []);

  const setCycleEnabled = useCallback((enabled: boolean) => {
    setCycleSettings((current) => {
      const next = {
        ...current,
        enabled,
        lastPeriodStart:
          enabled && !current.lastPeriodStart ? formatDateKey(new Date()) : current.lastPeriodStart,
      };
      setDailyCompletions((existing) =>
        snapshotTodayCompletion(routinesRef.current, next, existing),
      );
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      isLoggedIn,
      user,
      routines,
      products,
      dailyCompletions,
      cycleSettings,
      todayStepOrders,
      pendingAddStepSchedule,
      pendingGuidedStepScheduleInit,
      pendingGuidedStepScheduleResult,
      pendingGuidedStepProductResult,
      signUp,
      signIn,
      signOut,
      updateUser,
      updateAccount,
      resetAllData,
      addRoutine,
      toggleRoutineActive,
      removeRoutine,
      reorderSteps,
      reorderTodayRoutineGroups,
      removeStep,
      updateStep,
      toggleStepDone,
      addStep,
      updateRoutine,
      updateRoutineSchedule,
      updateStepSchedule,
      setPendingAddStepSchedule,
      consumePendingAddStepSchedule,
      setPendingGuidedStepScheduleInit,
      consumePendingGuidedStepScheduleInit,
      setPendingGuidedStepScheduleResult,
      consumePendingGuidedStepScheduleResult,
      setPendingGuidedStepProductResult,
      consumePendingGuidedStepProductResult,
      addProduct,
      updateProduct,
      removeProduct,
      tagStepProduct,
      updateCycleSettings,
      setCycleEnabled,
    }),
    [
      hydrated,
      isLoggedIn,
      user,
      routines,
      products,
      dailyCompletions,
      cycleSettings,
      todayStepOrders,
      pendingAddStepSchedule,
      pendingGuidedStepScheduleInit,
      pendingGuidedStepScheduleResult,
      pendingGuidedStepProductResult,
      signUp,
      signIn,
      signOut,
      updateUser,
      updateAccount,
      resetAllData,
      addRoutine,
      toggleRoutineActive,
      removeRoutine,
      reorderSteps,
      reorderTodayRoutineGroups,
      removeStep,
      updateStep,
      toggleStepDone,
      addStep,
      updateRoutine,
      updateRoutineSchedule,
      updateStepSchedule,
      consumePendingAddStepSchedule,
      consumePendingGuidedStepScheduleInit,
      consumePendingGuidedStepScheduleResult,
      consumePendingGuidedStepProductResult,
      addProduct,
      updateProduct,
      removeProduct,
      tagStepProduct,
      updateCycleSettings,
      setCycleEnabled,
    ],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return context;
}

export function useAuth() {
  const { isLoggedIn, user, signUp, signIn, signOut, updateUser, updateAccount, resetAllData } =
    useAppStore();
  return { isLoggedIn, user, signUp, signIn, signOut, updateUser, updateAccount, resetAllData };
}

export function useCycleSettings() {
  const { cycleSettings, updateCycleSettings, setCycleEnabled } = useAppStore();
  return { cycleSettings, updateCycleSettings, setCycleEnabled };
}

export function useRoutines() {
  const store = useAppStore();
  return {
    routines: store.routines,
    addRoutine: store.addRoutine,
    toggleRoutineActive: store.toggleRoutineActive,
    removeRoutine: store.removeRoutine,
    reorderSteps: store.reorderSteps,
    reorderTodayRoutineGroups: store.reorderTodayRoutineGroups,
    removeStep: store.removeStep,
    updateStep: store.updateStep,
    toggleStepDone: store.toggleStepDone,
    tagStepProduct: store.tagStepProduct,
    addStep: store.addStep,
    updateRoutine: store.updateRoutine,
    updateRoutineSchedule: store.updateRoutineSchedule,
    updateStepSchedule: store.updateStepSchedule,
    pendingAddStepSchedule: store.pendingAddStepSchedule,
    pendingGuidedStepScheduleInit: store.pendingGuidedStepScheduleInit,
    setPendingAddStepSchedule: store.setPendingAddStepSchedule,
    consumePendingAddStepSchedule: store.consumePendingAddStepSchedule,
    setPendingGuidedStepScheduleInit: store.setPendingGuidedStepScheduleInit,
    consumePendingGuidedStepScheduleInit: store.consumePendingGuidedStepScheduleInit,
    setPendingGuidedStepScheduleResult: store.setPendingGuidedStepScheduleResult,
    consumePendingGuidedStepScheduleResult: store.consumePendingGuidedStepScheduleResult,
    setPendingGuidedStepProductResult: store.setPendingGuidedStepProductResult,
    consumePendingGuidedStepProductResult: store.consumePendingGuidedStepProductResult,
  };
}

export function useRoutine(id: string) {
  const { routines } = useRoutines();
  return routines.find((routine) => routine.id === id);
}

export function useProducts() {
  const { products, addProduct, updateProduct, removeProduct } = useAppStore();
  return { products, addProduct, updateProduct, removeProduct };
}

export function useProduct(id: string) {
  const { products } = useAppStore();
  return products.find((product) => product.id === id);
}

export { formatFrequency, formatTimeOfDay } from '@/constants/schedules';
