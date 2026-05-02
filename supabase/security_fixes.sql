-- keeb.wiki — Security Advisor warning fixes
-- built by twelve. — bytw12ve
-- Run this in Supabase SQL Editor after the main schema files.

-- 1. Function Search Path Mutable: pin search_path on the trigger function.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- 2. RLS Policy Always True: keep public submissions, but validate inserted rows.
DROP POLICY IF EXISTS "builds_insert" ON public.builds;
CREATE POLICY "builds_insert" ON public.builds
  FOR INSERT TO anon, authenticated WITH CHECK (
    name IS NOT NULL
    AND char_length(trim(name)) BETWEEN 1 AND 120
    AND (rating IS NULL OR rating BETWEEN 1 AND 10)
    AND coalesce(array_length(photos, 1), 0) <= 6
  );

-- 3. Public Bucket Allows Listing: public URLs still work, but clients cannot list the bucket.
DROP POLICY IF EXISTS "photos_select" ON storage.objects;

DROP POLICY IF EXISTS "photos_insert" ON storage.objects;
CREATE POLICY "photos_insert" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (
    bucket_id = 'build-photos'
    AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','gif')
  );

UPDATE storage.buckets
SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif']
WHERE id = 'build-photos';

-- Phase 1 file limits for the future audio bucket.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'build-audio',
  'build-audio',
  true,
  10485760,
  ARRAY['audio/mpeg','audio/wav','audio/x-wav','audio/mp4','audio/aac','audio/ogg']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "audio_select" ON storage.objects;

DROP POLICY IF EXISTS "audio_insert" ON storage.objects;
CREATE POLICY "audio_insert" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (
    bucket_id = 'build-audio'
    AND lower(storage.extension(name)) IN ('mp3','wav','m4a','aac','ogg')
  );
