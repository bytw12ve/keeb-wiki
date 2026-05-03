-- keeb.wiki — Phase 3 staff admin, moderation, staff picks, and audit notes
-- built by twelve.
-- Run this manually in the Supabase SQL Editor after phase2_3_hard_delete.sql.

-- ── Staff roles ─────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('member','staff','admin'));

CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
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
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT public.current_profile_role() IN ('staff','admin');
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT public.current_profile_role() = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.prevent_client_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
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

DROP TRIGGER IF EXISTS prevent_client_role_changes ON public.profiles;
CREATE TRIGGER prevent_client_role_changes
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_client_role_changes();

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- To make the first admin manually after this file runs:
-- UPDATE public.profiles SET role = 'admin' WHERE username = 'YOUR_USERNAME';

-- ── Audit fields ────────────────────────────────────────────────
ALTER TABLE public.builds
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_note TEXT,
  ADD COLUMN IF NOT EXISTS staff_picked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS staff_pick_note TEXT;

ALTER TABLE public.wiki_articles
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_note TEXT;

CREATE TABLE IF NOT EXISTS public.moderation_audit (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('build','wiki_article')),
  target_id   UUID,
  action      TEXT NOT NULL CHECK (action IN ('published','rejected','deleted','staff_pick_set','staff_pick_removed')),
  note        TEXT,
  snapshot    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.moderation_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "moderation_audit_staff_select" ON public.moderation_audit;
CREATE POLICY "moderation_audit_staff_select" ON public.moderation_audit
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE INDEX IF NOT EXISTS moderation_audit_target_idx
  ON public.moderation_audit (target_type, target_id, created_at DESC);

-- ── Staff read policies ─────────────────────────────────────────
DROP POLICY IF EXISTS "builds_select" ON public.builds;
CREATE POLICY "builds_select" ON public.builds
  FOR SELECT TO anon, authenticated USING (
    deleted_at IS NULL
    AND (
      status = 'published'
      OR user_id = auth.uid()
      OR public.is_staff()
    )
  );

DROP POLICY IF EXISTS "wiki_read_published" ON public.wiki_articles;
CREATE POLICY "wiki_read_published" ON public.wiki_articles
  FOR SELECT TO anon, authenticated USING (
    deleted_at IS NULL
    AND (
      status = 'published'
      OR user_id = auth.uid()
      OR public.is_staff()
    )
  );

-- Staff can delete uploaded build photos after moderation hard deletes.
DROP POLICY IF EXISTS "photos_delete_staff" ON storage.objects;
CREATE POLICY "photos_delete_staff" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'build-photos'
    AND public.is_staff()
  );

-- Phase 3 uses permanent deletes for owner-requested wiki deletion too.
DROP POLICY IF EXISTS "wiki_delete_own" ON public.wiki_articles;
CREATE POLICY "wiki_delete_own" ON public.wiki_articles
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Replace the Phase 2.2 staff-pick trigger so staff/admin client sessions can manage picks.
CREATE OR REPLACE FUNCTION public.prevent_client_staff_pick_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- ── Staff action RPCs ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.staff_moderate_build(
  target_build_id UUID,
  next_status TEXT,
  note TEXT DEFAULT NULL
)
RETURNS public.builds
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_build public.builds;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Staff access required.';
  END IF;

  IF next_status NOT IN ('published','rejected') THEN
    RAISE EXCEPTION 'Invalid moderation status.';
  END IF;

  UPDATE public.builds
  SET status = next_status,
      reviewed_by = auth.uid(),
      reviewed_at = NOW(),
      review_note = NULLIF(trim(coalesce(note, '')), ''),
      updated_at = NOW()
  WHERE id = target_build_id
    AND deleted_at IS NULL
  RETURNING * INTO updated_build;

  IF updated_build.id IS NULL THEN
    RAISE EXCEPTION 'Build not found.';
  END IF;

  INSERT INTO public.moderation_audit (actor_id, target_type, target_id, action, note, snapshot)
  VALUES (auth.uid(), 'build', updated_build.id, next_status, NULLIF(trim(coalesce(note, '')), ''), to_jsonb(updated_build));

  RETURN updated_build;
END;
$$;

