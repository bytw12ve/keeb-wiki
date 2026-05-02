# AGENTS.md

Guidance for Codex when working in this repository.

## Commands

```bash
npm run dev       # start Vite dev server
npm run build     # production build -> dist/
npm run preview   # serve the dist/ build locally
```

No test runner or linter is configured. There are no pre-commit hooks. Commits require bypassing GPG signing in this environment:

```bash
git -c commit.gpgsign=false commit
```

## Stack

- Vite + React 18 JSX
- React Router v6
- Supabase JS client
- No TypeScript
- No CSS modules
- Inline style objects for component/page layout
- Global CSS only in `src/tokens.css`

## Routes

- `/` -> `HomePage`
- `/builds` -> `BuildsPage`
- `/builds/:slug` -> `DetailsPage`
- `/wiki` -> `WikiPage`
- `/wiki/:slug` -> `WikiArticlePage`
- `/submit` -> `SubmitBuildPage`
- `/submit-wiki` -> `SubmitWikiPage`

## Design System

Do not change the color palette or font unless explicitly requested.

- `src/tokens.js` contains `KW`, `TINT`, `tagKind()`, and `LOGO_COLORS`.
- `src/tokens.css` contains CSS custom properties and Anonymous Pro `@font-face`.
- Components use `KW.*` for inline colors.
- Use `var(--kw-mono)` for font shorthand strings.
- Keep content in bubble/card style: surface background, 1px border, 8px radius.
- Keep pages full browser width. Do not add a max-width wrapper to the page element itself.
- Section-level max widths are okay where already used by the app.

## Data Layer

`src/lib/supabase.js` owns the Supabase client and helpers.

Build helpers:
- `fetchBuilds({ q, filter })`
- `fetchBuildBySlug(slug)`
- `getArt(build)`
- `getLayoutCode(layout)`
- `getBuildTags(build)`
- `buildSlug(name)`

Wiki helpers:
- `fetchWikiArticles({ category, status, limit })`
- `fetchWikiArticleBySlug(slug)`
- `searchWikiArticles(q)`
- `submitWikiArticle(data)`

Notes:
- The Supabase publishable key is intentionally hardcoded; no `.env` is required.
- `CATEGORY_SLUG_MAP` is internal to `supabase.js`.
- Wiki submissions insert as `status: 'pending'`.
- `getArt(build)` falls back to palette inference from `case_material`.
- `fetchBuildBySlug(slug)` uses exact slug plus fuzzy name fallback.

## Supabase

SQL files must be run manually in the Supabase SQL Editor.

- `supabase/seed.sql` creates/seeds `builds`, storage buckets, RLS policies, and upload limits.
- `supabase/wiki.sql` creates/seeds `wiki_articles` and the `updated_at` trigger.
- `supabase/security_fixes.sql` applies Security Advisor fixes for existing projects.

Important columns:
- `builds.photos` stores public Supabase Storage URLs.
- `builds.sound_signature` and `builds.typing_feel` are text arrays.
- `wiki_articles.category` values: `beginner-guides`, `modding-guides`, `parts-glossary`, `sound-feel`, `community-buying`, `about`.
- `wiki_articles.format` values: `sections`, `combined`.
- `wiki_articles.status` values: `draft`, `pending`, `published`.

Supabase SQL editor note:
- Price strings in `wiki.sql` seed JSON should use JSON unicode escaping for dollar signs inside `$j$...$j$` literals so the editor does not treat them as query parameters.

## Components And Conventions

- `src/components/KeebArt.jsx` renders procedural keyboard art. It accepts `palette`, `layout`, and `seed`.
- `src/components/Tag.jsx` uses `tagKind()` and `TINT` for colored tag pills.
- Active nav link detection uses `useLocation()` with `startsWith` checks.
- Wiki search state uses `useSearchParams`, so `?q=...` is shareable.
- Wiki category browsing uses `?category=...`.
- Wiki article TOC uses `IntersectionObserver`.
- Wiki article reading progress is a fixed 2px lavender bar at the top.

## Hard Rules

- Do not break existing working features.
- Do not remove existing components unless explicitly requested.
- Do not modify `/project/`; it is design reference only.
- Keep the site visual language consistent with the current bubble/card style.
- Prefer small, focused changes and verify with `npm run build`.

## Completed Phase 1

- Removed bottom wiki article back link and kept a top back link.
- Fixed duplicate wiki article tags.
- Added build detail photo lightbox/carousel for real uploaded photos.
- Removed placeholder gallery text.
- Matched sound & feel card styling to lavender.
- Removed footer RSS/About links.
- Added Supabase Security Advisor fixes.
- Added upload limits: 5MB photos, 10MB audio.
- Added hidden watermark comments: `/* built by twelve. — bytw12ve */`.
- Added wiki category browsing, homepage wiki section, and wiki article submit callouts.

## Current Phase — Phase 2

- [ ] User auth — sign up, log in, log out via Supabase Auth
- [ ] User profile page — see own builds and comments
- [ ] Edit and delete own posts
- [ ] Comments on builds and wiki articles
- [ ] Upvote and favorite builds
- [ ] Custom tags when submitting wiki articles
- [ ] Audio file upload with size limits

## Phase 3

- [ ] Admin panel with staff permissions
- [ ] Homepage background visual upgrade
- [ ] More homepage sections
- [ ] Contact page
- [ ] Suggestions page
- [ ] Full build photo gallery polish
