-- Routine notification preferences (opt-in local reminders).
-- Numbered 005 because 004_shared_routines.sql already exists.

ALTER TABLE public.routines
  ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notification_mode TEXT,
  ADD COLUMN IF NOT EXISTS notification_time TEXT;

COMMENT ON COLUMN public.routines.notification_mode IS
  'specific | timeOfDay — null when notifications_enabled is false';
COMMENT ON COLUMN public.routines.notification_time IS
  'HH:mm local time when notification_mode = specific';
