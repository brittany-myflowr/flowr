import { defaultFlowerColor } from '@/constants/flowerColors';
import { supabase } from '@/constants/supabase';
import { startTrialIso } from '@/lib/subscription';
import { isValidEmail } from '@/lib/validation';

import { mapAuthError } from './errors';
import { profileRowToUser, type ProfileRow } from './mappers';

const ACCOUNT_DELETION_GRACE_DAYS = 30;

export type SignUpInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getCurrentSessionUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as ProfileRow | null;
}

function buildProfileRowFromSignUp(
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  trialStartedAt: string,
): ProfileRow {
  return {
    id: userId,
    email,
    first_name: firstName,
    last_name: lastName,
    flower_color_name: defaultFlowerColor.name,
    trial_started_at: trialStartedAt,
    deletion_scheduled_at: null,
    created_at: new Date().toISOString(),
  };
}

async function fetchProfileWithRetry(userId: string, attempts = 5, delayMs = 200): Promise<ProfileRow | null> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const profile = await fetchProfile(userId);
      if (profile) return profile;
    } catch (error) {
      console.log('[signUpWithSupabase] fetchProfile attempt failed', { attempt, error });
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return null;
}

async function ensureProfileExists(userId: string, email: string): Promise<ProfileRow> {
  const existing = await fetchProfile(userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      first_name: '',
      last_name: '',
      flower_color_name: defaultFlowerColor.name,
      trial_started_at: startTrialIso(),
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      const retry = await fetchProfile(userId);
      if (retry) return retry;
    }
    throw error;
  }
  return data as ProfileRow;
}

async function handleDeletionGrace(profile: ProfileRow): Promise<string | null> {
  if (!profile.deletion_scheduled_at) return null;

  const scheduledAt = new Date(profile.deletion_scheduled_at);
  const purgeAt = new Date(scheduledAt);
  purgeAt.setDate(purgeAt.getDate() + ACCOUNT_DELETION_GRACE_DAYS);

  if (new Date() >= purgeAt) {
    await supabase.auth.signOut();
    return 'This account was deleted and can no longer be accessed.';
  }

  const { error } = await supabase
    .from('profiles')
    .update({ deletion_scheduled_at: null })
    .eq('id', profile.id);

  if (error) throw error;
  return null;
}

