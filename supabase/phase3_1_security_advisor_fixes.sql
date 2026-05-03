-- keeb.wiki — Phase 3.1 Security Advisor fixes
-- built by twelve. — bytw12ve
-- Run this manually in the Supabase SQL Editor after phase3_staff_admin.sql.

-- ── Role helpers: keep RLS behavior, avoid exposed SECURITY DEFINER helpers ──
CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS TEXT
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
STABLE
AS $$
  SELECT coalesce(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'member'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
STABLE
AS $$
  SELECT public.current_profile_role() IN ('staff','admin');
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
STABLE
AS $$
  SELECT public.current_profile_role() = 'admin';
$$;

-- ── Trigger functions: pin search_path ──────────────────────────
CREATE OR REPLACE FUNCTION public.prevent_client_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.role(), '') NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE'
    AND NEW.role IS DISTINCT FROM OLD.role
    AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change profile roles.';
  END IF;

  IF TG_OP = 'INSERT'
    AND NEW.role IS DISTINCT FROM 'member'
    AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can create staff profiles.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_client_staff_pick_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.role(), '') NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  IF public.is_staff() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.is_staff_pick IS TRUE
      OR NEW.staff_pick_order IS NOT NULL
      OR NEW.staff_picked_at IS NOT NULL
      OR NEW.staff_picked_by IS NOT NULL
      OR NEW.staff_pick_note IS NOT NULL THEN
      RAISE EXCEPTION 'Staff pick fields can only be changed by staff tools.';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_staff_pick IS DISTINCT FROM OLD.is_staff_pick
      OR NEW.staff_pick_order IS DISTINCT FROM OLD.staff_pick_order
      OR NEW.staff_picked_at IS DISTINCT FROM OLD.staff_picked_at
      OR NEW.staff_picked_by IS DISTINCT FROM OLD.staff_picked_by
      OR NEW.staff_pick_note IS DISTINCT FROM OLD.staff_pick_note THEN
      RAISE EXCEPTION 'Staff pick fields can only be changed by staff tools.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ── Staff RLS policies for invoker RPCs ─────────────────────────
DROP POLICY IF EXISTS "builds_staff_update" ON public.builds;
CREATE POLICY "builds_staff_update" ON public.builds
  FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "builds_staff_delete" ON public.builds;
CREATE POLICY "builds_staff_delete" ON public.builds
  FOR DELETE TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "wiki_staff_update" ON public.wiki_articles;
CREATE POLICY "wiki_staff_update" ON public.wiki_articles
  FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "wiki_staff_delete" ON public.wiki_articles;
CREATE POLICY "wiki_staff_delete" ON public.wiki_articles
  FOR DELETE TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "moderation_audit_staff_insert" ON public.moderation_audit;
CREATE POLICY "moderation_audit_staff_insert" ON public.moderation_audit
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

-- ── RPC grants: make staff RPCs invoker-safe and block anon/public ──────────
ALTER FUNCTION public.staff_moderate_build(UUID, TEXT, TEXT) SECURITY INVOKER;
ALTER FUNCTION public.staff_moderate_wiki_article(UUID, TEXT, TEXT) SECURITY INVOKER;
ALTER FUNCTION public.staff_delete_build(UUID, TEXT) SECURITY INVOKER;
ALTER FUNCTION public.staff_delete_wiki_article(UUID, TEXT) SECURITY INVOKER;
ALTER FUNCTION public.staff_set_build_staff_pick(UUID, BOOLEAN, INTEGER, TEXT) SECURITY INVOKER;

REVOKE EXECUTE ON FUNCTION public.staff_moderate_build(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.staff_moderate_build(UUID, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.staff_moderate_build(UUID, TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.staff_moderate_wiki_article(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.staff_moderate_wiki_article(UUID, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.staff_moderate_wiki_article(UUID, TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.staff_delete_build(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.staff_delete_build(UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.staff_delete_build(UUID, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.staff_delete_wiki_article(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.staff_delete_wiki_article(UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.staff_delete_wiki_article(UUID, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.staff_set_build_staff_pick(UUID, BOOLEAN, INTEGER, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.staff_set_build_staff_pick(UUID, BOOLEAN, INTEGER, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.staff_set_build_staff_pick(UUID, BOOLEAN, INTEGER, TEXT) TO authenticated;

-- Role helpers are intentionally invoker functions used by RLS and triggers.
GRANT EXECUTE ON FUNCTION public.current_profile_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ── Staff-pick priority validation ──────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.builds'::regclass
      AND conname = 'builds_staff_pick_order_range'
  ) THEN
    ALTER TABLE public.builds
      ADD CONSTRAINT builds_staff_pick_order_range
      CHECK (staff_pick_order IS NULL OR staff_pick_order BETWEEN 1 AND 999);
  END IF;
END $$;

-- ── Admin queue and staff-pick sort indexes ─────────────────────
CREATE INDEX IF NOT EXISTS builds_admin_pending_idx
  ON public.builds (status, created_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS wiki_articles_admin_pending_idx
  ON public.wiki_articles (status, created_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS builds_staff_picks_idx
  ON public.builds (is_staff_pick, staff_pick_order, staff_picked_at DESC)
  WHERE deleted_at IS NULL;
