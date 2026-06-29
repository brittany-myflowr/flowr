import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { supabase } from '@/constants/supabase';


import { createId } from '@/lib/createId';
import { buildDuplicateRoutineName } from '@/lib/routineNames';
import { defaultScheduleForTimeOfDay, normalizeSchedule, cloneSchedule } from '@/constants/schedules';
import {
  type DailyCompletionMap,
  pruneDailyCompletions,
  reconcileDailyCompletionsOnLoad,
  snapshotTodayCompletion,
} from '@/lib/completion';
import { reconcileStepProducts } from '@/lib/reconcile';
import { isValidEmail } from '@/lib/validation';
import {
  buildPersistedState,
  clearPersistedState,
  loadPersistedState,
  savePersistedState,
} from '@/lib/persistence';
import {
  ACCOUNT_DELETION_GRACE_DAYS,
  getCurrentSessionUserId,
  fetchProfile,
  requestPasswordReset,
  scheduleAccountDeletion,
  signInWithSupabase,
  signInWithAppleFromCredential,
  signInWithGoogleFromCredential,
  signOutFromSupabase,
  signUpWithSupabase,
  updateAccountEmail,
  updatePassword as updatePasswordInSupabase,
} from '@/lib/supabase/auth';
import { getAppleCredential, getGoogleCredential } from '@/lib/socialAuth';
import { checkOnline } from '@/lib/supabase/network';
import { profileRowToUser } from '@/lib/supabase/mappers';
import {
  fetchRemoteUserData,
  pushRemoteUserData,
  remoteDataToAppState,
  remoteHasAnyUserData,
  type SyncPayload,
} from '@/lib/supabase/sync';
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
import { runPremiumMutation, runPremiumMutationVoid } from '@/lib/premiumGate';
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
  productId?: string;
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
  checkAuthenticated: () => boolean;
  user: User | null;
  trialStartedAt: string | null;
  routines: Routine[];
  products: Product[];
  dailyCompletions: DailyCompletionMap;
  cycleSettings: CycleSettings;
  todayStepOrders: TodayStepOrderMap;
  pendingAddStepSchedule: Schedule | null;
  pendingAddStepProduct: string | null;
  pendingGuidedStepScheduleInit: Schedule | null;
  pendingGuidedStepScheduleResult: { stepIndex: number; schedule: Schedule } | null;
  pendingGuidedStepProductResult: { stepIndex: number; productId: string | null } | null;
  signUp: (input: SignUpInput) => Promise<string | null>;
  signIn: (input: SignInInput) => Promise<string | null>;
  signInWithApple: () => Promise<string | null | undefined>;
  signInWithGoogle: () => Promise<string | null | undefined>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  updateAccount: (input: UpdateAccountInput) => Promise<string | null>;
  resetAllData: () => Promise<void>;
  deleteAccount: () => Promise<string | null>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  addRoutine: (input: CreateRoutineInput) => Routine | null;
  duplicateRoutine: (routineId: string) => Routine | null;
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
  setPendingAddStepProduct: (productId: string | null) => void;
  consumePendingAddStepProduct: () => string | null;
  setPendingTagProductSelection: (productId: string) => void;
  consumePendingTagProductSelection: () => string | undefined;
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
  addProduct: (input: Omit<Product, 'id'>) => Product | null;
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
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [pendingSync, setPendingSync] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [trialStartedAt, setTrialStartedAt] = useState<string | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dailyCompletions, setDailyCompletions] = useState<DailyCompletionMap>({});
  const [cycleSettings, setCycleSettings] = useState<CycleSettings>(DEFAULT_CYCLE_SETTINGS);
  const [todayStepOrders, setTodayStepOrders] =
    useState<TodayStepOrderMap>(EMPTY_TODAY_STEP_ORDERS);
  const [pendingAddStepSchedule, setPendingAddStepSchedule] = useState<Schedule | null>(null);
  const [pendingAddStepProduct, setPendingAddStepProduct] = useState<string | null>(null);
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
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);
  const pendingTagProductSelectionRef = useRef<string | undefined>(undefined);
  const isLoggedInRef = useRef(false);
  const authUserIdRef = useRef<string | null>(null);
  const pendingSyncRef = useRef(pendingSync);
  pendingSyncRef.current = pendingSync;
  const cycleSettingsRef = useRef(cycleSettings);
  cycleSettingsRef.current = cycleSettings;
  const routinesRef = useRef(routines);
  routinesRef.current = routines;
  const productsRef = useRef(products);
  productsRef.current = products;
  const dailyCompletionsRef = useRef(dailyCompletions);
  dailyCompletionsRef.current = dailyCompletions;
  const todayStepOrdersRef = useRef(todayStepOrders);
  todayStepOrdersRef.current = todayStepOrders;
  const userRef = useRef(user);
  userRef.current = user;
  const trialStartedAtRef = useRef(trialStartedAt);
  trialStartedAtRef.current = trialStartedAt;

  const applyRoutineUpdate = useCallback((updater: (current: Routine[]) => Routine[]) => {
    setRoutines((current) => {
      const next = updater(current);
      routinesRef.current = next;
      const stepIds = new Set(collectStepIds(next));
      setDailyCompletions((existing) => {
        const updated = snapshotTodayCompletion(
          next,
          cycleSettingsRef.current,
          pruneDailyCompletions(existing, stepIds),
        );
        dailyCompletionsRef.current = updated;
        return updated;
      });
      setTodayStepOrders((orders) => {
        const updated = pruneTodayStepOrders(orders, collectStepIds(next));
        todayStepOrdersRef.current = updated;
        return updated;
      });
      return next;
    });
  }, []);

  const applyLoadedState = useCallback(
    (input: {
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
    }) => {
      isLoggedInRef.current = input.isLoggedIn;
      authUserIdRef.current = input.authUserId;
      userRef.current = input.user;
      trialStartedAtRef.current = input.trialStartedAt;
      routinesRef.current = input.routines;
      productsRef.current = input.products;
      dailyCompletionsRef.current = input.dailyCompletions;
      cycleSettingsRef.current = input.cycleSettings;
      todayStepOrdersRef.current = input.todayStepOrders;
      setAuthUserId(input.authUserId);
      setIsLoggedIn(input.isLoggedIn);
      setUser(input.user);
      setTrialStartedAt(input.trialStartedAt);
      setRoutines(input.routines);
      setProducts(input.products);
      setDailyCompletions(input.dailyCompletions);
      setCycleSettings(input.cycleSettings);
      setTodayStepOrders(input.todayStepOrders);
      setPendingSync(input.pendingSync ?? false);
    },
    [],
  );

  const buildSyncPayload = useCallback((): SyncPayload | null => {
    if (!authUserIdRef.current || !userRef.current) {
      console.log('[sync] buildSyncPayload skipped', {
        authUserId: authUserIdRef.current,
        hasUser: Boolean(userRef.current),
        isLoggedInRef: isLoggedInRef.current,
      });
      return null;
    }

    const payload = {
      authUserId: authUserIdRef.current,
      user: userRef.current,
      trialStartedAt: trialStartedAtRef.current,
      routines: routinesRef.current,
      products: productsRef.current,
      dailyCompletions: dailyCompletionsRef.current,
      cycleSettings: cycleSettingsRef.current,
      todayStepOrders: todayStepOrdersRef.current,
    };

    console.log('[sync] buildSyncPayload', {
      authUserId: payload.authUserId,
      routineCount: payload.routines.length,
      stepCount: payload.routines.reduce((count, routine) => count + routine.steps.length, 0),
      productCount: payload.products.length,
    });

    return payload;
  }, []);

  const flushRemoteSync = useCallback(async () => {
    console.log('[sync] flushRemoteSync attempted', {
      isSyncing: isSyncingRef.current,
      pendingSync: pendingSyncRef.current,
    });

    const payload = buildSyncPayload();
    if (!payload) {
      console.log('[sync] flushRemoteSync skipped: no payload');
      return;
    }

    if (isSyncingRef.current) {
      console.log('[sync] flushRemoteSync skipped: sync already in progress');
      return;
    }

    const online = await checkOnline();
    if (!online) {
      console.log('[sync] flushRemoteSync skipped: offline or Supabase unavailable');
      setPendingSync(true);
      return;
    }

    isSyncingRef.current = true;
    try {
      await pushRemoteUserData(payload);
      setPendingSync(false);
      await savePersistedState(
        buildPersistedState({
          authUserId: payload.authUserId,
          isLoggedIn: true,
          user: payload.user,
          trialStartedAt: payload.trialStartedAt,
          routines: payload.routines,
          products: payload.products,
          dailyCompletions: payload.dailyCompletions,
          cycleSettings: payload.cycleSettings,
          todayStepOrders: payload.todayStepOrders,
          pendingSync: false,
          lastSyncedAt: new Date().toISOString(),
        }),
      );
      console.log('[sync] flushRemoteSync completed');
    } catch (error) {
      console.log('[sync] flushRemoteSync failed', error);
      setPendingSync(true);
    } finally {
      isSyncingRef.current = false;
    }
  }, [buildSyncPayload]);

  const queueRemoteSync = useCallback(() => {
    if (!authUserIdRef.current || !isLoggedInRef.current) {
      console.log('[sync] queueRemoteSync skipped', {
        authUserId: authUserIdRef.current,
        isLoggedInRef: isLoggedInRef.current,
      });
      return;
    }

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    console.log('[sync] queueRemoteSync scheduled', {
      authUserId: authUserIdRef.current,
      routineCount: routinesRef.current.length,
    });

    syncTimerRef.current = setTimeout(() => {
      console.log('[sync] queueRemoteSync debounce fired');
      void flushRemoteSync();
    }, 1200);
  }, [flushRemoteSync]);

  const flushRemoteSyncRef = useRef(flushRemoteSync);
  flushRemoteSyncRef.current = flushRemoteSync;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const cached = await loadPersistedState();
      if (cancelled) return;

      const cachedRoutines = reconcileStepProducts(cached.routines, cached.products);
      const cachedCycleSettings = cached.cycleSettings ?? DEFAULT_CYCLE_SETTINGS;

      const sessionUserId = await getCurrentSessionUserId();
      if (cancelled) return;

      if (sessionUserId) {
        try {
          const online = await checkOnline();
          if (online) {
            const remote = await fetchRemoteUserData(sessionUserId);
            if (remote && !cancelled) {
              const hasRemoteData = await remoteHasAnyUserData(sessionUserId);
              const shouldMigrateLocal =
                !hasRemoteData &&
                (cachedRoutines.length > 0 ||
                  cached.products.length > 0 ||
                  Object.keys(cached.dailyCompletions).length > 0) &&
                (cached.authUserId === sessionUserId || cached.authUserId === null);

              if (shouldMigrateLocal) {
                applyLoadedState({
                  authUserId: sessionUserId,
                  isLoggedIn: true,
                  user: cached.user
                    ? { ...cached.user, id: sessionUserId }
                    : profileRowToUser(remote.profile),
                  trialStartedAt: cached.trialStartedAt,
                  routines: cachedRoutines,
                  products: cached.products,
                  dailyCompletions: reconcileDailyCompletionsOnLoad(
                    cachedRoutines,
                    cachedCycleSettings,
                    cached.dailyCompletions,
                  ),
                  cycleSettings: cachedCycleSettings,
                  todayStepOrders: pruneTodayStepOrders(
                    cached.todayStepOrders ?? EMPTY_TODAY_STEP_ORDERS,
                    collectStepIds(cachedRoutines),
                  ),
                  pendingSync: true,
                });
                setHydrated(true);
                void flushRemoteSyncRef.current();
                return;
              }

              const appState = remoteDataToAppState(remote, sessionUserId);
              applyLoadedState({
                ...appState,
                routines: reconcileStepProducts(appState.routines, appState.products),
                dailyCompletions: reconcileDailyCompletionsOnLoad(
                  appState.routines,
                  appState.cycleSettings,
                  appState.dailyCompletions,
                ),
                todayStepOrders: pruneTodayStepOrders(
                  appState.todayStepOrders,
                  collectStepIds(appState.routines),
                ),
                pendingSync: false,
              });
              setHydrated(true);
              return;
            }
          }
        } catch {
          // Fall back to cache below.
        }

        if (!cancelled && cached.authUserId === sessionUserId && cached.isLoggedIn && cached.user) {
          applyLoadedState({
            authUserId: sessionUserId,
            isLoggedIn: true,
            user: cached.user,
            trialStartedAt: cached.trialStartedAt,
            routines: cachedRoutines,
            products: cached.products,
            dailyCompletions: reconcileDailyCompletionsOnLoad(
              cachedRoutines,
              cachedCycleSettings,
              cached.dailyCompletions,
            ),
            cycleSettings: cachedCycleSettings,
            todayStepOrders: pruneTodayStepOrders(
              cached.todayStepOrders ?? EMPTY_TODAY_STEP_ORDERS,
              collectStepIds(cachedRoutines),
            ),
            pendingSync: cached.pendingSync || true,
          });
          setHydrated(true);
          void flushRemoteSyncRef.current();
          return;
        }
      }

      if (!cancelled) {
        if (isLoggedInRef.current || (await getCurrentSessionUserId())) {
          setHydrated(true);
          return;
        }

        applyLoadedState({
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
        });
        setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [applyLoadedState]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        isLoggedInRef.current = true;
        authUserIdRef.current = session.user.id;
        return;
      }

      if (event !== 'SIGNED_OUT') return;

      isLoggedInRef.current = false;
      authUserIdRef.current = null;
      setIsLoggedIn(false);
      setAuthUserId(null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && pendingSyncRef.current) {
        void flushRemoteSync();
      }
    });

    return () => subscription.remove();
  }, [flushRemoteSync]);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    void savePersistedState(
      buildPersistedState({
        authUserId,
        isLoggedIn,
        user,
        trialStartedAt,
        routines,
        products,
        dailyCompletions,
        cycleSettings,
        todayStepOrders,
        pendingSync,
      }),
    );

    queueRemoteSync();
  }, [
    hydrated,
    authUserId,
    isLoggedIn,
    user,
    trialStartedAt,
    routines,
    products,
    dailyCompletions,
    cycleSettings,
    todayStepOrders,
    pendingSync,
    queueRemoteSync,
  ]);

  const signUp = useCallback(async (input: SignUpInput): Promise<string | null> => {
    const result = await signUpWithSupabase(input);
    if (result.error) return result.error;

    skipNextSave.current = false;
    applyLoadedState({
      authUserId: result.userId,
      isLoggedIn: true,
      user: result.user,
      trialStartedAt: result.trialStartedAt,
      routines: [],
      products: [],
      dailyCompletions: {},
      cycleSettings: DEFAULT_CYCLE_SETTINGS,
      todayStepOrders: EMPTY_TODAY_STEP_ORDERS,
      pendingSync: true,
    });
    queueRemoteSync();
    return null;
  }, [applyLoadedState, queueRemoteSync]);

  const checkAuthenticated = useCallback(
    () => isLoggedInRef.current || isLoggedIn,
    [isLoggedIn],
  );

  const hydrateSignedInUser = useCallback(
    async (result: {
      userId: string;
      user: User;
      trialStartedAt: string | null;
    }): Promise<void> => {
      skipNextSave.current = true;

      try {
        const online = await checkOnline();
        if (online) {
          const remote = await fetchRemoteUserData(result.userId);
          if (remote) {
            const appState = remoteDataToAppState(remote, result.userId);
            applyLoadedState({
              ...appState,
              routines: reconcileStepProducts(appState.routines, appState.products),
              dailyCompletions: reconcileDailyCompletionsOnLoad(
                appState.routines,
                appState.cycleSettings,
                appState.dailyCompletions,
              ),
              todayStepOrders: pruneTodayStepOrders(
                appState.todayStepOrders,
                collectStepIds(appState.routines),
              ),
              pendingSync: false,
            });
            return;
          }
        }
      } catch {
        // Fall back to cached profile below.
      }

      isLoggedInRef.current = true;
      authUserIdRef.current = result.userId;
      setAuthUserId(result.userId);
      setUser(result.user);
      setTrialStartedAt(result.trialStartedAt);
      setIsLoggedIn(true);
      setPendingSync(true);
      queueRemoteSync();
    },
    [applyLoadedState, queueRemoteSync],
  );

  const signIn = useCallback(async (input: SignInInput): Promise<string | null> => {
    const result = await signInWithSupabase(input);
    if (result.error) return result.error;

    await hydrateSignedInUser(result);
    return null;
  }, [hydrateSignedInUser]);

  const signInWithApple = useCallback(async (): Promise<string | null | undefined> => {
    try {
      const appleCredential = await getAppleCredential();
      if (appleCredential === 'cancelled') return undefined;

      const result = await signInWithAppleFromCredential(appleCredential);
      if (result.error) return result.error;

      await hydrateSignedInUser(result);
      return null;
    } catch (error) {
      console.log('[signInWithApple] failed', error);
      return error instanceof Error ? error.message : 'Could not sign in with Apple.';
    }
  }, [hydrateSignedInUser]);

  const signInWithGoogle = useCallback(async (): Promise<string | null | undefined> => {
    try {
      const googleCredential = await getGoogleCredential();
      if (googleCredential === 'cancelled') return undefined;

      const result = await signInWithGoogleFromCredential(googleCredential);
      if (result.error) return result.error;

      await hydrateSignedInUser(result);
      return null;
    } catch (error) {
      console.log('[signInWithGoogle] failed', error);
      return error instanceof Error ? error.message : 'Could not sign in with Google.';
    }
  }, [hydrateSignedInUser]);

  const signOut = useCallback(async () => {
    await signOutFromSupabase();
    isLoggedInRef.current = false;
    authUserIdRef.current = null;
    setIsLoggedIn(false);
    setAuthUserId(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...updates } : current));
  }, []);

  const updateAccount = useCallback(
    async (input: UpdateAccountInput): Promise<string | null> => {
      const firstName = input.firstName.trim();
      const lastName = input.lastName.trim();
      const email = normalizeEmail(input.email);
      const flowerColorName = input.flowerColorName.trim();

      if (!firstName) return 'First name is required.';
      if (!lastName.trim()) return 'Last name is required.';
      if (!email) return 'Email is required.';
      if (!isValidEmail(email)) return 'Enter a valid email address.';
      if (!user || !authUserId) return 'Not signed in.';

      if (email !== user.email) {
        const emailError = await updateAccountEmail(email);
        if (emailError) return emailError;
      }

      setUser({
        ...user,
        firstName,
        lastName,
        email,
        flowerColorName,
      });

      return null;
    },
    [authUserId, user],
  );

  const resetAllData = useCallback(async () => {
    await signOutFromSupabase();
    await clearPersistedState();
    isLoggedInRef.current = false;
    authUserIdRef.current = null;
    setIsLoggedIn(false);
    setAuthUserId(null);
    setUser(null);
    setTrialStartedAt(null);
    setRoutines([]);
    setProducts([]);
    setDailyCompletions({});
    setCycleSettings(DEFAULT_CYCLE_SETTINGS);
    setTodayStepOrders(EMPTY_TODAY_STEP_ORDERS);
    setPendingSync(false);
    setPendingAddStepSchedule(null);
    setPendingAddStepProduct(null);
    setPendingGuidedStepScheduleInit(null);
    setPendingGuidedStepScheduleResult(null);
    setPendingGuidedStepProductResult(null);
  }, []);

  const deleteAccount = useCallback(async (): Promise<string | null> => {
    if (!authUserId) return 'Not signed in.';

    const error = await scheduleAccountDeletion(authUserId);
    if (error) return error;

    await clearPersistedState();
    setIsLoggedIn(false);
    setAuthUserId(null);
    setUser(null);
    setTrialStartedAt(null);
    setRoutines([]);
    setProducts([]);
    setDailyCompletions({});
    setCycleSettings(DEFAULT_CYCLE_SETTINGS);
    setTodayStepOrders(EMPTY_TODAY_STEP_ORDERS);
    setPendingSync(false);
    return null;
  }, [authUserId]);

  const updatePassword = useCallback(async (password: string): Promise<string | null> => {
    return updatePasswordInSupabase(password);
  }, []);

  const addRoutine = useCallback(
    (input: CreateRoutineInput) =>
      runPremiumMutation(() => {
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
      }),
    [products, applyRoutineUpdate],
  );

  const duplicateRoutine = useCallback(
    (routineId: string) =>
      runPremiumMutation(() => {
        let created: Routine | null = null;

        applyRoutineUpdate((current) => {
          const source = current.find((routine) => routine.id === routineId);
          if (!source) return current;

          created = {
            id: createId('routine'),
            name: buildDuplicateRoutineName(source.name),
            category: source.category,
            timeOfDay: source.timeOfDay,
            active: false,
            schedule: cloneSchedule(source.schedule),
            steps: source.steps.map((step) => ({
              id: createId('step'),
              name: step.name,
              note: step.note,
              category: step.category,
              done: false,
              productId: step.productId,
              productName: step.productName,
              schedule: step.schedule ? cloneSchedule(step.schedule) : undefined,
            })),
          };

          let insertIndex = current.length;
          for (let i = current.length - 1; i >= 0; i -= 1) {
            if (current[i].timeOfDay === source.timeOfDay) {
              insertIndex = i + 1;
              break;
            }
          }

          const next = [...current];
          next.splice(insertIndex, 0, created);
          return next;
        });

        return created;
      }),
    [applyRoutineUpdate],
  );

  const toggleRoutineActive = useCallback(
    (id: string) => {
      runPremiumMutationVoid(() => {
        applyRoutineUpdate((current) =>
          current.map((routine) =>
            routine.id === id ? { ...routine, active: !routine.active } : routine,
          ),
        );
      });
    },
    [applyRoutineUpdate],
  );

  const removeRoutine = useCallback(
    (id: string) => {
      runPremiumMutationVoid(() => {
        applyRoutineUpdate((current) => current.filter((routine) => routine.id !== id));
      });
    },
    [applyRoutineUpdate],
  );

  const reorderSteps = useCallback((routineId: string, steps: Step[]) => {
    runPremiumMutationVoid(() => {
      setRoutines((current) =>
        current.map((routine) => (routine.id === routineId ? { ...routine, steps } : routine)),
      );
    });
  }, []);

  const reorderTodayRoutineGroups = useCallback(
    (
      timeOfDay: TimeOfDay,
      groups: Array<{ steps: Array<{ step: { id: string } }> }>,
    ) => {
      runPremiumMutationVoid(() => {
        setTodayStepOrders((orders) => ({
          ...orders,
          [timeOfDay]: mergeReorderedActiveStepIds(orders[timeOfDay] ?? [], groups),
        }));
      });
    },
    [],
  );

  const removeStep = useCallback(
    (routineId: string, stepId: string) => {
      runPremiumMutationVoid(() => {
        applyRoutineUpdate((current) =>
          current.map((routine) =>
            routine.id === routineId
              ? { ...routine, steps: routine.steps.filter((step) => step.id !== stepId) }
              : routine,
          ),
        );
      });
    },
    [applyRoutineUpdate],
  );

  const updateStep = useCallback(
    (
      routineId: string,
      stepId: string,
      updates: Partial<Pick<Step, 'name' | 'note' | 'productName' | 'productId' | 'done'>>,
    ) => {
      runPremiumMutationVoid(() => {
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
      });
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
    (routineId: string, input: AddStepInput) =>
      runPremiumMutation(() => {
        const trimmedName = input.name.trim();
        if (!trimmedName) return null;

        const product = input.productId
          ? products.find((item) => item.id === input.productId)
          : undefined;

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
              productId: product?.id,
              productName: product?.name,
            };

            return { ...routine, steps: [...routine.steps, created] };
          }),
        );

        return created;
      }),
    [applyRoutineUpdate, products],
  );

  const updateRoutine = useCallback(
    (
      routineId: string,
      updates: Partial<Pick<Routine, 'name' | 'category' | 'timeOfDay' | 'active'>>,
    ) => {
      runPremiumMutationVoid(() => {
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
      });
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

  const consumePendingAddStepProduct = useCallback(() => {
    let productId: string | null = null;
    setPendingAddStepProduct((current) => {
      productId = current;
      return null;
    });
    return productId;
  }, []);

  const setPendingTagProductSelection = useCallback((productId: string) => {
    pendingTagProductSelectionRef.current = productId;
  }, []);

  const consumePendingTagProductSelection = useCallback(() => {
    const productId = pendingTagProductSelectionRef.current;
    pendingTagProductSelectionRef.current = undefined;
    return productId;
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
      runPremiumMutationVoid(() => {
        applyRoutineUpdate((current) =>
          current.map((routine) =>
            routine.id === routineId
              ? { ...routine, timeOfDay: schedule.timeOfDay, schedule }
              : routine,
          ),
        );
      });
    },
    [applyRoutineUpdate],
  );

  const updateStepSchedule = useCallback(
    (routineId: string, stepId: string, schedule: Schedule) => {
      runPremiumMutationVoid(() => {
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
      });
    },
    [applyRoutineUpdate],
  );

  const addProduct = useCallback(
    (input: Omit<Product, 'id'>) =>
      runPremiumMutation(() => {
        const product: Product = { ...input, id: createId('product') };
        setProducts((current) => [...current, product]);
        return product;
      }),
    [],
  );

  const updateProduct = useCallback((id: string, updates: Partial<Omit<Product, 'id'>>) => {
    runPremiumMutationVoid(() => {
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
    });
  }, []);

  const removeProduct = useCallback((id: string) => {
    runPremiumMutationVoid(() => {
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
      setPendingAddStepProduct((current) => (current === id ? null : current));
      setPendingGuidedStepProductResult((current) =>
        current?.productId === id ? { ...current, productId: null } : current,
      );
    });
  }, []);

  const tagStepProduct = useCallback(
    (routineId: string, stepId: string, productId: string | null) => {
      runPremiumMutationVoid(() => {
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
      });
    },
    [products],
  );

  const updateCycleSettings = useCallback((updates: Partial<CycleSettings>) => {
    runPremiumMutationVoid(() => {
      setCycleSettings((current) => {
        const next = { ...current, ...updates };
        setDailyCompletions((existing) =>
          snapshotTodayCompletion(routinesRef.current, next, existing),
        );
        return next;
      });
    });
  }, []);

  const setCycleEnabled = useCallback((enabled: boolean) => {
    runPremiumMutationVoid(() => {
      setCycleSettings((current) => {
        const next = {
          ...current,
          enabled,
          lastPeriodStart:
            enabled && !current.lastPeriodStart
              ? formatDateKey(new Date())
              : current.lastPeriodStart,
        };
        setDailyCompletions((existing) =>
          snapshotTodayCompletion(routinesRef.current, next, existing),
        );
        return next;
      });
    });
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      isLoggedIn,
      checkAuthenticated,
      user,
      trialStartedAt,
      routines,
      products,
      dailyCompletions,
      cycleSettings,
      todayStepOrders,
      pendingAddStepSchedule,
      pendingAddStepProduct,
      pendingGuidedStepScheduleInit,
      pendingGuidedStepScheduleResult,
      pendingGuidedStepProductResult,
      signUp,
      signIn,
      signInWithApple,
      signInWithGoogle,
      signOut,
      updateUser,
      updateAccount,
      deleteAccount,
      requestPasswordReset,
      updatePassword,
      resetAllData,
      addRoutine,
      duplicateRoutine,
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
      setPendingAddStepProduct,
      consumePendingAddStepProduct,
      setPendingTagProductSelection,
      consumePendingTagProductSelection,
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
      checkAuthenticated,
      user,
      trialStartedAt,
      routines,
      products,
      dailyCompletions,
      cycleSettings,
      todayStepOrders,
      pendingAddStepSchedule,
      pendingAddStepProduct,
      pendingGuidedStepScheduleInit,
      pendingGuidedStepScheduleResult,
      pendingGuidedStepProductResult,
      signUp,
      signIn,
      signInWithApple,
      signInWithGoogle,
      signOut,
      updateUser,
      updateAccount,
      deleteAccount,
      requestPasswordReset,
      updatePassword,
      resetAllData,
      addRoutine,
      duplicateRoutine,
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
      consumePendingAddStepProduct,
      setPendingTagProductSelection,
      consumePendingTagProductSelection,
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
  const {
    isLoggedIn,
    user,
    signUp,
    signIn,
    signInWithApple,
    signInWithGoogle,
    signOut,
    updateUser,
    updateAccount,
    resetAllData,
    deleteAccount,
    requestPasswordReset,
    updatePassword,
  } = useAppStore();
  return {
    isLoggedIn,
    user,
    signUp,
    signIn,
    signInWithApple,
    signInWithGoogle,
    signOut,
    updateUser,
    updateAccount,
    resetAllData,
    deleteAccount,
    requestPasswordReset,
    updatePassword,
  };
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
    duplicateRoutine: store.duplicateRoutine,
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
    pendingAddStepProduct: store.pendingAddStepProduct,
    pendingGuidedStepScheduleInit: store.pendingGuidedStepScheduleInit,
    setPendingAddStepSchedule: store.setPendingAddStepSchedule,
    consumePendingAddStepSchedule: store.consumePendingAddStepSchedule,
    setPendingAddStepProduct: store.setPendingAddStepProduct,
    consumePendingAddStepProduct: store.consumePendingAddStepProduct,
    setPendingTagProductSelection: store.setPendingTagProductSelection,
    consumePendingTagProductSelection: store.consumePendingTagProductSelection,
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
