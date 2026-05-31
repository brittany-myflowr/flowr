-- Ensure sign-up metadata (including trial_started_at) is applied by the profile trigger
-- so the client does not need a separate profile UPDATE immediately after auth.signUp.

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
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    flower_color_name = EXCLUDED.flower_color_name,
    trial_started_at = COALESCE(public.profiles.trial_started_at, EXCLUDED.trial_started_at);

  INSERT INTO public.cycle_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.today_step_orders (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
