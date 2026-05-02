# CLAUDE.md

Guidance for Claude Code when working in this repository.

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
- `/builds/:slug/edit` -> `BuildEditPage` (protected)
- `/wiki` -> `WikiPage`
- `/wiki/:slug` -> `WikiArticlePage`
- `/wiki/:slug/edit` -> `WikiEditPage` (protected)
- `/submit` -> `SubmitBuildPage`
- `/submit-wiki` -> `SubmitWikiPage`
- `/login` -> `LoginPage`
- `/profile` -> `ProfilePage` (protected)

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
- `fetchStaffPickBuilds({ limit })`
- `fetchBuildBySlug(slug)`
- `getArt(build)`
- `getLayoutCode(layout)`
- `getBuildTags(build)`
- `buildSlug(name)`
- `buildRouteSlug(build)`

Wiki helpers:
- `fetchWikiArticles({ category, status, limit })`
- `fetchWikiArticleBySlug(slug)`
- `searchWikiArticles(q)`
- `submitWikiArticle(data)`

Auth/profile helpers:
- `getSessionUser()`
- `signUp({ email, password, username })`
- `signIn({ email, password })`
- `signInWithGoogle()`
- `signOut()`
- `fetchProfile(id)`
- `upsertProfile({ id, username })`
- `fetchOwnBuilds(userId)`
- `fetchOwnWikiArticles(userId)`
- `updateOwnBuild(id, patch)`
- `softDeleteOwnBuild(id)`
- `updateOwnWikiArticle(id, patch)`
- `softDeleteOwnWikiArticle(id)`

Notes:
- The Supabase publishable key is intentionally hardcoded; no `.env` is required.
- `CATEGORY_SLUG_MAP` is internal to `supabase.js`.
- Build and wiki submissions insert as `status: 'pending'`.
- Public reads show published, non-deleted content; signed-in users can also see their own pending content.
- Existing seeded rows with `user_id = null` are legacy/system-owned content and are not editable by normal users.
- `getArt(build)` falls back to palette inference from `case_material`.
- `fetchBuildBySlug(slug)` uses exact slug plus fuzzy name fallback.
- Homepage staff picks are explicit manual/admin selections. Published community builds must not automatically become featured.

## Supabase

SQL files must be run manually in the Supabase SQL Editor.

- `supabase/seed.sql` creates/seeds `builds`, storage buckets, RLS policies, and upload limits.
- `supabase/wiki.sql` creates/seeds `wiki_articles` and the `updated_at` trigger.
- `supabase/security_fixes.sql` applies Security Advisor fixes for existing projects.
- `supabase/phase2_auth.sql` adds profiles, ownership fields, pending moderation, soft deletes, authenticated inserts, and user-scoped storage policies.
- `supabase/phase2_1_rls_hardening.sql` prevents regular users from publishing their own submissions through direct client updates and adds `rejected` wiki status support.
- `supabase/phase2_2_staff_picks.sql` adds manual staff-pick fields and blocks normal authenticated users from changing them.

Important columns:
- `builds.user_id` references `auth.users(id)` for user-owned posts.
- `builds.status` values: `pending`, `published`, `rejected`.
- `builds.deleted_at` implements soft delete.
- `builds.photos` stores public Supabase Storage URLs.
- `builds.is_staff_pick`, `builds.staff_pick_order`, and `builds.staff_picked_at` are staff/admin-controlled homepage featuring fields.
- `builds.sound_signature` and `builds.typing_feel` are text arrays.
- `wiki_articles.user_id` references `auth.users(id)` for user-owned posts.
- `wiki_articles.deleted_at` implements soft delete.
- `wiki_articles.category` values: `beginner-guides`, `modding-guides`, `parts-glossary`, `sound-feel`, `community-buying`, `about`.
- `wiki_articles.format` values: `sections`, `combined`.
- `wiki_articles.status` values: `draft`, `pending`, `published`, `rejected`.

Supabase SQL editor note:
- Price strings in `wiki.sql` seed JSON should use JSON unicode escaping for dollar signs inside `$j$...$j$` literals so the editor does not treat them as query parameters.

## Components And Conventions

