# Auth setup (Watchly)

## Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server-only) — required for **Settings → Delete account**. Use the project secret key (`sb_secret_…`) from Supabase → Project Settings → API. Legacy `SUPABASE_SERVICE_ROLE_KEY` is also accepted as a fallback.

Never expose `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` with a `NEXT_PUBLIC_` prefix.

## Supabase Dashboard

Project: **watchly** (`hfrfpodvnnqfujpfxfjg`)

### Redirect URLs

Authentication → URL Configuration:

- Site URL: `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/callback?next=/home-page`
  - `http://localhost:3000/auth/callback?next=/auth/update-password`
  - (add production URLs when deploying)

### Google OAuth

1. Authentication → Providers → **Google** → Enable
2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
3. Authorized redirect URI from Supabase Google provider panel (callback URL shown there)
4. Paste Client ID + Client Secret into Supabase Google provider settings
5. Save

Without this, email/password auth still works; Google buttons will fail until configured.

### Avatars storage

Settings uploads avatars to the public `avatars` bucket (created by migration `user_preferences_and_avatars`). Users may only write under `{user_id}/`.
