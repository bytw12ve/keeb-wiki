-- keeb.wiki — builds table schema + seed
-- built by twelve. — bytw12ve
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/yxucqsofablzsgyeyrmb/sql

-- ── 1. Create table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.builds (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          TEXT        GENERATED ALWAYS AS (lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))) STORED,
  name          TEXT        NOT NULL,
  layout        TEXT,
  case_material TEXT,
  case_color    TEXT,
  plate         TEXT,
  switches      TEXT,
  switch_type   TEXT        CHECK (switch_type IN ('linear','tactile','clicky')),
  lubed         BOOLEAN     DEFAULT FALSE,
  lube_type     TEXT,
  filmed        BOOLEAN     DEFAULT FALSE,
  film_brand    TEXT,
  keycaps       TEXT,
  mods          TEXT,
  description   TEXT,
  builder_notes TEXT,
  rating        INTEGER     CHECK (rating BETWEEN 1 AND 10),
  sound_signature TEXT[]    DEFAULT '{}',
  typing_feel   TEXT[]      DEFAULT '{}',
  sound_level   TEXT,
  photos        TEXT[]      DEFAULT '{}',
  submitted_by  TEXT,
  art           TEXT        DEFAULT 'lavender',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Row Level Security ─────────────────────────────────────────
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "builds_select" ON public.builds;
CREATE POLICY "builds_select" ON public.builds
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "builds_insert" ON public.builds;
CREATE POLICY "builds_insert" ON public.builds
  FOR INSERT TO anon, authenticated WITH CHECK (
    name IS NOT NULL
    AND char_length(trim(name)) BETWEEN 1 AND 120
    AND (rating IS NULL OR rating BETWEEN 1 AND 10)
    AND coalesce(array_length(photos, 1), 0) <= 6
  );

-- ── 3. Storage bucket for photos ─────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'build-photos',
  'build-photos',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Reserved for Phase 2 audio uploads; limit is applied now so the bucket is safe when enabled.
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

DROP POLICY IF EXISTS "photos_select" ON storage.objects;

DROP POLICY IF EXISTS "photos_insert" ON storage.objects;
CREATE POLICY "photos_insert" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (
    bucket_id = 'build-photos'
    AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','gif')
  );

DROP POLICY IF EXISTS "audio_select" ON storage.objects;

DROP POLICY IF EXISTS "audio_insert" ON storage.objects;
CREATE POLICY "audio_insert" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (
    bucket_id = 'build-audio'
    AND lower(storage.extension(name)) IN ('mp3','wav','m4a','aac','ogg')
  );

-- ── 4. Seed data — 15 builds ──────────────────────────────────────
INSERT INTO public.builds
  (name, layout, case_material, case_color, plate, switches, switch_type, lubed, lube_type, filmed, film_brand, keycaps, mods, description, builder_notes, rating, sound_signature, typing_feel, sound_level, submitted_by, art, created_at)
