{\rtf1\ansi\ansicpg1252\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww34000\viewh19080\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # keeb.wiki \'97 Project Cheat Sheet\
\
## What This Is\
Community mechanical keyboard build archive. Users browse builds, submit their own, and read wiki articles. Built by Jaycee / twelve. studio.\
\
## Tech Stack\
- Vite + React (frontend)\
- Supabase (database, auth, storage)\
- Vercel (deployment)\
- React Router (navigation)\
- Anonymous Pro (monospace font throughout)\
\
## Project Location\
/Users/jaycee/Documents/GitHub/keeb-wiki\
\
## Design System\
- Background: #1E1B2E\
- Surface/cards: #17142A\
- Elevated: #2D2845\
- Border: #3D3660\
- Lavender (primary): #B8A9E0\
- Pink (secondary): #E8A8C0\
- Blue (secondary): #A8C8E8\
- Text primary: #F5F2E8\
- Text muted: #9B91B8\
- Font: Anonymous Pro monospace\
- Card radius: 8px\
- All content uses bubble/card style with 1px borders\
\
## Tag Pills \'97 Color Coded\
- Layout tags: lavender #2D1F4A / #B8A9E0\
- Switch tags: blue #1F2D3A / #A8C8E8\
- Material tags: pink #2D1F2A / #E8A8C0\
- Wiki category tags: match above by type\
\
## Pages Built\
- / \'97 Homepage (hero, featured builds, browse filters, recent builds, CTA)\
- /builds \'97 Builds Gallery (search, filter pills, 5 col grid, pagination)\
- /builds/:slug \'97 Build Detail (specs, builder notes, sound profile, gallery)\
- /submit \'97 Submit Build (form saves to Supabase)\
- /wiki \'97 Wiki Landing (category cards, recently updated)\
- /wiki/:slug \'97 Wiki Article (sections/combined toggle, TOC sidebar)\
- /wiki/submit \'97 Submit Wiki Article (format selector, sections/combined)\
\
## Database \'97 Supabase\
### builds table\
id, slug, name, layout, case_material, case_color, plate, switches, switch_type, lubed, lube_type, filmed, film_brand, keycaps, mods, description, builder_notes, rating, sound_signature[], typing_feel[], sound_level, photos[], submitted_by, art, created_at\
\
### wiki_articles table\
id, slug, title, category, short_description, tags[], format, content (JSONB), combined_content, submitted_by, status, created_at, updated_at\
\
## Supabase Storage\
- Bucket: build-photos (public)\
\
## Nav Logo\
KEEB\'95WIKI spelled out as keyboard key caps \'97 K(lavender) E(pink) E(blue) B(pink) \'95 W(lavender) I(blue) K(lavender) I(pink)\
\
## Rules \'97 Never Break These\
- Never change existing working features\
- Never change the color palette or font\
- Never remove existing components\
- Always keep Anonymous Pro font\
- Always use bubble/card style for content\
- Keep site width full browser width \'97 no max-width container on the page\
\
## Current Status\
- Homepage \uc0\u9989  working\
- Builds Gallery \uc0\u9989  working with filters and search\
- Build Detail \uc0\u9989  dynamic from Supabase\
- Submit Build \uc0\u9989  saves to Supabase\
- Wiki Landing \uc0\u9888 \u65039  needs wiki_articles table seeded\
- Wiki Article \uc0\u9888 \u65039  needs wiki_articles table seeded\
- Submit Wiki Article \uc0\u9989  built\
\
## Known Issues\
- wiki_articles SQL seed failing due to dollar signs in price ranges being interpreted as SQL parameters \'97 needs escaping\
\
## Next Steps\
1. Fix wiki_articles SQL seed error\
2. Add user accounts via Supabase Auth\
3. Add upvoting system for builds\
4. Add build of the week to homepage\
5. Add real keyboard photos to builds\
6. Add comments on builds\
7. Deploy to Vercel}