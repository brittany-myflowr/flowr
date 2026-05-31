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
  console.log('[pushRemoteUserData] deleteOrphans', { table, userId, keepCount: keepIds.length });

  if (keepIds.length === 0) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId);
    if (error) {
      console.log('[pushRemoteUserData] deleteOrphans empty keepIds failed', { table, error });
      throw error;
    }
    return;
  }

  const { data: existingRows, error: fetchError } = await supabase
    .from(table)
    .select('id')
    .eq('user_id', userId);

  if (fetchError) {
    console.log('[pushRemoteUserData] deleteOrphans fetch failed', { table, error: fetchError });
    throw fetchError;
  }

  const keepIdSet = new Set(keepIds);
  const orphanIds = ((existingRows ?? []) as Array<{ id: string }>)
    .map((row) => row.id)
    .filter((id) => !keepIdSet.has(id));

  if (orphanIds.length === 0) return;

  const { error } = await supabase.from(table).delete().in('id', orphanIds);
  if (error) {
    console.log('[pushRemoteUserData] deleteOrphans delete failed', { table, orphanIds, error });
    throw error;
  }
}

export async function pushRemoteUserData(payload: SyncPayload): Promise<void> {
  const { authUserId } = payload;
  const { routineRows, stepRows } = flattenRoutinesToRows(payload.routines, authUserId);

  console.log('[pushRemoteUserData] starting sync', {
    authUserId,
    routineCount: payload.routines.length,
    stepCount: stepRows.length,
    productCount: payload.products.length,
    completionCount: Object.keys(payload.dailyCompletions).length,
    routineIds: payload.routines.map((routine) => routine.id),
    stepIds: stepRows.map((step) => step.id),
  });

  try {
    const existingIds = await fetchExistingIds(authUserId);

    console.log('[pushRemoteUserData] updating profile');
    const profileUpdate = userToProfileUpdate(payload.user, payload.trialStartedAt);
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', authUserId);

    if (profileError) throw profileError;

    const productRows = payload.products.map((product) => productToRow(product, authUserId));
    console.log('[pushRemoteUserData] upserting products', { count: productRows.length });
    if (productRows.length > 0) {
      const { error } = await supabase.from('products').upsert(productRows, { onConflict: 'id' });
      if (error) throw error;
    }
    await deleteOrphans(
      authUserId,
      'products',
      payload.products.map((product) => product.id),
    );

    console.log('[pushRemoteUserData] upserting routines', {
      count: routineRows.length,
      rows: routineRows.map((row) => ({ id: row.id, name: row.name, user_id: row.user_id })),
    });
    if (routineRows.length > 0) {
      const { data: routineData, error } = await supabase
        .from('routines')
        .upsert(routineRows, { onConflict: 'id' })
        .select('id');
      if (error) throw error;
      console.log('[pushRemoteUserData] routines upserted', { returnedIds: routineData?.map((row) => row.id) });
    }
    await deleteOrphans(
      authUserId,
      'routines',
      payload.routines.map((routine) => routine.id),
    );

    console.log('[pushRemoteUserData] upserting steps', {
      count: stepRows.length,
      rows: stepRows.map((row) => ({
        id: row.id,
        routine_id: row.routine_id,
        name: row.name,
      })),
    });
    if (stepRows.length > 0) {
      const { data: stepData, error } = await supabase
        .from('steps')
        .upsert(stepRows, { onConflict: 'id' })
        .select('id');
      if (error) throw error;
      console.log('[pushRemoteUserData] steps upserted', { returnedIds: stepData?.map((row) => row.id) });
    }
    await deleteOrphans(
      authUserId,
      'steps',
      payload.routines.flatMap((routine) => routine.steps.map((step) => step.id)),
    );

    const completionRows = dailyCompletionsToRows(payload.dailyCompletions, authUserId);
    console.log('[pushRemoteUserData] upserting daily completions', { count: completionRows.length });
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

    console.log('[pushRemoteUserData] upserting today step orders and cycle settings');
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

    console.log('[pushRemoteUserData] sync completed successfully');
  } catch (error) {
    console.log('[pushRemoteUserData] sync failed', error);
    throw error;
  }
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
