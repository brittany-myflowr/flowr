import { supabase } from '@/constants/supabase';
import type { DailyCompletionMap } from '@/lib/completion';
import { EMPTY_TODAY_STEP_ORDERS, type TodayStepOrderMap } from '@/lib/todayOrder';
import type { CycleSettings, Product, Routine, User } from '@/types';
import { DEFAULT_CYCLE_SETTINGS } from '@/types';

import {
  assembleRoutines,
  cycleSettingsRowToDomain,
  cycleSettingsToRow,
  dailyCompletionRowsToMap,
  dailyCompletionsToRows,
  flattenRoutinesToRows,
  productRowToProduct,
  productToRow,
  profileRowToUser,
  todayStepOrdersRowToMap,
  todayStepOrdersToRow,
  userToProfileUpdate,
  type CycleSettingsRow,
  type DailyCompletionRow,
  type ProductRow,
  type ProfileRow,
  type RemoteUserData,
  type RoutineRow,
  type StepRow,
  type TodayStepOrdersRow,
} from './mappers';

export type SyncPayload = {
  authUserId: string;
  user: User;
  trialStartedAt: string | null;
  routines: Routine[];
  products: Product[];
  dailyCompletions: DailyCompletionMap;
  cycleSettings: CycleSettings;
  todayStepOrders: TodayStepOrderMap;
};

type ExistingIds = {
  todayStepOrdersId?: string;
  cycleSettingsId?: string;
};

async function fetchExistingIds(userId: string): Promise<ExistingIds> {
  const [ordersResult, cycleResult] = await Promise.all([
    supabase.from('today_step_orders').select('id').eq('user_id', userId).maybeSingle(),
    supabase.from('cycle_settings').select('id').eq('user_id', userId).maybeSingle(),
  ]);

  return {
    todayStepOrdersId: (ordersResult.data as { id: string } | null)?.id,
    cycleSettingsId: (cycleResult.data as { id: string } | null)?.id,
  };
}

export async function fetchRemoteUserData(userId: string): Promise<RemoteUserData | null> {
  const profileResult = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (profileResult.error) throw profileResult.error;

  const profile = profileResult.data as ProfileRow | null;
  if (!profile) return null;

  const [routinesResult, stepsResult, productsResult, completionsResult, ordersResult, cycleResult] =
    await Promise.all([
      supabase.from('routines').select('*').eq('user_id', userId),
      supabase.from('steps').select('*').eq('user_id', userId),
      supabase.from('products').select('*').eq('user_id', userId),
      supabase.from('daily_completions').select('*').eq('user_id', userId),
      supabase.from('today_step_orders').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('cycle_settings').select('*').eq('user_id', userId).maybeSingle(),
    ]);

  for (const result of [
    routinesResult,
    stepsResult,
    productsResult,
    completionsResult,
    ordersResult,
    cycleResult,
  ]) {
    if (result.error) throw result.error;
  }

  const routineRows = (routinesResult.data ?? []) as RoutineRow[];
  const stepRows = (stepsResult.data ?? []) as StepRow[];
  const productRows = (productsResult.data ?? []) as ProductRow[];
  const completionRows = (completionsResult.data ?? []) as DailyCompletionRow[];

  return {
    profile,
    routines: assembleRoutines(routineRows, stepRows),
    products: productRows.map(productRowToProduct),
    dailyCompletions: dailyCompletionRowsToMap(completionRows),
    cycleSettings: cycleSettingsRowToDomain(cycleResult.data as CycleSettingsRow | null),
    todayStepOrders: todayStepOrdersRowToMap(ordersResult.data as TodayStepOrdersRow | null),
    trialStartedAt: profile.trial_started_at,
  };
}

async function deleteOrphans(
  userId: string,
  table: 'routines' | 'steps' | 'products' | 'daily_completions',
  keepIds: string[],
) {
  if (keepIds.length === 0) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from(table).delete().eq('user_id', userId).not('id', 'in', `(${keepIds.join(',')})`);
  if (error) throw error;
}

