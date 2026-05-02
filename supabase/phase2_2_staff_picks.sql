-- keeb.wiki — Phase 2.2 staff picks
-- built by twelve. — bytw12ve
-- Run this manually in the Supabase SQL Editor after phase2_1_rls_hardening.sql.

ALTER TABLE public.builds
  ADD COLUMN IF NOT EXISTS is_staff_pick BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS staff_pick_order INTEGER,
  ADD COLUMN IF NOT EXISTS staff_picked_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.prevent_client_staff_pick_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF coalesce(auth.role(), '') NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.is_staff_pick IS TRUE
      OR NEW.staff_pick_order IS NOT NULL
      OR NEW.staff_picked_at IS NOT NULL THEN
      RAISE EXCEPTION 'Staff pick fields can only be changed by staff tools.';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_staff_pick IS DISTINCT FROM OLD.is_staff_pick
      OR NEW.staff_pick_order IS DISTINCT FROM OLD.staff_pick_order
      OR NEW.staff_picked_at IS DISTINCT FROM OLD.staff_picked_at THEN
      RAISE EXCEPTION 'Staff pick fields can only be changed by staff tools.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_client_staff_pick_changes ON public.builds;
CREATE TRIGGER prevent_client_staff_pick_changes
  BEFORE INSERT OR UPDATE ON public.builds
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_client_staff_pick_changes();

CREATE INDEX IF NOT EXISTS builds_staff_picks_idx
  ON public.builds (is_staff_pick, staff_pick_order, staff_picked_at DESC)
  WHERE deleted_at IS NULL;
