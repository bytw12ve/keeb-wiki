# Keeb.wiki

A community hub for mechanical keyboard enthusiasts — browse and share keyboard builds, and explore a wiki covering everything from beginner guides to advanced modding.

Production domain target: `keebwiki.com` once the domain is purchased and configured.

## What it is

**Build showcase** — Users can submit photos and specs of their custom keyboard builds. Builds are browsable by layout, switch type, and case material, with a staff-curated featured section on the homepage.

**Wiki** — A growing knowledge base organized into categories: beginner guides, modding guides, parts glossary, sound & feel, and community buying tips. Articles are searchable and user-submittable.

**Accounts** — Email and Google login. Logged-in users can submit builds and wiki articles, edit their own content, and track pending/published status from their profile.

**Community feedback** — Contact and suggestions pages give visitors a clear launch-era path for questions, bug reports, and feature ideas.

## Features

- Build browsing with search and filter (layout, switches, case material)
- Photo uploads for builds with lightbox gallery
- Procedural keyboard art fallback when no photo is uploaded
- Wiki articles by category with table of contents and reading progress
- User submissions with a moderation workflow (pending → published)
- Logged-in suggestion submissions with staff/admin review
- Staff picks for homepage featured builds
- Launch-ready build submissions require name, layout, switch type, and at least one photo
- Permanent delete and edit for own content

## Tech

- Vite + React 18
- React Router v6
- Supabase (PostgreSQL, auth, storage)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the Vercel and Supabase launch checklist. Domain-specific values are intentionally pending until `keebwiki.com` is purchased.

## Status

Actively in development.
