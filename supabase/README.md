# Supabase setup for flowr

## 1. Environment

Copy `.env.example` to `.env` and set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Restart the Expo dev server after changing env vars.

## 2. Database migration

In the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql), run migrations in order:

1. `supabase/migrations/001_initial_schema.sql` — tables, RLS, sign-up profile trigger, account purge
2. Later numbered files under `supabase/migrations/` (e.g. `003_routine_description.sql`, `004_shared_routines.sql`, `005_notification_fields.sql`, `006_restrict_security_definer_execute.sql`)

For an existing project, only run migrations you have not applied yet.

### SECURITY DEFINER execute grants (`006_restrict_security_definer_execute.sql`)

Revokes public/`anon`/`authenticated`/`service_role` execute on internal helpers (`handle_new_user`, `purge_scheduled_account_deletions`, `rls_auto_enable`) so they cannot be called via the Data API. Triggers and `postgres` retain access.

### Routine sharing (`004_shared_routines.sql`)

Creates `shared_routines` (public read by id, owner insert/delete) and makes `products.verdict` nullable so recipients can import shared products without a verdict.

Website preview pages need the same Supabase URL + anon key in `website/config.js` (see `website/config.example.js`). Replace `TEAMID` in `website/.well-known/apple-app-site-association` with your Apple Developer Team ID so universal links open the app.

### Routine notifications (`005_notification_fields.sql`)

Adds opt-in columns on `routines`: `notifications_enabled`, `notification_mode`, `notification_time`. Reminders are scheduled locally on-device (not push from a server).

## 3. Auth settings

In Supabase Dashboard → Authentication → Providers, enable **Email** sign-up.

For password reset emails, configure SMTP or use Supabase's built-in email (Auth → Email Templates).

## 4. Account deletion purge (optional)

Schedule daily execution of `purge_scheduled_account_deletions()` via [pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron) (runs as `postgres`) to permanently remove accounts after the 30-day grace period. This function is not callable with the anon or authenticated keys.

## 5. Offline sync

The app keeps a local AsyncStorage cache (`@flowr/v2/app-state`). When offline, changes are saved locally and marked `pendingSync`. Sync runs automatically when the app returns to foreground or after debounced edits when online.
