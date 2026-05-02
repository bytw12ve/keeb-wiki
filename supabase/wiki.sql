-- keeb.wiki — wiki_articles table schema + seed
-- built by twelve. — bytw12ve
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/yxucqsofablzsgyeyrmb/sql

-- ── 1. Table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wiki_articles (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug             TEXT        UNIQUE NOT NULL,
  title            TEXT        NOT NULL,
  category         TEXT        NOT NULL CHECK (category IN (
                     'beginner-guides','modding-guides','parts-glossary',
                     'sound-feel','community-buying','about')),
  short_description TEXT,
  tags             TEXT[]      DEFAULT '{}',
  format           TEXT        NOT NULL DEFAULT 'sections' CHECK (format IN ('sections','combined')),
  content          JSONB,          -- sections format: [{heading, body, bullets[], tip}]
  combined_content TEXT,           -- combined format: plain prose
  submitted_by     TEXT,
  status           TEXT        DEFAULT 'pending' CHECK (status IN ('draft','pending','published')),
  read_time        TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. RLS ───────────────────────────────────────────────────────
ALTER TABLE public.wiki_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wiki_read_published" ON public.wiki_articles;
CREATE POLICY "wiki_read_published" ON public.wiki_articles
  FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "wiki_insert" ON public.wiki_articles;
CREATE POLICY "wiki_insert" ON public.wiki_articles
  FOR INSERT TO anon, authenticated WITH CHECK (status IN ('draft','pending'));

-- ── 3. updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS wiki_articles_updated_at ON public.wiki_articles;
CREATE TRIGGER wiki_articles_updated_at
  BEFORE UPDATE ON public.wiki_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 4. Seed ──────────────────────────────────────────────────────

-- ── modding-guides: how to lube switches ─────────────────────────
INSERT INTO public.wiki_articles
  (slug,title,category,short_description,tags,format,content,submitted_by,status,read_time,created_at,updated_at)
VALUES (
  'how-to-lube-switches',
  'how to lube switches.',
  'modding-guides',
  'a complete guide to lubing your switches for a smoother, better sounding board.',
  ARRAY['modding','beginner friendly','switches'],
  'sections',
  $j$[
    {"heading":"what you'll need","body":null,"bullets":["switch opener","lube — krytox 205g0 for linears, 3203 for tactiles","small brush","stem holder (optional but helpful)"],"tip":null},
    {"heading":"step 1 — open the switch","body":"Use your switch opener to carefully pop open the top housing. Place the opener on the four clips and press down gently. Be careful — forcing it can break the clips on cheaper switches.","bullets":null,"tip":"open all your switches first before lubing. it makes the whole process faster and more consistent."},
    {"heading":"step 2 — lube the bottom housing","body":"Apply a thin, even coat to the inside rails of the bottom housing where the stem legs travel. Less is more — avoid the leaf spring on linears or you'll dampen the tactility.","bullets":null,"tip":null},
    {"heading":"step 3 — lube the stem","body":"Apply lube to the legs and the bottom of the stem pole. For linears lube all four sides of the legs. For tactiles, avoid the legs entirely — it kills the bump. Too much lube is the most common mistake. Thin coats only.","bullets":null,"tip":"too much lube on the stem is the most common mistake. thin coats only."},
    {"heading":"step 4 — reassemble","body":"Place the stem back in the bottom housing, add the spring, and clip the top housing back on. Test the switch — it should feel smooth with no scratchiness. If it feels mushy you've used too much lube.","bullets":null,"tip":null}
  ]$j$::jsonb,
  'admin','published','~15 min read',
  NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
) ON CONFLICT (slug) DO NOTHING;

-- ── beginner-guides: understanding layouts ────────────────────────
INSERT INTO public.wiki_articles
  (slug,title,category,short_description,tags,format,content,submitted_by,status,read_time,created_at,updated_at)
VALUES (
  'understanding-layouts',
  'understanding layouts — 60% vs 75% vs TKL.',
  'beginner-guides',
  'a breakdown of every common keyboard layout size and what each one is actually good for.',
  ARRAY['beginner','layout','beginner friendly'],
  'sections',
  $j$[
    {"heading":"why layout size matters","body":"The layout determines which keys you have, how compact the board is, and how much desk space it takes up. There's no universally best layout — it depends entirely on what you type and how you work.","bullets":null,"tip":null},
    {"heading":"40% — the minimalist","body":"Only the core alpha cluster plus modifiers. No number row, no function row, no arrows. Everything is on layers. Loved by programmers and people who travel. Requires significant adjustment — expect at least two weeks before it feels natural.","bullets":null,"tip":"try a 40% at a meet before buying. it's not for everyone."},
    {"heading":"60% — the classic","body":"The most popular enthusiast layout. Includes alphas, number row, and modifiers. No function row, no arrow cluster, no nav cluster. Arrow keys are accessed via a function layer — usually fn + WASD or fn + IJKL. Great for gaming and everyday typing.","bullets":null,"tip":null},
    {"heading":"65% — the sweet spot","body":"Like a 60% but with dedicated arrow keys and a few nav keys (delete, home, end, page up/down) on the right. Adds almost no width but dramatically improves usability. The most recommended layout for most people.","bullets":null,"tip":"if you're unsure what to buy, start with a 65%."},
    {"heading":"75% — compact with function row","body":"Includes a function row above the number row, plus arrows and a small nav cluster. Still significantly smaller than a TKL. Great for people who use function keys frequently (IDE shortcuts, macOS shortcuts) but want a compact board.","bullets":null,"tip":null},
    {"heading":"TKL (tenkeyless) — the versatile standard","body":"A full-size keyboard without the numpad. Includes everything you'd expect: function row, nav cluster, arrow keys. The most versatile layout — almost nothing is missing. Good for people transitioning from full-size who aren't ready to commit to something more compact.","bullets":null,"tip":null},
    {"heading":"WKL — winkeyless","body":"Usually a TKL or 60% layout that removes the Windows key, leaving blank blockers in its place. Purely aesthetic — the layout is otherwise identical. Popular in the enthusiast community for the cleaner look.","bullets":null,"tip":null},
    {"heading":"full size — the complete keyboard","body":"Includes everything including the numpad. The least popular in the enthusiast space because the numpad pushes the mouse further right, causing shoulder strain during gaming. Still the right choice if you do a lot of data entry.","bullets":null,"tip":null}
  ]$j$::jsonb,
  'admin','published','~8 min read',
  NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
) ON CONFLICT (slug) DO NOTHING;

-- ── parts-glossary: keycap profiles ─────────────────────────────
INSERT INTO public.wiki_articles
  (slug,title,category,short_description,tags,format,content,submitted_by,status,read_time,created_at,updated_at)
VALUES (
  'keycap-profiles',
  'keycap profiles — cherry, OEM, SA, KAT, MT3.',
  'parts-glossary',
  'a plain language explanation of every major keycap profile and which one is right for you.',
  ARRAY['glossary','keycaps','beginner friendly'],
  'sections',
  $j$[
    {"heading":"what is a keycap profile","body":"Profile refers to the shape of the keycap — specifically its height, the angle of the top face, and how the height changes across rows. Different profiles produce different typing sounds, feels, and aesthetics. There's no universally best profile; it's personal preference.","bullets":null,"tip":null},
    {"heading":"cherry profile — the reference","body":"Cherry profile is low, sculpted, and widely considered the benchmark. Keys are shorter than OEM with a gentle row-to-row height variation. It feels fast and precise. Most group buy keysets use cherry profile because of its versatility. If you don't know what profile you like, start here.","bullets":null,"tip":"cherry profile is compatible with nearly every board and feels consistent across all row positions."},
    {"heading":"OEM profile — the stock standard","body":"OEM is what ships on most membrane keyboards. It's taller than cherry with more pronounced row sculpting. Some people love the familiar feel; others find it too tall or angled. If you've been typing on a standard keyboard your whole life, OEM will feel immediately familiar.","bullets":null,"tip":null},
    {"heading":"SA profile — the tall classic","body":"SA is a high-profile, spherical-top design based on vintage typewriter keycaps. Very tall, strongly sculpted, and with a distinctive clack due to the thick walls. Looks stunning on the right board but can cause wrist strain without a wrist rest. Takes adjustment if you're coming from a low profile.","bullets":null,"tip":"SA pairs best with heavy, tactile, or clicky switches. the tall profile amplifies sound."},
    {"heading":"KAT profile — the modern SA","body":"KAT is SA-inspired but slightly lower and with a uniform row profile (all rows the same height). Thick walls like SA, but less wrist-demanding. Good if you love the SA look but find the height uncomfortable. Relatively new — fewer colorway options than cherry or SA.","bullets":null,"tip":null},
    {"heading":"MT3 profile — the typewriter","body":"Designed by matt3o, MT3 is a deep-dish, heavily sculpted profile modeled on vintage typewriter caps. The deepest dish of any modern profile — your fingertips fall naturally into the center of each keycap. Pairs well with tactile switches. Limited colorway selection but growing fast.","bullets":null,"tip":"mt3 is divisive — try it at a meetup before committing to a full set."},
    {"heading":"XDA and DSA — uniform profiles","body":"Both XDA and DSA are uniform profiles: all rows are the same height. DSA is slightly shorter; XDA is slightly taller. Neither has row sculpting, which divides opinion. Some people love the consistent feel; others find the lack of sculpting disorienting. Often cheaper and available in more off-the-shelf options.","bullets":null,"tip":null},
    {"heading":"which profile should i start with","body":"Start with cherry if you want the safest choice that works on any board and has the most group buy options. Try OEM if you want something immediately familiar. Avoid SA or MT3 until you've spent time on a lower profile and know you want to go tall.","bullets":null,"tip":null}
  ]$j$::jsonb,
  'admin','published','~10 min read',
  NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week'
) ON CONFLICT (slug) DO NOTHING;

-- ── sound-feel: mount styles explained ──────────────────────────
INSERT INTO public.wiki_articles
  (slug,title,category,short_description,tags,format,content,submitted_by,status,read_time,created_at,updated_at)
VALUES (
  'mount-styles-explained',
  'mount styles explained — gasket vs top mount vs tray.',
  'sound-feel',
  'how the way a PCB is mounted in its case shapes the sound, feel, and flex of your keyboard.',
  ARRAY['sound','modding','sound & feel'],
  'sections',
  $j$[
    {"heading":"what is a mount style","body":"Mount style describes how the PCB and plate are attached inside the case. It's one of the biggest factors in how a keyboard sounds and feels — often more impactful than switch choice. The same switches can sound completely different in two boards with different mount styles.","bullets":null,"tip":null},
    {"heading":"tray mount — the budget standard","body":"The PCB screws directly to the bottom of the case with no plate. Found on most budget and entry-level boards. No flex, no give, every keystroke transfers directly to the case. Can sound bright or pingy depending on the case material. The Keychron C-series and most membrane boards use this.","bullets":null,"tip":"tray mount boards benefit the most from foam mods — band-aid, PE foam, and case foam make a big difference."},
    {"heading":"top mount — the traditional design","body":"The plate screws into the top half of the case. Stiffer than gasket but with a cleaner, more uniform sound. Mid-range to high-end boards often use top mount. Slightly more flex than tray, but the sound profile is more controlled. The plate and top case act as one rigid unit.","bullets":null,"tip":null},
    {"heading":"bottom mount — underrated flex","body":"The plate screws into the bottom case half instead of the top. Creates a slight upward flex on keypresses. Less common than top mount but popular in some budget-to-mid boards. Can feel surprisingly bouncy for a screwed-in design.","bullets":null,"tip":null},
    {"heading":"gasket mount — the modern standard","body":"The plate rests on silicone or poron gaskets instead of screwing rigidly into the case. This gives the board flex — every keypress has a slight give to it. Gasket mount produces the round, full, 'thocky' sound signature that the enthusiast community gravitates toward. Most high-end boards (Mode, Satisfaction, Keychron Q series) use gasket mount.","bullets":null,"tip":"flex cuts in the PCB, PE foam, and switch choice all interact with gasket mount differently — experiment."},
    {"heading":"top mount gasket — the hybrid","body":"Some boards attach gaskets to the top case only, creating a half-gasket effect. Less dramatic flex than full gasket but more forgiving than a rigid top mount. A middle ground for people who want some give without the 'mushy' feel that full gasket can produce.","bullets":null,"tip":null},
    {"heading":"which mount should i look for","body":"If you're new: try a gasket mount board. The Bakeneko60, KBD67 Lite, and Keychron Q series are accessible entry points. If you already have a tray mount board: add foam mods before buying a new board — the improvement is dramatic. If you want maximum flex: look for gasket mount with silicone dampening and force-break cuts in the PCB.","bullets":null,"tip":null}
  ]$j$::jsonb,
  'admin','published','~10 min read',
  NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks'
) ON CONFLICT (slug) DO NOTHING;

-- ── community-buying: where to buy ──────────────────────────────
INSERT INTO public.wiki_articles
  (slug,title,category,short_description,tags,format,content,submitted_by,status,read_time,created_at,updated_at)
VALUES (
  'where-to-buy',
  'where to buy keyboards.',
  'community-buying',
  'a guide to reputable vendors, group buys, and how to avoid getting burned.',
  ARRAY['community','buying guide','beginner friendly'],
  'sections',
  $j$[
    {"heading":"in-stock vendors — the safe choice","body":"In-stock vendors let you buy immediately without waiting months. They're the best starting point for beginners. Expect to pay a slight premium over group buy prices.","bullets":["Novelkeys (US) — wide selection, fast shipping, strong community rep","Cannonkeys (US) — group buys and in-stock, reliable","KBDfans (CN) — budget-friendly, more risk, slower shipping","Mekibo (US) — curated high-end selection","Keebwerk (EU) — well-regarded European vendor","Daily Clack (AU) — Australian market standard"],"tip":null},
    {"heading":"group buys — how they work","body":"A group buy (GB) is a pre-order where a designer takes orders for a limited run of a product. You pay upfront, wait anywhere from 3 months to 2+ years, and receive the product when production completes. GBs are how most high-end keysets and premium boards are produced. The upside: unique products at reasonable prices. The downside: long waits and occasional project failures.","bullets":null,"tip":"never spend money on a group buy that you'd be upset to lose. runner failures happen."},
    {"heading":"what to look for in a runner","body":"The person running a GB (the 'runner') is responsible for everything. Research them before buying.","bullets":["check their history — have they run successful GBs before?","look for a clear refund policy","verify the manufacturer is confirmed, not just 'in talks'","avoid runners with no previous project history or community presence","read the GeekHack or Geekhack thread — community sentiment matters"],"tip":null},
    {"heading":"r/mechmarket — the secondhand market","body":"r/mechmarket is the main secondhand marketplace for the hobby. You can find everything here — from complete boards to individual switches — often at significant discounts. Use the flair system, check seller history, and use PayPal Goods & Services (never friends and family). It's safe if you do your due diligence.","bullets":null,"tip":"always check a seller's trade history before sending payment."},
    {"heading":"local meetups and classifieds","body":"Many cities have local keyboard communities. Local meetups are a great place to buy, sell, and trade without shipping risk. Check r/mechanicalkeyboards, local Discord servers, and Facebook groups for your region.","bullets":null,"tip":null},
    {"heading":"red flags to watch for","body":"Not every vendor or GB is trustworthy. Watch for these warning signs.","bullets":["no refund policy or 'no refunds ever' language","runner who has never shipped a project before","unrealistically low prices (below cost)","no moq (minimum order quantity) listed for a GB","social media presence but no community presence on forums","payment via Zelle, Venmo, or Cash App only"],"tip":"if something feels off, it probably is. the community has good memory — check before you pay."}
  ]$j$::jsonb,
  'admin','published','~8 min read',
  NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks'
) ON CONFLICT (slug) DO NOTHING;

-- ── about: what is keeb.wiki ─────────────────────────────────────
INSERT INTO public.wiki_articles
  (slug,title,category,short_description,tags,format,combined_content,submitted_by,status,read_time,created_at,updated_at)
VALUES (
  'what-is-keeb-wiki',
  'what is keeb.wiki.',
  'about',
  'learn what keeb.wiki is, how it started, and how you can get involved.',
  ARRAY['about','community'],
  'combined',
  'keeb.wiki is a community-driven archive for mechanical keyboard builds. it started as a simple idea: there should be a place where builders can document their builds in detail, and where people who are curious about a board can find real-world information — not just spec sheets.

every build in the archive is submitted by the person who built it. they fill in the specs, write their notes, rate the board, and upload photos. the result is a growing library of real builds, with real opinions, from real people who spent real money and time on their keyboards.

the wiki is the companion to the archive. it covers everything you need to know to get started, go deeper, or understand why certain things sound and feel the way they do.

keeb.wiki has no ads, no algorithm, no sponsored content, and no affiliate links. it''s maintained by the community for the community.

how to contribute: submit a build using the submit page. no account required. fill in as much as you can — detailed builds help the most people. if you want to write a wiki article, use the submit wiki page. articles are reviewed before going live, usually within a few days.

the team: keeb.wiki is maintained by a small group of volunteers from the mechanical keyboard community. if you want to get involved, reach out via the contact page.',
  'admin','published','~3 min read',
  NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month'
) ON CONFLICT (slug) DO NOTHING;

-- ── beginner-guides: choosing your first board ───────────────────
-- NOTE: dollar signs in price ranges are written as the JSON unicode escape $
--       so that PostgreSQL's JSONB parser decodes them to $ correctly, while
--       avoiding Supabase SQL editor treating \u002450 / \u0024100 etc. as query parameters.
INSERT INTO public.wiki_articles
  (slug,title,category,short_description,tags,format,content,submitted_by,status,read_time,created_at,updated_at)
VALUES (
  'choosing-your-first-board',
  'choosing your first board.',
  'beginner-guides',
  'what to actually look for when buying your first mechanical keyboard.',
  ARRAY['beginner','beginner friendly','budget'],
  'sections',
  $j$[
    {"heading":"set a realistic budget","body":"You can get a genuinely good keyboard for \u002450–150. You don't need to spend \u0024300+ for your first board. The diminishing returns above \u0024150 are real — a \u0024400 board doesn't type four times better than a \u0024100 one. Start modest, figure out what you like, then invest more deliberately.","bullets":null,"tip":"the best first board is one you'll actually use. don't let perfect be the enemy of good."},
    {"heading":"pick a layout first","body":"Decide how many keys you need before looking at any specific boards. If you use a numpad daily, don't buy a 60%. If you never use function keys, you probably don't need a 75%. Layout is the hardest thing to change — everything else is modifiable.","bullets":["numpad user → full size or 1800 layout","function keys + arrows needed → 75% or TKL","want compact but arrows are non-negotiable → 65%","want maximum desk space, fine with layers → 60% or 40%"],"tip":null},
    {"heading":"switch type matters more than you think","body":"Linear, tactile, and clicky switches feel and sound completely different. If possible, try before you buy. Most cities have a keyboard meetup or a store with a tester. Online, Novelkeys and Cannonkeys sell switch testers for under \u002420.","bullets":["linear — smooth keypress with no bump, quiet (with right switches). good for gaming and fast typists","tactile — a physical bump at the actuation point. popular for typing. boba U4T and Holy Pandas are well-regarded","clicky — bump plus an audible click. satisfying but loud. not office-friendly"],"tip":"if you're unsure, start with a tactile. most people find the bump intuitive."},
    {"heading":"case material affects everything","body":"Polycarbonate cases are soft, bouncy, and translucent. Aluminum cases are rigid, heavy, and have a fuller sound. Plastic cases vary widely. For a first board, polycarbonate or plastic is fine — you'll understand case material preferences better after you've tried a few boards.","bullets":null,"tip":null},
    {"heading":"where to start — specific recommendations","body":null,"bullets":["\u002450–80: Keychron C3 Pro or Akko 5075B — good entry-level tray mount boards","\u002480–130: Keychron V series — gasket mount, hot swap, QMK/VIA. the best value in this range","\u0024130–180: KBD67 Lite or Bakeneko60 — proper enthusiast gasket mount boards at reasonable prices","\u0024180–300: Mode Sixty-Five, Zoom65 — stepping into premium territory with matching build quality"],"tip":"hot swap (no soldering required to swap switches) is highly recommended for a first board."}
  ]$j$::jsonb,
  'admin','published','~10 min read',
  NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
) ON CONFLICT (slug) DO NOTHING;

-- ── parts-glossary: switch types explained ───────────────────────
INSERT INTO public.wiki_articles
  (slug,title,category,short_description,tags,format,content,submitted_by,status,read_time,created_at,updated_at)
VALUES (
  'switch-types-explained',
  'switch types explained — linear, tactile, clicky.',
  'parts-glossary',
  'what makes linear, tactile, and clicky switches different, and which one is right for you.',
  ARRAY['glossary','switches','beginner friendly'],
  'sections',
  $j$[
    {"heading":"how switches work","body":"Every mechanical switch has a stem that travels down a housing when you press a key. The stem's shape and the spring determine how the keypress feels and sounds. The three main types — linear, tactile, and clicky — describe the character of that travel.","bullets":null,"tip":null},
    {"heading":"linear switches — smooth all the way down","body":"Linear switches offer a smooth, consistent keystroke from top to bottom with no bump or click. The resistance increases gradually as you compress the spring, then the key bottoms out. Great for gaming (fewer accidental actuations) and fast typists who prefer a clean feel. Popular linears: Gateron Yellow, Alpacas, Tangerines, Cherry Black MX.","bullets":null,"tip":"linear switches benefit most from lubing — a good lube job can transform a scratchy linear into something butter-smooth."},
    {"heading":"tactile switches — feel the actuation point","body":"Tactile switches have a noticeable bump partway through the keypress that corresponds roughly to the actuation point. You can feel when the key registers without bottoming out. Great for typing. Popular tactiles range from subtle (Gateron Brown, Cherry MX Brown) to pronounced (Boba U4T, Holy Pandas, Topre).","bullets":null,"tip":"avoid Cherry MX Browns if you want a clear tactile bump — the bump is too subtle for most people and they end up feeling scratchy instead."},
    {"heading":"clicky switches — hear it and feel it","body":"Clicky switches have both a tactile bump and an audible click at the actuation point. The click comes from a click jacket or click bar mechanism that produces a sharp, loud sound. Satisfying for typists; widely considered inconsiderate in shared spaces. Popular clickies: Cherry MX Blue, Kailh Box White, Aristotle clones.","bullets":null,"tip":"clicky switches are loud. if you're buying for an office, get a quiet linear or a silent tactile instead."},
    {"heading":"spring weight — actuation force","body":"Within each type, springs come in different weights measured in grams (g). Lighter springs (35–45g) feel easy and fast. Heavier springs (65–80g) feel deliberate and resist accidental keypresses. Most people start with 45–67g and go from there. Spring weight is personal — what feels perfect to one person feels exhausting to another.","bullets":null,"tip":null},
    {"heading":"which type should i start with","body":"If you're unsure: start with a light tactile like a Boba U4 (silent) or Boba U4T (not silent). They're forgiving, satisfying, and work well for both typing and gaming. Buy a switch tester with a few options before committing to 70+ switches.","bullets":null,"tip":null}
  ]$j$::jsonb,
  'admin','published','~7 min read',
  NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
) ON CONFLICT (slug) DO NOTHING;

-- ── modding-guides: tape mod walkthrough ────────────────────────
INSERT INTO public.wiki_articles
  (slug,title,category,short_description,tags,format,content,submitted_by,status,read_time,created_at,updated_at)
VALUES (
  'tape-mod-walkthrough',
  'tape mod walkthrough.',
  'modding-guides',
  'the free mod that makes tray mount boards sound dramatically better — takes five minutes.',
  ARRAY['modding','sound','budget'],
  'sections',
  $j$[
    {"heading":"what is the tape mod","body":"The tape mod involves applying strips of masking tape to the underside of the PCB. It dampens the hollow resonance that's common in tray mount boards, giving a softer, more muted sound with less ping. It's completely free, reversible, and one of the highest-impact mods you can do.","bullets":null,"tip":"this is the first mod to try on any tray mount board. costs nothing and takes five minutes."},
    {"heading":"what you'll need","body":null,"bullets":["painter's tape or masking tape (any width — 1 inch works well)","scissors","your board (disassembled to the PCB level)"],"tip":null},
    {"heading":"step 1 — disassemble your board","body":"Open your board and remove the PCB from the case. You want access to the back side of the PCB (the side without switches). You don't need to remove the switches.","bullets":null,"tip":null},
    {"heading":"step 2 — apply the tape","body":"Apply strips of tape across the back of the PCB, covering as much of the surface area as possible. Avoid covering any USB ports, reset buttons, or obviously functional components. One layer is usually enough — some people go up to three layers for a more muted sound.","bullets":null,"tip":"three layers gives a noticeably more dampened sound. experiment with one, two, and three layers to find your preference."},
    {"heading":"step 3 — reassemble and test","body":"Put the board back together and type on it. You should hear a noticeably softer, more muted sound compared to before — less high-pitched ping, more rounded thud. If the result is too muted, remove a layer. If you want more dampening, add one.","bullets":null,"tip":null},
    {"heading":"troubleshooting","body":"If you don't hear a difference: make sure you've covered most of the PCB surface. A few small strips won't do much. If the board sounds too dead: reduce to one layer or switch to a thinner tape (low-adhesion drafting tape vs standard painter's tape).","bullets":null,"tip":null}
  ]$j$::jsonb,
  'admin','published','~5 min read',
  NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
) ON CONFLICT (slug) DO NOTHING;
