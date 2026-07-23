# Supabase setup for flowr

## 1. Environment

Copy `.env.example` to `.env` and set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Restart the Expo dev server after changing env vars.

## 2. Database migration

In the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql), run migrations in order:

1. `supabase/migrations/001_initial_schema.sql` — tables, RLS, sign-up profile trigger, account purge
2. Later numbered files under `supabase/migrations/` (e.g. `003_routine_description.sql` for optional routine descriptions)

For an existing project, only run migrations you have not applied yet.

## 3. Auth settings

In Supabase Dashboard → Authentication → Providers, enable **Email** sign-up.

For password reset emails, configure SMTP or use Supabase's built-in email (Auth → Email Templates).

## 4. Account deletion purge (optional)

Schedule daily execution of `purge_scheduled_account_deletions()` via [pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron) to permanently remove accounts after the 30-day grace period.

## 5. Offline sync

The app keeps a local AsyncStorage cache (`@flowr/v2/app-state`). When offline, changes are saved locally and marked `pendingSync`. Sync runs automatically when the app returns to foreground or after debounced edits when online.
