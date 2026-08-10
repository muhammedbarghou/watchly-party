# Watchly — Technical Plan

Covers: v1 roadmap, realtime (Socket.io) message protocol, and database schema.

---

## 1. Development Roadmap

Each phase ends with a concrete, testable milestone.

### Phase 1 — Foundation
- Supabase project setup (Auth + Postgres schema + RLS policies)
- Next.js app scaffold, Vercel deployment pipeline
- Node/Express + Socket.io backend scaffold, Dockerized, deployed to VPS
- **Milestone:** an empty room can be created and joined, with a live connected-user count

### Phase 2 — Core Room Flow
- Room creation (UID generation, name, password, video URL, visible-to-friends toggle)
- Room joining (UID/password, discovery via friends' live rooms, admin invite)
- Friend system (request/accept/list, symmetric visibility)
- Home page: recent rooms + friends' live rooms feed
- **Milestone:** two accounts can friend each other, create rooms, and see/join each
  other's public rooms

### Phase 3 — Real-Time Sync
- Video playback sync: admin-driven play/pause/seek, broadcast + client-side
  reconciliation
- Text chat: real-time, ephemeral, in-room only
- **Milestone:** two browser tabs join the same room and watch a pasted video link in
  sync, with working text chat

### Phase 4 — Voice & Admin Controls
- WebRTC peer-to-peer voice chat, signaling relayed via Socket.io
- Admin powers: kick, mute, ban, transfer admin; delegate playback control to a
  participant
- **Milestone:** a room of 2–8 people talks over voice while watching, and admin
  controls work end-to-end (including admin transfer without a page reload)

### Phase 5 — Polish & Launch Prep
- UI pass with final wireframes and color theme applied
- Error handling, edge cases (disconnects, reconnects, admin leaving without transfer)
- Rate limiting (room creation, join attempts) and security hardening
- **Milestone:** private-beta ready — a small group creates a room, watches a full
  session (join → sync playback → chat/voice → admin actions → leave) without the sync
  breaking

### v3 (out of scope for this plan)
- File upload video source + transcoding pipeline
- SFU media server (LiveKit/mediasoup) for rooms beyond ~8 participants
- Native iOS/Android apps
- 3D room layouts
- Persistent chat history, OAuth login providers

---

## 2. Realtime Message Protocol (Socket.io)

Each Watchly room is a Socket.io room, addressed by the room's `uid`. Messages below are
event name + payload shape; Socket.io's own `emit`/`on` handles the envelope, so there's
no custom wrapper needed.

**Client → Server**
| Event | Payload | Notes |
|---|---|---|
| `join_room` | `{ roomUid, password? }` | server replies with `room_state` or `error` |
| `leave_room` | `{}` | |
| `request_access` | `{ roomUid }` | discovery path — requires admin approval |
| `chat_message` | `{ text }` | server timestamps + broadcasts; not persisted |
| `playback_control` | `{ action: "play"\|"pause"\|"seek", positionMs }` | admin-only, or granted participants |
| `sync_ping` | `{ clientPositionMs }` | used for drift measurement |
| `grant_playback_control` | `{ targetUserId, granted: boolean }` | admin-only |
| `kick_user` | `{ targetUserId }` | admin-only |
| `mute_user` | `{ targetUserId, muted: boolean }` | admin-only |
| `ban_user` | `{ targetUserId }` | admin-only |
| `transfer_admin` | `{ targetUserId }` | admin-only |
| `rtc_offer` / `rtc_answer` / `rtc_ice_candidate` | `{ targetUserId, payload }` | WebRTC signaling relay |

**Server → Client**
| Event | Payload | Notes |
|---|---|---|
| `room_state` | `{ participants[], adminId, videoUrl, playbackState }` | full snapshot, sent on join |
| `user_joined` / `user_left` | `{ user }` / `{ userId }` | |
| `access_requested` | `{ userId }` | sent to admin only, for discovery-path join requests |
| `chat_message` | `{ userId, text, timestamp }` | |
| `playback_sync` | `{ status, positionMs, serverTime }` | broadcast on every control event + periodic heartbeat |
| `playback_control_granted` | `{ userId, granted }` | |
| `user_kicked` / `user_banned` | `{ userId }` | recipient is force-disconnected client-side |
| `user_muted` | `{ userId, muted }` | |
| `admin_changed` | `{ newAdminId }` | |
| `rtc_offer` / `rtc_answer` / `rtc_ice_candidate` | `{ fromUserId, payload }` | relayed to the target peer |
| `error` | `{ code, message }` | |

**Sync strategy:** the server is authoritative for playback position. An admin's
`playback_control` event updates the server's own in-memory state first (using a
server-side timestamp, not the client's clock), then the server broadcasts
`playback_sync` to everyone in the room (including the admin, for confirmation). Clients
compute the expected position from the last known state + elapsed time, compare it to
their local `<video>` position, and hard-seek to correct if drift exceeds a threshold
(~1–1.5s) — small drift is left alone so playback doesn't visibly stutter-correct every
few seconds.

---

## 3. Database Schema

### Postgres (Supabase)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id), -- matches Supabase Auth user directly
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id) NOT NULL,
  recipient_id UUID REFERENCES users(id) NOT NULL,
  status TEXT CHECK (status IN ('pending','accepted')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (requester_id, recipient_id)
);

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid TEXT UNIQUE NOT NULL,             -- public-facing join code, server-generated
  name TEXT,
  created_by UUID REFERENCES users(id) NOT NULL,
  video_url TEXT NOT NULL,              -- v1: link only
  password_hash TEXT,                   -- set only if is_private
  is_private BOOLEAN DEFAULT FALSE,
  visible_to_friends BOOLEAN DEFAULT TRUE,
  status TEXT CHECK (status IN ('active','closed')) DEFAULT 'active',
  max_participants INT DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ  -- set when status becomes 'closed'; null while active
);

-- Optional: durable ban records, so bans survive a server restart
CREATE TABLE room_bans (
  room_id UUID REFERENCES rooms(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  banned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);
```

**Not in Postgres:** `room_participants` (live membership/roles/playback-control grants),
chat messages, and playback position — all of that is fast-changing, ephemeral state that
lives only in the Socket.io server's memory for the lifetime of the room. It's listed in
the PRD's conceptual data model for reference, but nothing in that shape gets written to
the database in v1.

### Ephemeral room state (Socket.io server memory, not Postgres)

| State | Lives here |
|---|---|
| Current participants + roles (admin/moderator/viewer) | In-memory, per Socket.io room, tracked via active socket connections |
| Playback position/status | Same in-memory room object, updated on every `playback_control` event |
| Playback-control grants (which non-admin users can control playback) | Same in-memory room object |
| Mute state | Same in-memory room object |
| Presence (who's connected) | Socket.io's own connection lifecycle (`connection`/`disconnect`) — no separate heartbeat mechanism needed |
| Chat messages | Broadcast only, never stored anywhere |

All of this resets when the room empties or the server restarts — an accepted trade-off
for v1 (see `watchly-system-design.md` §6). If bans need to survive a restart, they're the
one piece of "live" state also written to Postgres (`room_bans`), since being kicked back
into a room you were banned from is a worse failure mode than losing playback position.