export async function pushRemoteUserData(payload: SyncPayload): Promise<void> {
  const { authUserId } = payload;
  const existingIds = await fetchExistingIds(authUserId);

  const profileUpdate = userToProfileUpdate(payload.user, payload.trialStartedAt);
  const { error: profileError } = await supabase
    .from('profiles')
    .update(profileUpdate)
    .eq('id', authUserId);

  if (profileError) throw profileError;

  const productRows = payload.products.map((product) => productToRow(product, authUserId));
  if (productRows.length > 0) {
    const { error } = await supabase.from('products').upsert(productRows, { onConflict: 'id' });
    if (error) throw error;
  }
  await deleteOrphans(
    authUserId,
    'products',
    payload.products.map((product) => product.id),
  );

  const { routineRows, stepRows } = flattenRoutinesToRows(payload.routines, authUserId);
  if (routineRows.length > 0) {
    const { error } = await supabase.from('routines').upsert(routineRows, { onConflict: 'id' });
    if (error) throw error;
  }
  await deleteOrphans(
    authUserId,
    'routines',
    payload.routines.map((routine) => routine.id),
  );

  if (stepRows.length > 0) {
    const { error } = await supabase.from('steps').upsert(stepRows, { onConflict: 'id' });
    if (error) throw error;
  }
  await deleteOrphans(
    authUserId,
    'steps',
    payload.routines.flatMap((routine) => routine.steps.map((step) => step.id)),
  );

  const completionRows = dailyCompletionsToRows(payload.dailyCompletions, authUserId);
  if (completionRows.length > 0) {
    const { error } = await supabase.from('daily_completions').upsert(completionRows, {
      onConflict: 'user_id,date',
    });
    if (error) throw error;

    const { data: existingRows, error: fetchError } = await supabase
      .from('daily_completions')
      .select('id, date')
      .eq('user_id', authUserId);

    if (fetchError) throw fetchError;

    const keepDates = new Set(completionRows.map((row) => row.date));
    const orphanIds = ((existingRows ?? []) as Array<{ id: string; date: string }>)
      .filter((row) => !keepDates.has(row.date))
      .map((row) => row.id);

    if (orphanIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('daily_completions')
        .delete()
        .in('id', orphanIds);
      if (deleteError) throw deleteError;
    }
  } else {
    const { error } = await supabase.from('daily_completions').delete().eq('user_id', authUserId);
    if (error) throw error;
  }

  const ordersRow = todayStepOrdersToRow(
    payload.todayStepOrders,
    authUserId,
    existingIds.todayStepOrdersId,
  );
  const { error: ordersError } = await supabase
    .from('today_step_orders')
    .upsert(ordersRow, { onConflict: 'user_id' });
  if (ordersError) throw ordersError;

  const cycleRow = cycleSettingsToRow(
    payload.cycleSettings,
    authUserId,
    existingIds.cycleSettingsId,
  );
  const { error: cycleError } = await supabase
    .from('cycle_settings')
    .upsert(cycleRow, { onConflict: 'user_id' });
  if (cycleError) throw cycleError;
}

export function remoteDataToAppState(remote: RemoteUserData, authUserId: string) {
  return {
    authUserId,
    isLoggedIn: true,
    user: profileRowToUser(remote.profile),
    trialStartedAt: remote.trialStartedAt,
    routines: remote.routines,
    products: remote.products,
    dailyCompletions: remote.dailyCompletions,
    cycleSettings: remote.cycleSettings ?? DEFAULT_CYCLE_SETTINGS,
    todayStepOrders: remote.todayStepOrders ?? EMPTY_TODAY_STEP_ORDERS,
  };
}

export async function remoteHasAnyUserData(userId: string): Promise<boolean> {
  const remote = await fetchRemoteUserData(userId);
  if (!remote) return false;

  return (
    remote.routines.length > 0 ||
    remote.products.length > 0 ||
    Object.keys(remote.dailyCompletions).length > 0
  );
}
