-- flowr initial schema: run in Supabase SQL Editor or via CLI

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  flower_color_name TEXT NOT NULL DEFAULT 'Sky',
  trial_started_at TIMESTAMPTZ,
  deletion_scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- routines
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  time_of_day TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS routines_user_id_idx ON public.routines (user_id);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "routines_select_own"
  ON public.routines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "routines_insert_own"
  ON public.routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routines_update_own"
  ON public.routines FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routines_delete_own"
  ON public.routines FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- products (before steps for FK)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  verdict TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_user_id_idx ON public.products (user_id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_own"
  ON public.products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "products_insert_own"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "products_update_own"
  ON public.products FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "products_delete_own"
  ON public.products FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- steps
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  routine_id UUID NOT NULL REFERENCES public.routines (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  note TEXT,
  category TEXT NOT NULL,
  schedule JSONB,
  product_id UUID REFERENCES public.products (id) ON DELETE SET NULL,
  product_name TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS steps_user_id_idx ON public.steps (user_id);
CREATE INDEX IF NOT EXISTS steps_routine_id_idx ON public.steps (routine_id);

ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "steps_select_own"
  ON public.steps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "steps_insert_own"
  ON public.steps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "steps_update_own"
  ON public.steps FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "steps_delete_own"
  ON public.steps FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- daily_completions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  date DATE NOT NULL,
  scheduled_step_ids TEXT[] NOT NULL DEFAULT '{}',
  completed_step_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS daily_completions_user_id_idx ON public.daily_completions (user_id);

ALTER TABLE public.daily_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_completions_select_own"
  ON public.daily_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "daily_completions_insert_own"
  ON public.daily_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_completions_update_own"
  ON public.daily_completions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_completions_delete_own"
  ON public.daily_completions FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- today_step_orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.today_step_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  morning TEXT[] NOT NULL DEFAULT '{}',
  afternoon TEXT[] NOT NULL DEFAULT '{}',
  evening TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.today_step_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "today_step_orders_select_own"
  ON public.today_step_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "today_step_orders_insert_own"
  ON public.today_step_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "today_step_orders_update_own"
  ON public.today_step_orders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "today_step_orders_delete_own"
  ON public.today_step_orders FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- cycle_settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cycle_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  method TEXT NOT NULL DEFAULT 'menstrual',
  last_period_start DATE,
  cycle_length INTEGER NOT NULL DEFAULT 28,
  period_length INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cycle_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cycle_settings_select_own"
  ON public.cycle_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "cycle_settings_insert_own"
  ON public.cycle_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cycle_settings_update_own"
  ON public.cycle_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cycle_settings_delete_own"
  ON public.cycle_settings FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- auth trigger: create profile on sign-up
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    flower_color_name,
    trial_started_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'flower_color_name', 'Sky'),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'trial_started_at', '')::timestamptz,
      NOW()
    )
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.cycle_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.today_step_orders (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- account deletion: purge users past 30-day grace period
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.purge_scheduled_account_deletions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_row RECORD;
BEGIN
  FOR profile_row IN
    SELECT id
    FROM public.profiles
    WHERE deletion_scheduled_at IS NOT NULL
      AND deletion_scheduled_at <= NOW() - INTERVAL '30 days'
  LOOP
    DELETE FROM auth.users WHERE id = profile_row.id;
  END LOOP;
END;
$$;

-- Schedule via pg_cron in Supabase dashboard, e.g. daily:
-- SELECT cron.schedule('purge-deleted-accounts', '0 3 * * *', $$SELECT public.purge_scheduled_account_deletions()$$);
