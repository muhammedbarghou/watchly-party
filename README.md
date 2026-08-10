# Watchly

Real-time watch-party platform. Create a room, drop in a video link, and watch together in sync — with text chat, voice chat, and a Twitch-style layout (player, chat sidebar, participant list).

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js (App Router) + TypeScript |
| Hosting | Vercel |
| Auth & data | Supabase Auth + Postgres |
| Realtime | Self-hosted Node/Express + Socket.io |
| Voice | WebRTC (peer-to-peer mesh) |
| Video | `react-player` (YouTube, Vimeo, direct URL) |
| UI | Tailwind CSS + shadcn/ui |

## Features

- Create rooms and join via invite link
- Synced playback across all viewers (server-authoritative)
- Ephemeral text chat
- Peer-to-peer voice chat (small rooms, ~2–8 people)
- Admin controls: playback, kick, mute, ban, admin transfer

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- The Watchly realtime Socket.io server running locally or on a VPS (`NEXT_PUBLIC_SOCKET_URL`)

## Getting started

```bash
git clone https://github.com/muhammedbarghou/watchly-party.git
cd watchly-party
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Server-only — required for Settings → Delete account
SUPABASE_SECRET_KEY=
```

Then start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |

## Project layout

```
app/           # Next.js App Router pages & API routes
components/    # UI and feature components
lib/           # Supabase clients, socket helpers, utilities
supabase/      # Migrations / local Supabase config
docs/          # Auth setup, privacy, terms
```

## Out of scope (v1)

- File upload as a video source
- Large rooms / SFU media server
- Native mobile apps
- Persistent chat history

## License

Private — all rights reserved.
