-- keeb.wiki — Phase 2.1 RLS hardening
-- built by twelve.
-- Run this manually in the Supabase SQL Editor after phase2_auth.sql.

-- Owners may edit their own builds, but regular users must not be able
-- to publish their own content by sending a direct client update.
DROP POLICY IF EXISTS "builds_update_own" ON public.builds;
CREATE POLICY "builds_update_own" ON public.builds
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (
      deleted_at IS NOT NULL
      OR status IN ('pending','rejected')
    )
  );

-- Wiki submissions need a rejected state for owner feedback and staff review.
DO $$
DECLARE
  wiki_status_constraint TEXT;
BEGIN
  SELECT conname INTO wiki_status_constraint
  FROM pg_constraint
  WHERE conrelid = 'public.wiki_articles'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%status%'
    AND pg_get_constraintdef(oid) ILIKE '%pending%'
  LIMIT 1;

  IF wiki_status_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.wiki_articles DROP CONSTRAINT %I', wiki_status_constraint);
  END IF;
END $$;

ALTER TABLE public.wiki_articles
  ADD CONSTRAINT wiki_articles_status_check
  CHECK (status IN ('draft','pending','published','rejected'));

-- Owners may edit or soft-delete their own wiki submissions, but cannot publish them.
DROP POLICY IF EXISTS "wiki_update_own" ON public.wiki_articles;
CREATE POLICY "wiki_update_own" ON public.wiki_articles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (
      deleted_at IS NOT NULL
      OR status IN ('draft','pending','rejected')
    )
  );