export async function signUpWithSupabase(input: SignUpInput): Promise<{
  userId: string;
  user: ReturnType<typeof profileRowToUser>;
  trialStartedAt: string;
  error: string | null;
}> {
  const email = normalizeEmail(input.email);
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!firstName) return { userId: '', user: null as never, trialStartedAt: '', error: 'First name is required.' };
  if (!lastName) return { userId: '', user: null as never, trialStartedAt: '', error: 'Last name is required.' };
  if (!email) return { userId: '', user: null as never, trialStartedAt: '', error: 'Email is required.' };
  if (!isValidEmail(email)) {
    return { userId: '', user: null as never, trialStartedAt: '', error: 'Enter a valid email address.' };
  }
  if (input.password.length < 8) {
    return {
      userId: '',
      user: null as never,
      trialStartedAt: '',
      error: 'Password must be at least 8 characters.',
    };
  }

  const trialStartedAt = startTrialIso();

  console.log('[signUpWithSupabase] starting sign-up', { email });

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        flower_color_name: defaultFlowerColor.name,
        trial_started_at: trialStartedAt,
      },
    },
  });

  if (error) {
    console.log('[signUpWithSupabase] auth.signUp failed', { message: error.message, code: error.code });
    return { userId: '', user: null as never, trialStartedAt: '', error: mapAuthError(error.message) };
  }

  if (!data.user) {
    console.log('[signUpWithSupabase] auth.signUp returned no user');
    return {
      userId: '',
      user: null as never,
      trialStartedAt: '',
      error: 'Could not create your account. Please try again.',
    };
  }

  console.log('[signUpWithSupabase] auth user created', {
    userId: data.user.id,
    hasSignUpSession: Boolean(data.session),
  });

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.log('[signUpWithSupabase] getSession failed', {
      message: sessionError.message,
      code: sessionError.code,
    });
  }

  const hasSession = Boolean(sessionData.session);
  console.log('[signUpWithSupabase] session after sign-up', {
    hasSession,
    sessionUserId: sessionData.session?.user.id ?? null,
  });

  if (!hasSession) {
    console.log(
      '[signUpWithSupabase] no active session after sign-up; profile reads/writes require email confirmation',
    );
    return {
      userId: '',
      user: null as never,
      trialStartedAt: '',
      error: 'Check your email to confirm your account, then log in.',
    };
  }

  let profile: ProfileRow | null = null;

  try {
    profile = await fetchProfileWithRetry(data.user.id);
    console.log('[signUpWithSupabase] profile fetch after sign-up', { found: Boolean(profile) });
  } catch (fetchError) {
    console.log('[signUpWithSupabase] profile fetch threw', fetchError);
  }

  if (!profile) {
    try {
      profile = await ensureProfileExists(data.user.id, email);
      console.log('[signUpWithSupabase] ensureProfileExists succeeded');
    } catch (ensureError) {
      console.log('[signUpWithSupabase] ensureProfileExists failed', ensureError);
    }
  }

  console.log('[signUpWithSupabase] updating profile', { userId: data.user.id });

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      flower_color_name: defaultFlowerColor.name,
      trial_started_at: trialStartedAt,
      deletion_scheduled_at: null,
    })
    .eq('id', data.user.id);

  if (profileError) {
    console.log('[signUpWithSupabase] profile update failed', {
      message: profileError.message,
      code: profileError.code,
      details: profileError.details,
      hint: profileError.hint,
    });

    let refreshedProfile: ProfileRow | null = null;
    try {
      refreshedProfile = await fetchProfileWithRetry(data.user.id, 3, 150);
    } catch (refreshError) {
      console.log('[signUpWithSupabase] profile refetch after update failure threw', refreshError);
    }

    if (
      refreshedProfile &&
      refreshedProfile.first_name === firstName &&
      refreshedProfile.last_name === lastName
    ) {
      console.log('[signUpWithSupabase] profile update failed but trigger data is valid; continuing');
      return {
        userId: data.user.id,
        user: profileRowToUser(refreshedProfile),
        trialStartedAt: refreshedProfile.trial_started_at ?? trialStartedAt,
        error: null,
      };
    }

    return {
      userId: '',
      user: null as never,
      trialStartedAt: '',
      error: mapAuthError(profileError.message),
    };
  }

  const updatedProfile: ProfileRow =
    profile ??
    buildProfileRowFromSignUp(data.user.id, email, firstName, lastName, trialStartedAt);

  console.log('[signUpWithSupabase] sign-up completed successfully', { userId: data.user.id });

  return {
    userId: data.user.id,
    user: profileRowToUser({
      ...updatedProfile,
      first_name: firstName,
      last_name: lastName,
      flower_color_name: defaultFlowerColor.name,
      trial_started_at: trialStartedAt,
      deletion_scheduled_at: null,
    }),
    trialStartedAt,
    error: null,
  };
}

export async function signInWithSupabase(input: SignInInput): Promise<{
  userId: string;
  user: ReturnType<typeof profileRowToUser>;
  trialStartedAt: string | null;
  error: string | null;
}> {
  const email = normalizeEmail(input.email);

  if (!email || !input.password) {
    return { userId: '', user: null as never, trialStartedAt: null, error: 'Email and password are required.' };
  }
  if (!isValidEmail(email)) {
    return { userId: '', user: null as never, trialStartedAt: null, error: 'Enter a valid email address.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (error) {
    return { userId: '', user: null as never, trialStartedAt: null, error: mapAuthError(error.message) };
  }

  if (!data.user) {
    return { userId: '', user: null as never, trialStartedAt: null, error: 'Could not sign in. Please try again.' };
  }

  const profile = await ensureProfileExists(data.user.id, email);
  const graceError = await handleDeletionGrace(profile);
  if (graceError) {
    return { userId: '', user: null as never, trialStartedAt: null, error: graceError };
  }

  const refreshed = (await fetchProfile(data.user.id)) ?? profile;

  return {
    userId: data.user.id,
    user: profileRowToUser(refreshed),
    trialStartedAt: refreshed.trial_started_at,
    error: null,
  };
}

export async function signOutFromSupabase(): Promise<void> {
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return 'Email is required.';
  if (!isValidEmail(normalized)) return 'Enter a valid email address.';

  const { error } = await supabase.auth.resetPasswordForEmail(normalized);

  if (error) return mapAuthError(error.message);
  return null;
}

export async function updateAccountEmail(newEmail: string): Promise<string | null> {
  const email = normalizeEmail(newEmail);
  if (!isValidEmail(email)) return 'Enter a valid email address.';

  const { error } = await supabase.auth.updateUser({ email });
  if (error) return mapAuthError(error.message);
  return null;
}

export async function scheduleAccountDeletion(userId: string): Promise<string | null> {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ deletion_scheduled_at: new Date().toISOString() })
    .eq('id', userId);

  if (profileError) return mapAuthError(profileError.message);

  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) return mapAuthError(signOutError.message);

  return null;
}

export { ACCOUNT_DELETION_GRACE_DAYS };