CREATE OR REPLACE FUNCTION public.staff_moderate_wiki_article(
  target_article_id UUID,
  next_status TEXT,
  note TEXT DEFAULT NULL
)
RETURNS public.wiki_articles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_article public.wiki_articles;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Staff access required.';
  END IF;

  IF next_status NOT IN ('published','rejected') THEN
    RAISE EXCEPTION 'Invalid moderation status.';
  END IF;

  UPDATE public.wiki_articles
  SET status = next_status,
      reviewed_by = auth.uid(),
      reviewed_at = NOW(),
      review_note = NULLIF(trim(coalesce(note, '')), ''),
      updated_at = NOW()
  WHERE id = target_article_id
    AND deleted_at IS NULL
  RETURNING * INTO updated_article;

  IF updated_article.id IS NULL THEN
    RAISE EXCEPTION 'Wiki article not found.';
  END IF;

  INSERT INTO public.moderation_audit (actor_id, target_type, target_id, action, note, snapshot)
  VALUES (auth.uid(), 'wiki_article', updated_article.id, next_status, NULLIF(trim(coalesce(note, '')), ''), to_jsonb(updated_article));

  RETURN updated_article;
END;
$$;

CREATE OR REPLACE FUNCTION public.staff_delete_build(
  target_build_id UUID,
  note TEXT DEFAULT NULL
)
RETURNS public.builds
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_build public.builds;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Staff access required.';
  END IF;

  DELETE FROM public.builds
  WHERE id = target_build_id
  RETURNING * INTO deleted_build;

  IF deleted_build.id IS NULL THEN
    RAISE EXCEPTION 'Build not found.';
  END IF;

  INSERT INTO public.moderation_audit (actor_id, target_type, target_id, action, note, snapshot)
  VALUES (auth.uid(), 'build', deleted_build.id, 'deleted', NULLIF(trim(coalesce(note, '')), ''), to_jsonb(deleted_build));

  RETURN deleted_build;
END;
$$;

CREATE OR REPLACE FUNCTION public.staff_delete_wiki_article(
  target_article_id UUID,
  note TEXT DEFAULT NULL
)
RETURNS public.wiki_articles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_article public.wiki_articles;
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Staff access required.';
  END IF;

  DELETE FROM public.wiki_articles
  WHERE id = target_article_id
  RETURNING * INTO deleted_article;

  IF deleted_article.id IS NULL THEN
    RAISE EXCEPTION 'Wiki article not found.';
  END IF;

  INSERT INTO public.moderation_audit (actor_id, target_type, target_id, action, note, snapshot)
  VALUES (auth.uid(), 'wiki_article', deleted_article.id, 'deleted', NULLIF(trim(coalesce(note, '')), ''), to_jsonb(deleted_article));

  RETURN deleted_article;
END;
$$;

CREATE OR REPLACE FUNCTION public.staff_set_build_staff_pick(
  target_build_id UUID,
  picked BOOLEAN,
  pick_order INTEGER DEFAULT NULL,
  note TEXT DEFAULT NULL
)
RETURNS public.builds
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_build public.builds;
  next_note TEXT := NULLIF(trim(coalesce(note, '')), '');
BEGIN
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Staff access required.';
  END IF;

  UPDATE public.builds
  SET is_staff_pick = picked,
      staff_pick_order = CASE WHEN picked THEN pick_order ELSE NULL END,
      staff_picked_at = CASE WHEN picked THEN NOW() ELSE NULL END,
      staff_picked_by = CASE WHEN picked THEN auth.uid() ELSE NULL END,
      staff_pick_note = CASE WHEN picked THEN next_note ELSE NULL END,
      updated_at = NOW()
  WHERE id = target_build_id
    AND deleted_at IS NULL
    AND status = 'published'
  RETURNING * INTO updated_build;

  IF updated_build.id IS NULL THEN
    RAISE EXCEPTION 'Published build not found.';
  END IF;

  INSERT INTO public.moderation_audit (actor_id, target_type, target_id, action, note, snapshot)
  VALUES (
    auth.uid(),
    'build',
    updated_build.id,
    CASE WHEN picked THEN 'staff_pick_set' ELSE 'staff_pick_removed' END,
    next_note,
    to_jsonb(updated_build)
  );

  RETURN updated_build;
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_profile_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.staff_moderate_build(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_moderate_wiki_article(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_delete_build(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_delete_wiki_article(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_set_build_staff_pick(UUID, BOOLEAN, INTEGER, TEXT) TO authenticated;
