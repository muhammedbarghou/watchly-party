# Watchly — Technical Plan

Covers: MVP roadmap, realtime (PartyKit) message protocol, Three.js scene structure, and database schema.

---

## 1. Development Roadmap

Each phase ends with a concrete, testable milestone rather than a vague "feature done" — useful for solo-dev pacing.

### Phase 0 — Foundation (Week 1)
- Repo scaffolding: Next.js + TypeScript, Tailwind, ESLint/Prettier
- Supabase Postgres + Prisma schema (see §4)
- Supabase Auth wired up, including anonymous sessions for guest invitees
- PartyKit room server scaffolded and deployed (Cloudflare Durable Objects) — no separate Node process/host needed
- **Milestone:** an empty room can be created, joined, and shows a live connected-user count

### Phase 1 — Core Watch Loop (Weeks 2–3)
- Video source input: paste-link mode only (YouTube/direct URL embed) — skip upload for now
- Playback sync engine: host-driven play/pause/seek broadcast + client-side reconciliation (see §2)
- Flat 2D UI (no 3D yet): `<video>` element + text chat sidebar
- **Milestone:** two browser tabs join the same room and watch a pasted video in sync, with working text chat

### Phase 2 — The 3D Cinema (Weeks 4–5)
- Three.js scene: room geometry, seats, screen, lighting (see §3)
- Avatar loading (Ready Player Me or placeholder avatars) seated in the theater
- Video piped onto the in-scene screen as a texture instead of a flat HTML `<video>`
- Camera: first-person seat view + free-look toggle
- **Milestone:** joining a room drops you into the 3D theater in your seat, screen plays the synced video

### Phase 3 — Voice & Reactions (Week 6)
- LiveKit integration for voice chat
- Reaction animations wired to avatars (clap/wave/laugh), broadcast over WS
- Presence indicators: speaking indicator, join/leave toasts
- **Milestone:** a room of 4–6 people talks over voice while watching, with visible reactions

### Phase 4 — Upload Mode & Hardening (Weeks 7–8)
- File upload → Cloudflare Stream/Mux transcoding pipeline
- Room persistence, reconnect handling, host migration on disconnect
- Mobile 2D fallback view
- Sentry error tracking, basic rate limiting/moderation
- **Milestone:** private-beta ready — a small group creates a room, uploads a clip, and gets through a full "movie night" without the sync breaking

### Phase 5 — Polish & Scale (ongoing)
- SFU tuning for larger rooms, custom room themes, highlight clips, DMCA/takedown flow

---

## 2. Realtime Message Protocol (PartyKit)

Each room is one PartyKit party (a Cloudflare Durable Object), addressed by `roomId`. The message shapes below are unchanged from the original design — only the transport (PartyKit instead of a self-hosted Socket.io/Colyseus server) changed.

**Envelope** (every message):
```json
{
  "type": "EVENT_TYPE",
  "roomId": "room_abc123",
  "senderId": "user_xyz",
  "timestamp": 1690000000000,
  "payload": { }
}
```

**Client → Server**
| Type | Payload | Notes |
|---|---|---|
| `JOIN_ROOM` | `{ avatarConfig, guestName? }` | server replies with `ROOM_STATE` |
| `LEAVE_ROOM` | `{}` | |
| `CHAT_MESSAGE` | `{ text }` | server timestamps + broadcasts |
| `PLAYBACK_CONTROL` | `{ action: "play"\|"pause"\|"seek", positionMs }` | host-only, rejected otherwise |
| `SYNC_PING` | `{ clientPositionMs }` | used for drift measurement |
| `AVATAR_SEAT` | `{ seatId }` | choosing/changing seat |
| `REACTION` | `{ type: "clap"\|"wave"\|"laugh"\|"thumbsup" }` | |
| `HOST_TRANSFER` | `{ targetUserId }` | host-only |
| `KICK_USER` | `{ targetUserId }` | host-only |

**Server → Client**
| Type | Payload | Notes |
|---|---|---|
| `ROOM_STATE` | `{ participants[], hostId, videoSource, playbackState }` | full snapshot, sent on join |
| `USER_JOINED` / `USER_LEFT` | `{ user }` / `{ userId }` | |
| `CHAT_MESSAGE` | `{ userId, text, timestamp }` | |
| `PLAYBACK_SYNC` | `{ status, positionMs, serverTime }` | broadcast every ~5s + on every control event |
| `AVATAR_SEAT_UPDATED` | `{ userId, seatId }` | |
| `REACTION_BROADCAST` | `{ userId, type }` | |
| `HOST_CHANGED` | `{ newHostId }` | |
| `ERROR` | `{ code, message }` | |

