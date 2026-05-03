-- keeb.wiki — Phase 3.2 launch submission requirements
-- built by twelve.
-- Run this manually in the Supabase SQL Editor after phase3_1_security_advisor_fixes.sql.

-- Build submissions need enough detail to be useful at launch:
-- name, layout, switch type, and at least one photo.

DROP POLICY IF EXISTS "builds_insert" ON public.builds;
CREATE POLICY "builds_insert" ON public.builds
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND deleted_at IS NULL
    AND name IS NOT NULL
    AND char_length(trim(name)) BETWEEN 1 AND 120
    AND layout IS NOT NULL
    AND char_length(trim(layout)) BETWEEN 1 AND 80
    AND switch_type IN ('linear','tactile','clicky')
    AND (rating IS NULL OR rating BETWEEN 1 AND 10)
    AND coalesce(array_length(photos, 1), 0) BETWEEN 1 AND 6
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.builds'::regclass
      AND conname = 'builds_launch_submission_requirements'
  ) THEN
    ALTER TABLE public.builds
      ADD CONSTRAINT builds_launch_submission_requirements
      CHECK (
        status <> 'pending'
        OR (
          name IS NOT NULL
          AND char_length(trim(name)) BETWEEN 1 AND 120
          AND layout IS NOT NULL
          AND char_length(trim(layout)) BETWEEN 1 AND 80
          AND switch_type IN ('linear','tactile','clicky')
          AND coalesce(array_length(photos, 1), 0) BETWEEN 1 AND 6
        )
      );
  END IF;
END $$;
