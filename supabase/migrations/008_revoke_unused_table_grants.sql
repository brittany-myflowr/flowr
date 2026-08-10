-- Least-privilege table grants: PostgREST only needs SELECT/INSERT/UPDATE/DELETE.
-- TRUNCATE is not filtered by RLS; REFERENCES/TRIGGER are unused by the Data API.

REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE
  public.profiles,
  public.routines,
  public.steps,
  public.products,
  public.daily_completions,
  public.cycle_settings,
  public.today_step_orders,
  public.shared_routines
FROM anon, authenticated;
