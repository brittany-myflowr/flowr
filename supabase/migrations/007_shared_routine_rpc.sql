-- Public share fetch via RPC only — no open table SELECT for anon/authenticated.
-- Owners create shares with a client-supplied id (no RETURNING / SELECT required).

CREATE OR REPLACE FUNCTION public.get_shared_routine(share_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT snapshot
  FROM public.shared_routines
  WHERE id = share_id;
$$;

REVOKE ALL ON FUNCTION public.get_shared_routine(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_routine(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "shared_routines_select_public" ON public.shared_routines;

REVOKE SELECT ON TABLE public.shared_routines FROM anon, authenticated;
