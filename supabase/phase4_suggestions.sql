-- keeb.wiki — Phase 4 suggestions
-- built by twelve.
-- Run this manually in the Supabase SQL Editor after phase3_1_security_advisor_fixes.sql.

CREATE TABLE IF NOT EXISTS public.suggestions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submitted_by TEXT,
  category     TEXT NOT NULL CHECK (category IN (
                 'missing wiki topic',
                 'build archive polish',
                 'community feature',
                 'bug report'
               )),
  title        TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 120),
  message      TEXT NOT NULL CHECK (char_length(trim(message)) BETWEEN 1 AND 4000),
  page_url     TEXT CHECK (page_url IS NULL OR char_length(trim(page_url)) <= 500),
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','triaged','closed')),
  staff_note   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS suggestions_updated_at ON public.suggestions;
CREATE TRIGGER suggestions_updated_at
  BEFORE UPDATE ON public.suggestions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "suggestions_select_own_or_staff" ON public.suggestions;
CREATE POLICY "suggestions_select_own_or_staff" ON public.suggestions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "suggestions_insert_own" ON public.suggestions;
CREATE POLICY "suggestions_insert_own" ON public.suggestions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'open'
  );

DROP POLICY IF EXISTS "suggestions_staff_update" ON public.suggestions;
CREATE POLICY "suggestions_staff_update" ON public.suggestions
  FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE INDEX IF NOT EXISTS suggestions_admin_status_idx
  ON public.suggestions (status, created_at ASC);

CREATE INDEX IF NOT EXISTS suggestions_user_idx
  ON public.suggestions (user_id, created_at DESC);
