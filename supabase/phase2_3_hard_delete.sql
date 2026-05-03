-- keeb.wiki — Phase 2.3 hard delete for owned builds
-- built by twelve.
-- Run this manually in the Supabase SQL Editor after phase2_2_staff_picks.sql.

DROP POLICY IF EXISTS "builds_delete_own" ON public.builds;
CREATE POLICY "builds_delete_own" ON public.builds
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