- `src/components/KeebArt.jsx` renders procedural keyboard art. It accepts `palette`, `layout`, and `seed`.
- `src/components/BuildVisual.jsx` renders the first uploaded build photo when available and falls back to `KeebArt`.
- `src/components/Tag.jsx` uses `tagKind()` and `TINT` for colored tag pills.
- Active nav link detection uses `useLocation()` with `startsWith` checks.
- Signed-in nav should use one far-right `logged in as {username}.` account control; do not also show a separate `profile.` nav link.
- The signed-in account control should open/hold a compact hover/focus bubble with `profile.` plus `logout.`; the account control itself should not navigate.
- Usernames are created during signup but should not be self-editable from `/profile` in Phase 2.1.
- Wiki search state uses `useSearchParams`, so `?q=...` is shareable.
- Wiki category browsing uses `?category=...`.
- Wiki article TOC uses `IntersectionObserver`.
- Wiki article reading progress is a fixed 2px lavender bar at the top.
- Build links should use `buildRouteSlug(build)` for stable `/builds/{uuid}-{readable-slug}` URLs; old slug-only build URLs should keep working as fallback.

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

## Completed Phase 2 Foundation

- Added Supabase Auth context and protected routes.
- Added `/login` and `/profile`.
- Added logged-in nav state with username plus logout.
- Protected `/submit`, `/submit-wiki`, and `/profile`.
- Added user-owned build and wiki submissions.
- Added pending review for new build and wiki submissions.
- Added profile dashboard for own builds and own wiki submissions.
- Added edit routes for own builds and wiki articles.
- Added soft delete helpers for own builds and wiki articles.
- Removed manual `submitted_by` trust from submit forms; submissions use profile username or email fallback.
- Added custom tags for wiki article submissions.
- Added `supabase/phase2_auth.sql` for ownership, RLS, moderation, and user-scoped uploads.

## Current Phase — Phase 2.1 QA And Auth Hardening

- [x] Re-run logged-in QA with email confirmation temporarily disabled.
- [x] Create a test account, submit a test build, submit a test wiki article, edit owned content, and confirm public visibility rules.
- [x] Update docs for the current Phase 2 foundation.
- [x] Update signed-in nav so `logged in as {username}.` is the only profile/account entry, positioned at the far right.
- [x] Add a hover/focus account bubble with `profile.` and `logout.` actions.
- [x] Remove the duplicate signed-in `profile.` nav link.
- [x] Remove username self-editing from `/profile`; show username/email as read-only account info.
- [x] Add `view` actions to profile build/wiki rows while keeping edit and delete.
- [x] Allow owners to preview their own pending/rejected non-deleted builds and wiki submissions from `/profile`.
- [x] Keep public build/wiki browsing and search published-only.
- [x] Block signup passwords shorter than 8 characters before calling Supabase.
- [x] Commit the current Phase 2 foundation.
- [x] Add Google OAuth login after QA passes.
- [x] Configure Google provider credentials and redirect URLs in the Supabase dashboard.
- [ ] Add Cloudflare Turnstile to sign up and login after the Turnstile site key and Supabase captcha settings are available.
- [ ] Enable Supabase Leaked Password Protection in the dashboard.
- [ ] Configure production auth email later after the real domain is ready.
- [ ] Production domain target is `keebwiki.com`; email sender is temporary until that domain is acquired/configured.
- [ ] Planned production sender: product-branded `no-reply@keebwiki.com` once the domain is ready.
- [ ] Email templates should be product-first with subtle footer branding: `built by twelve.`
- [ ] Keep email confirmation off only for local QA; turn it back on before production once SMTP and templates are configured.
- [ ] Do not add phone login yet; revisit later for MFA or recovery after Google login is stable.
- [x] Add Phase 2.1 RLS hardening SQL for owner updates and wiki rejected status.
- [x] Use stable UUID-based build route slugs while preserving old slug fallback.
- [x] Replace native profile delete confirms with in-app confirmation UI.
- [x] Revoke local build photo preview URLs when removed or on submit-page unmount.
- [x] Improve submit error messages for duplicate wiki titles and common submission failures.
- [x] Run `supabase/phase2_1_rls_hardening.sql` manually in the Supabase SQL Editor.
- [x] Build owner preview links from `/profile` return back to `/profile`.
- [x] Build photo lightbox closes when clicking the backdrop and hides gallery controls for single-photo builds.
- [x] Add manual staff-pick SQL fields so featured builds are staff-selected only.
- [x] Show uploaded build photos on homepage/archive cards with procedural art fallback.
- [x] Allow owners to add, replace, and remove build photos from the build edit page.
- [ ] Run `supabase/phase2_2_staff_picks.sql` manually in the Supabase SQL Editor.

