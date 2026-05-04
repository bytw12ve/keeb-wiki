# Deployment Notes

<!-- built by twelve. -->

## Current Status

The production domain target is `keebwiki.com`, but domain purchase and DNS configuration are intentionally pending.

## Vercel

1. Create a new Vercel project from this repository.
2. Use the default Vite settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. No environment variables are required for the current Supabase publishable client key setup.
4. Keep the initial deployment on the Vercel preview URL until the production domain is purchased.

## Supabase Auth

After the deployment URL exists, update Supabase Auth settings:

1. Set Site URL to the deployed Vercel URL for preview testing.
2. Add redirect URLs for:
   - `https://<vercel-project>.vercel.app/login`
   - `https://<vercel-project>.vercel.app/profile`
   - `https://<vercel-project>.vercel.app/submit`
   - `https://<vercel-project>.vercel.app/submit-wiki`
   - `https://<vercel-project>.vercel.app/suggestions`
3. After `keebwiki.com` is purchased, add the matching production URLs:
   - `https://keebwiki.com/login`
   - `https://keebwiki.com/profile`
   - `https://keebwiki.com/submit`
   - `https://keebwiki.com/submit-wiki`
   - `https://keebwiki.com/suggestions`

## Production Email

Production auth email is blocked until the domain is ready.

- Launch contact address shown in the app: `contact@keebwiki.com`
- Planned sender: `no-reply@keebwiki.com`
- Email templates should be product-first with subtle footer branding: `built by twelve.`
- Turn email confirmation back on before public production use once SMTP and templates are configured.

## Security Checklist

- Confirm the Phase 3, Phase 3.2, and Phase 4 suggestions SQL files have been applied in Supabase.
- Refresh Supabase Security Advisor after SQL changes.
- Enable Leaked Password Protection if the current Supabase plan allows it.
- Keep Cloudflare Turnstile blocked until a public site key exists and Supabase captcha protection is configured.