**Sync strategy:** the party is authoritative for playback position. A host's `PLAYBACK_CONTROL` updates the party's own in-memory state first, then the party broadcasts `PLAYBACK_SYNC` to everyone (including the host, for confirmation). Clients compute the expected position from the last known state + elapsed time, compare it to their local `<video>`/texture position, and hard-seek to correct if drift exceeds a threshold (~1.5s) — small drift is left alone so the video doesn't visibly stutter-correct every few seconds. Because a PartyKit party already persists its state between messages (with optional hibernation when idle), there's no separate Redis layer holding this — the party *is* where "room state" lives now.

---

## 3. Three.js Scene Structure

A working implementation of this structure is in the companion prototype file.

```
Scene
├─ Camera (Perspective, eye-level at a seat; manual drag-orbit + wheel-zoom —
│          OrbitControls isn't bundled with the base three.js package, so this
│          is hand-rolled instead of imported)
├─ Lighting
│  ├─ AmbientLight — dim, cool tint (theater darkness)
│  ├─ PointLight at the screen — glow that bleeds onto nearby seats/floor
│  └─ Small emissive "aisle light" markers along the rows (wayfinding, not dynamic lights — keeps light-count/perf low)
├─ Room geometry
│  ├─ Floor (dark, low-roughness plane)
│  ├─ Back wall + screen — a plane driven by a video/canvas texture, bright enough to read as the light source
│  └─ Side walls / ceiling (kept minimal, just enough to read as an enclosed room)
├─ Projector beam — a hollow, additive-blended cone from a rear "projector" point
│  widening toward the screen, plus a light sprinkle of drifting dust-mote particles
│  inside it. This is the one deliberate atmosphere element — it's what makes the
│  room read as a real cinema rather than "a grid of boxes with a bright rectangle."
├─ Seats — grid arranged in rows facing the screen, with an aisle gap
└─ Avatars — anchored to seat positions; simple cylinder-body + sphere-head
   placeholders (three.js r128 doesn't ship CapsuleGeometry) until Ready Player Me
   models are wired in; each carries `userData.seatId` / `userData.userId` so
   `AVATAR_SEAT_UPDATED` events can reposition them
```

---

## 4. Database Schema

### Postgres

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) UNIQUE, -- Supabase Auth user; null-able isn't needed since anonymous sign-ins still get an auth.users row
  display_name TEXT NOT NULL,
  avatar_config JSONB DEFAULT '{}',
  is_guest BOOLEAN DEFAULT FALSE,     -- true for anonymous-session users
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  host_id UUID REFERENCES users(id),
  video_source JSONB,                 -- { type: 'link'|'upload', url, uploadId }
  visibility TEXT CHECK (visibility IN ('public','private','password')) DEFAULT 'private',
  password_hash TEXT,
  seat_count INT DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE room_participants (
  room_id UUID REFERENCES rooms(id),
  user_id UUID REFERENCES users(id),
  seat_id TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  PRIMARY KEY (room_id, user_id, joined_at)
);

CREATE TABLE chat_messages (             -- optional persistence; can be skipped for MVP
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id),
  user_id UUID REFERENCES users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  room_id UUID REFERENCES rooms(id),
  storage_key TEXT NOT NULL,
  status TEXT CHECK (status IN ('processing','ready','failed')) DEFAULT 'processing',
  hls_url TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Ephemeral room state (PartyKit, not Redis)

| What lived in Redis before | Now lives here |
|---|---|
| `room:{roomId}:state` (host, playback status/position) | In-memory on the room's PartyKit party instance |
| `room:{roomId}:participants` | Tracked directly via the party's active WebSocket connections |
| `room:{roomId}:seats` | Same party instance, held alongside playback state |
| `presence:{userId}` TTL heartbeat | PartyKit's own connection lifecycle (`onConnect`/`onClose`) replaces manual TTL-based presence |
| `room:{roomId}:events` pub/sub | Not needed — a party already *is* the single instance handling that room, so there's no fan-out across multiple server processes to coordinate |

Postgres (via Supabase) holds durable data only — accounts, room configs, upload records. Nothing ephemeral gets written there; the party is the single source of truth for anything that changes on every sync tick or chat message, and it disappears/resets naturally when the room empties out.