## Manual Moderation QA

Until the staff moderation UI exists, approve or reject submitted builds manually in the Supabase SQL Editor.

Approve a pending build:

```sql
UPDATE public.builds
SET status = 'published',
    updated_at = NOW()
WHERE id = 'PASTE_BUILD_UUID_HERE'
  AND deleted_at IS NULL;
```

Reject a pending build:

```sql
UPDATE public.builds
SET status = 'rejected',
    updated_at = NOW()
WHERE id = 'PASTE_BUILD_UUID_HERE'
  AND deleted_at IS NULL;
```

After approval, verify the owner preview banner disappears, the build appears on `/builds`, and a signed-out user can open its detail URL.

## Manual Staff Pick QA

Until the staff/admin UI exists, homepage staff picks are managed manually in the Supabase SQL Editor. A published build is not featured unless staff explicitly marks it.

Mark a published build as a staff pick:

```sql
UPDATE public.builds
SET is_staff_pick = TRUE,
    staff_pick_order = 1,
    staff_picked_at = NOW(),
    updated_at = NOW()
WHERE id = 'PASTE_BUILD_UUID_HERE'
  AND status = 'published'
  AND deleted_at IS NULL;
```

Remove a staff pick:

```sql
UPDATE public.builds
SET is_staff_pick = FALSE,
    staff_pick_order = NULL,
    staff_picked_at = NULL,
    updated_at = NOW()
WHERE id = 'PASTE_BUILD_UUID_HERE';
```

After staff-pick changes, verify the build appears or disappears from homepage `featured builds.` without affecting `/builds` or homepage `recent builds.`

## Phase 2 QA Notes

- Created QA account `qa_40146` with email confirmation temporarily disabled.
- Confirmed logged-in nav shows the username as `logged in as qa_40146.`
- Submitted a build as the QA user and confirmed it appears in `/profile` with `pending` status.
- Submitted a wiki article as the QA user and confirmed it appears in `/profile` with `pending` status.
- Edited the QA build and confirmed the updated title appears in `/profile` while remaining pending.
- Confirmed the pending QA build does not appear on public `/builds`.
- Confirmed searching public `/wiki` for the pending QA article returns no results.
- Did not soft-delete QA content during the visible QA pass because deletes affect Supabase data, even when the records are test records.

## Supabase Auth Safety Notes

- Email provider is enabled.
- Secure email change is enabled.
- Email OTP expiration is set to 3600 seconds.
- Email OTP length is set to 8 digits.
- Minimum password length should be 8 characters; the app also validates this on signup.
- Google OAuth app UI, Supabase client flow, provider toggle, Client IDs, and Client Secret are configured.
- Google Cloud OAuth should register Supabase callback URL: `https://yxucqsofablzsgyeyrmb.supabase.co/auth/v1/callback`.
- Cloudflare Turnstile is blocked until a public site key exists and Supabase captcha protection is configured.
- Leaked Password Protection is still disabled unless it can be enabled on the current Supabase plan.
- No password-change UI exists yet, so secure password-change dashboard toggles do not have app UI in this phase.

## Later Phase 2

- [ ] Small staff moderation flow for accepting/rejecting submitted builds and wiki articles.
- [ ] Staff/admin UI for selecting and ordering homepage staff picks.
- [ ] Owner-visible rejected feedback/reason fields for builds and wiki articles.
- [ ] Lightweight empty/error states across profile, builds, wiki search, and details pages.
- [ ] Comments on builds and wiki articles
- [ ] Upvote and favorite builds
- [ ] Audio file upload with size limits

## Phase 3

- [ ] Admin panel with staff permissions
- [ ] Staff moderation queue for accepting, rejecting, and managing submitted builds/wiki articles.
- [ ] Username change request flow instead of self-service username edits.
- [ ] Logged-in community actions: upvotes, favorites, and comments.
- [ ] Homepage background visual upgrade
- [ ] More homepage sections
- [ ] Contact page
- [ ] Suggestions page
- [ ] Full build photo gallery polish