VALUES
(
  'Satisfaction75', '75%', 'Aluminum', 'Iced Silver', 'Brass', 'Gateron Yellow', 'linear',
  true, 'Krytox 205g0', true, 'Deskeys', 'GMK Olivia', 'tape mod, PE foam, force break',
  'an aluminum 75% with a brass plate, gateron yellows lubed with krytox 205g0, and PE foam. deep, thocky, controlled — eight months of daily driving and i still grin every morning.',
  'this has been my daily driver for about eight months and i couldn''t be happier. the brass plate paired with PE foam gives a really satisfying thocky sound without being too loud — coworkers haven''t complained once on calls. the gateron yellows are buttery smooth after a coat of 205g0, and deskeys films tightened up the wobble nicely. build took maybe four hours start to finish, most of that lubing. tape mod made a bigger difference than expected.',
  9, ARRAY['deep','muted','thocky'], ARRAY['smooth','light','fast'], 'quiet', 'thockmaster_', 'lavender',
  NOW() - INTERVAL '5 days'
),
(
  'Onibi80', 'WKL', 'Aluminum', 'Iced Silver', 'Polycarbonate', 'Holy Pandas', 'tactile',
  true, '205g0 + GPL105 on springs', true, 'Deskeys', 'GMK Botanical', 'filmed springs, 2-step mod',
  'WKL aluminum case in iced silver, holy pandas filmed and lubed with 205g0 + GPL105 on the springs. a tactile bump that''s loud, proud, and unapologetic.',
  'holy pandas are divisive and i love that about them. everyone either wants that chunky bump or they don''t. i''m firmly in the yes camp. the WKL layout took some adjusting but now going back to a board with a right win key feels wrong.',
  8, ARRAY['deep','poppy','thocky'], ARRAY['heavy','fast','bouncy'], 'loud', 'kbd_oni', 'pink',
  NOW() - INTERVAL '1 week'
),
(
  'Tofu65', '65%', 'Polycarbonate', 'Frosted', 'FR4', 'Holy Pandas', 'tactile',
  true, 'Krytox 205g0', true, 'Deskeys', 'XDA Canvas', 'tempest mod, case foam',
  'polycarbonate 65% that somehow sounds better than boards triple its price. holy pandas on an FR4 plate hit different.',
  'the tempest mod was a game changer — free and takes ten minutes. if you haven''t tried it on a PC case, stop reading and go do it. the XDA canvas caps are growing on me; uniform row profile is weird at first but you stop noticing after a week.',
  8, ARRAY['deep','muted','thocky'], ARRAY['heavy','bouncy'], 'medium', 'evergrey', 'blue',
  NOW() - INTERVAL '2 days'
),
(
  'Mode Envoy', '60%', 'Aluminum', 'E-White', 'PC', 'Boba U4T', 'tactile',
  true, 'Krytox 205g0', false, null, 'GMK Striker', 'PE foam, band-aid mod',
  'a 60% that punches way above its weight. the PC plate takes the edge off the U4T bump and makes it genuinely enjoyable for long sessions.',
  'the band-aid mod on the PCB stabilizers was worth doing before anything else. stock U4Ts are already pretty good but the PE foam underneath mellows the sound from poppy to something more satisfying. e-white colorway photographs beautifully.',
  9, ARRAY['muted','thocky'], ARRAY['light','smooth'], 'quiet', 'soundtest_', 'cream',
  NOW() - INTERVAL '3 days'
),
(
  'KBD75v3', '75%', 'Steel', 'Black', 'FR4', 'Gateron Brown', 'tactile',
  true, 'Krytox 3204', false, null, 'PBT HKY', 'stock',
  'a budget-friendly 75% that gets out of your way. gateron browns lubed with 3204 are smoother than people give them credit for.',
  'yes, browns. i''m not ashamed. lubed browns on an FR4 plate are genuinely good and anyone who tells you otherwise hasn''t tried it. steel case keeps it planted and the thump is satisfying without being dramatic.',
  6, ARRAY['muted','clacky'], ARRAY['light','fast'], 'medium', 'browncow', 'olive',
  NOW() - INTERVAL '4 days'
),
(
  'Agar Mini', '40%', 'Polycarbonate', 'Clear', 'PC', 'Cherry BX', 'linear',
  true, 'Krytox 205g0', true, 'Kelowna', 'GMK Dots', 'stock',
  'a 40% that forces you to think differently about typing. once it clicks (pun intended), you can''t go back.',
  'people ask how i survive on 40%. i ask how they survive on anything bigger. the clear PC case looks incredible on a desk, especially with the GMK Dots colorway bleeding through. cherry BX linears are underrated — smooth, light, and quiet.',
  7, ARRAY['poppy','clacky'], ARRAY['light','fast'], 'quiet', 'tinyhands', 'lavender',
  NOW() - INTERVAL '6 days'
),
(
  'Discipline65', '65%', 'Carbon Fiber', 'Black', 'FR4', 'Boba U4', 'tactile',
  true, 'Krytox 3204', false, null, 'SA Opus', 'tape mod',
  'carbon fiber 65% that''s lighter than it looks and quieter than any board its size has a right to be. boba U4s in silent tactile mode.',
  'boba U4 silents on a CF case are whisper quiet. you can hear yourself think. the SA opus caps are tall and take adjustment — my wrists were angry for a week — but the look is worth it. tape mod is two strips of painter''s tape on the back of the PCB. free mod, massive difference.',
  8, ARRAY['muted','deep'], ARRAY['light','smooth'], 'quiet', 'lateniteclacks', 'slate',
  NOW() - INTERVAL '1 week'
),
(
  'Keychron Q1', '75%', 'Steel', 'Space Gray', 'Brass', 'Akko CS Jelly', 'linear',
  true, 'Krytox 205g0', true, 'TX Films', 'GMK Dracula', 'gasket foam, pe foam',
  'keychron Q1 with a brass plate upgrade. akko jelly linears are criminally underpriced for how smooth they are straight out of the bag.',
  'the stock Q1 is already a good board. swap the plate to brass, add akko jellies, lube with 205g0, and you have something special. the dracula colorway is polarizing — i love it, my coworkers are less sure.',
  7, ARRAY['deep','muted'], ARRAY['smooth','fast'], 'medium', 'qwertyqueen', 'blue',
  NOW() - INTERVAL '1 week'
),
(
  'Brutal60', '60%', 'Aluminum', 'Anodized Red', 'Aluminum', 'Zealios V2', 'tactile',
  true, '205g0 + Krytox 3204', true, 'Deskeys', 'DSA Vilebloom', 'band-aid mod',
  'brutal60 in anodized red — a statement piece that sounds as aggressive as it looks. zealios V2 have a strong bump that demands respect.',
  'zealios V2 67g. not for the faint of heart. the bump is assertive and the aluminum plate amplifies everything. not a quiet board, not trying to be. it''s a performance piece. the red case with DSA vilebloom is the best color combo i''ve ever put together.',
  9, ARRAY['deep','poppy','thocky'], ARRAY['bouncy','heavy'], 'loud', 'brut_force', 'olive',
  NOW() - INTERVAL '2 weeks'
),
(
  'Athena 1800', 'Full', 'Steel', 'Silver', 'Brass', 'Moon V2', 'tactile',
  true, 'Krytox 3204', true, 'TX Films', 'GMK Blue Samurai', 'stock',
  'a full-size steel build with brass plate and moon V2 tactiles. sometimes you just need all the keys.',
  'full size gets dismissed in the enthusiast community but my job involves a numpad and i''m not apologizing for it. the moon V2 bump is nuanced — tactile without screaming about it. steel and brass together give a heft that makes every keystroke feel intentional.',
  7, ARRAY['deep','muted'], ARRAY['heavy','smooth'], 'medium', 'midnight_typer', 'cream',
  NOW() - INTERVAL '2 weeks'
),
(
  'Bakeneko60', '60%', 'Polycarbonate', 'Milky White', 'PC', 'Alpacas', 'linear',
  true, 'Krytox 205g0', true, 'Deskeys', 'GMK Cafe', 'case foam',
  'the polycarbonate bakeneko with alpacas is the quietest, most satisfying linear build i''ve owned. the gasket mount does everything right.',
  'alpacas are the benchmark linear for a reason. lubed with 205g0 on a PC plate in a gummy gasket mount — this is what people mean when they say "thocky." the GMK Cafe caps complete the warm, cozy desk aesthetic i was going for. no regrets.',
  9, ARRAY['deep','thocky','muted'], ARRAY['smooth','light'], 'quiet', 'neko_thock', 'pink',
  NOW() - INTERVAL '2 weeks'
),
(
  'Class65', '65%', 'Brass', 'Polished', 'PC', 'Tangerines', 'linear',
  true, 'Krytox 205g0', true, 'Deskeys', 'KAT Cyberspace', 'PE foam',
  'a brass case 65% that weighs more than my laptop. tangerines are the smoothest linear i''ve typed on. this build is absurdly overbuilt and i love it.',
  'polished brass is a fingerprint magnet and i don''t care. the thing sounds incredible — deep and full in a way only a brass case can deliver. tangerines 67g are my new favorite linear. the KAT cyberspace colorway was worth the two-year group buy wait.',
  8, ARRAY['deep','thocky'], ARRAY['smooth','fast'], 'quiet', 'topclass', 'lavender',
  NOW() - INTERVAL '3 weeks'
),
(
  'Mode Sonnet', 'TKL', 'POM', 'Black', 'POM', 'Boba U4T', 'tactile',
  true, 'Krytox 3204', false, null, 'PBT HKY', 'stock',
  'mode sonnet TKL in all POM — case and plate. boba U4T on POM is something genuinely different from anything else i''ve typed on.',
  'POM plastic absorbs sound in a way other materials don''t. the sonnet is already a refined board but the POM configuration specifically has a character i can''t fully describe — present but not intrusive. boba U4T on POM is tactile but softer than on stiffer plate materials.',
  8, ARRAY['muted','thocky'], ARRAY['bouncy','heavy'], 'medium', 'iambicpent', 'slate',
  NOW() - INTERVAL '3 weeks'
),
(
  'QK65', '65%', 'Aluminum', 'Purple', 'FR4', 'Gateron Yellow', 'linear',
  true, 'Krytox 205g0', true, 'Deskeys', 'GMK Olivia', 'tape mod',
  'purple QK65 with GMK olivia. gateron yellows lubed and filmed — the smoothest budget linear setup that exists.',
  'QK65 is genuinely one of the best value boards on the market. purple ano is underrated. the olivia caps are overused but there''s a reason everyone keeps coming back to them — they just look right. gateron yellows with films and 205g0 perform at a level that has no right being this affordable.',
  8, ARRAY['muted','deep'], ARRAY['smooth','fast'], 'quiet', 'quantum_keys', 'olive',
  NOW() - INTERVAL '3 weeks'
),
(
  'NK87', 'TKL', 'Aluminum', 'Black', 'FR4', 'Cherry Black MX', 'linear',
  true, 'Krytox 204', false, null, 'GMK Minimal', 'stock',
  'NK87 TKL with cherry black MX switches — vintage linears that reward patience. heavy actuation, buttery smooth after a good lube job.',
  'cherry blacks are for people who type with intent. the heavy actuation filters out accidental keystrokes completely. lubing vintage blacks with 204g2 is therapeutic — the springs alone take an hour. the payoff is a board that feels unlike anything modern. NK87 is a solid, unpretentious TKL.',
  7, ARRAY['clacky','poppy'], ARRAY['fast','light'], 'loud', 'nokey87', 'blue',
  NOW() - INTERVAL '4 weeks'
);
