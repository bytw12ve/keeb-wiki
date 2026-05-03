-- keeb.wiki — Phase 2 auth, ownership, and safer publishing
-- built by twelve.
-- Run this manually in the Supabase SQL Editor after seed.sql, wiki.sql, and security_fixes.sql.

-- ── Profiles ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL CHECK (
                username ~ '^[a-z0-9_]{3,24}$'
              ),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ── Builds ownership + moderation ───────────────────────────────
ALTER TABLE public.builds
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('pending','published','rejected')),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.builds SET status = 'published' WHERE status IS NULL;

DROP TRIGGER IF EXISTS builds_updated_at ON public.builds;
CREATE TRIGGER builds_updated_at
  BEFORE UPDATE ON public.builds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "builds_select" ON public.builds;
CREATE POLICY "builds_select" ON public.builds
  FOR SELECT TO anon, authenticated USING (
    deleted_at IS NULL
    AND (
      status = 'published'
      OR user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "builds_insert" ON public.builds;
CREATE POLICY "builds_insert" ON public.builds
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND deleted_at IS NULL
    AND name IS NOT NULL
    AND char_length(trim(name)) BETWEEN 1 AND 120
    AND switch_type IN ('linear','tactile','clicky')
    AND (rating IS NULL OR rating BETWEEN 1 AND 10)
    AND coalesce(array_length(photos, 1), 0) <= 6
  );

DROP POLICY IF EXISTS "builds_update_own" ON public.builds;
CREATE POLICY "builds_update_own" ON public.builds
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── Wiki ownership + soft delete ────────────────────────────────
ALTER TABLE public.wiki_articles
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DROP POLICY IF EXISTS "wiki_read_published" ON public.wiki_articles;
CREATE POLICY "wiki_read_published" ON public.wiki_articles
  FOR SELECT TO anon, authenticated USING (
    deleted_at IS NULL
    AND (
      status = 'published'
      OR user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "wiki_insert" ON public.wiki_articles;
CREATE POLICY "wiki_insert" ON public.wiki_articles
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "wiki_update_own" ON public.wiki_articles;
CREATE POLICY "wiki_update_own" ON public.wiki_articles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── Storage: require signed-in uploads and user-scoped paths ─────
DROP POLICY IF EXISTS "photos_insert" ON storage.objects;
CREATE POLICY "photos_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'build-photos'
    AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','gif')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "photos_delete_own" ON storage.objects;
CREATE POLICY "photos_delete_own" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'build-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Keep audio bucket locked for signed-in future Phase 2 uploads.
DROP POLICY IF EXISTS "audio_insert" ON storage.objects;
CREATE POLICY "audio_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'build-audio'
    AND lower(storage.extension(name)) IN ('mp3','wav','m4a','aac','ogg')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
