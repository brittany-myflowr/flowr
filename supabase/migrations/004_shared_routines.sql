-- Shared routines: public snapshot links for generous routine sharing (v1.1)
-- Links remain valid until the source routine is deleted (CASCADE).
-- Safe to re-run (idempotent).

-- Products copied from a share may have name + brand only (no verdict yet).
ALTER TABLE public.products
  ALTER COLUMN verdict DROP NOT NULL;

CREATE TABLE IF NOT EXISTS public.shared_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.routines (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  snapshot JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS shared_routines_routine_id_idx
  ON public.shared_routines (routine_id);

CREATE INDEX IF NOT EXISTS shared_routines_user_id_idx
  ON public.shared_routines (user_id);

ALTER TABLE public.shared_routines ENABLE ROW LEVEL SECURITY;

-- Table privileges (RLS still applies). Required for PostgREST roles.
GRANT SELECT ON public.shared_routines TO anon, authenticated;
GRANT INSERT, DELETE ON public.shared_routines TO authenticated;
GRANT ALL ON public.shared_routines TO service_role;

-- Recreate policies so a partial earlier run can finish cleanly.
DROP POLICY IF EXISTS "shared_routines_select_public" ON public.shared_routines;
DROP POLICY IF EXISTS "shared_routines_insert_own" ON public.shared_routines;
DROP POLICY IF EXISTS "shared_routines_delete_own" ON public.shared_routines;

-- Anyone (including anonymous web visitors) can read a share by id.
CREATE POLICY "shared_routines_select_public"
  ON public.shared_routines FOR SELECT
  USING (true);

-- Owners create shares for their own routines.
CREATE POLICY "shared_routines_insert_own"
  ON public.shared_routines FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.routines r
      WHERE r.id = routine_id
        AND r.user_id = auth.uid()
    )
  );

-- Owners can remove their shares (optional; cascade covers routine delete).
CREATE POLICY "shared_routines_delete_own"
  ON public.shared_routines FOR DELETE
  USING (auth.uid() = user_id);
