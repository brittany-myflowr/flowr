-- Optional routine description (nullable text)
ALTER TABLE public.routines
  ADD COLUMN IF NOT EXISTS description TEXT;
