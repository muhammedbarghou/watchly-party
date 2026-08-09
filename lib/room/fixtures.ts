import type { RoomParticipant, RoomState } from "@/lib/room/types"
import {
  FRIENDS_LIVE_ROOMS,
  RECENT_ROOMS,
} from "@/lib/home/fixtures"

const MOCK_JOIN_PASSWORD = "secret"

const baseParticipants = (
  hostId: string,
  hostUsername: string,
  extras: RoomParticipant[] = []
): RoomParticipant[] => [
  {
    id: hostId,
    username: hostUsername,
    avatarUrl: null,
    role: "admin",
    muted: false,
    mutedByAdmin: false,
    hasPlaybackControl: true,
  },
  ...extras,
]

const fixtureExtras: RoomParticipant[] = [
  {
    id: "friend-maya",
    username: "maya",
    avatarUrl: null,
    role: "viewer",
    muted: false,
    mutedByAdmin: false,
    hasPlaybackControl: false,
  },
  {
    id: "friend-jordan",
    username: "jordan",
    avatarUrl: null,
    role: "viewer",
    muted: true,
    mutedByAdmin: true,
    hasPlaybackControl: false,
  },
  {
    id: "friend-sam",
    username: "sam",
    avatarUrl: null,
    role: "viewer",
    muted: false,
    mutedByAdmin: false,
    hasPlaybackControl: false,
    connectionIssue: true,
  },
]

const roomSeedByUid = new Map<string, Omit<RoomState, "participants" | "adminId">>()

for (const room of [...FRIENDS_LIVE_ROOMS, ...RECENT_ROOMS]) {
  if (room.status !== "active") continue
  roomSeedByUid.set(room.uid.toLowerCase(), {
    roomUid: room.uid,
    name: room.name,
    videoUrl: room.videoUrl,
    playbackState: {
      status: "paused",
      positionMs: 0,
      serverTime: Date.now(),
    },
    requiresPassword: room.isPrivate,
    password: room.isPrivate ? MOCK_JOIN_PASSWORD : undefined,
  })
}

roomSeedByUid.set("private1", {
  roomUid: "private1",
  name: "Private screening",
  videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
  playbackState: {
    status: "paused",
    positionMs: 12_000,
    serverTime: Date.now(),
  },
  requiresPassword: true,
  password: MOCK_JOIN_PASSWORD,
})

/** In-memory rooms created during this session (create-room flow). */
const dynamicRooms = new Map<string, RoomState>()

export const registerDynamicRoom = (state: RoomState) => {
  dynamicRooms.set(state.roomUid.toLowerCase(), state)
}

export const getRoomSeed = (
  roomUid: string
): Omit<RoomState, "participants" | "adminId"> | null => {
  const key = roomUid.trim().toLowerCase()
  const dynamic = dynamicRooms.get(key)
  if (dynamic) {
    return {
      roomUid: dynamic.roomUid,
      name: dynamic.name,
      videoUrl: dynamic.videoUrl,
      playbackState: { ...dynamic.playbackState },
      requiresPassword: dynamic.requiresPassword,
      password: dynamic.password,
    }
  }
  return roomSeedByUid.get(key) ?? null
}

export const buildInitialRoomState = (
  roomUid: string,
  currentUser: { id: string; username: string; avatarUrl: string | null }
): RoomState | null => {
  const key = roomUid.trim().toLowerCase()
  const dynamic = dynamicRooms.get(key)
  if (dynamic) {
    const alreadyIn = dynamic.participants.some((p) => p.id === currentUser.id)
    if (alreadyIn) {
      return {
        ...dynamic,
        participants: dynamic.participants.map((p) => ({ ...p })),
        playbackState: { ...dynamic.playbackState, serverTime: Date.now() },
      }
    }
    return {
      ...dynamic,
      participants: [
        ...dynamic.participants.map((p) => ({ ...p })),
        {
          id: currentUser.id,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
          role: "viewer",
          muted: false,
          mutedByAdmin: false,
          hasPlaybackControl: false,
        },
      ],
      playbackState: { ...dynamic.playbackState, serverTime: Date.now() },
    }
  }

  const seed = roomSeedByUid.get(key)
  if (!seed) {
    // Unknown but plausible UID (create flow landed here without register) — synthesize
    if (key.length < 4) return null
    return {
      roomUid: roomUid.trim(),
      name: null,
      videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
      adminId: currentUser.id,
      participants: baseParticipants(
        currentUser.id,
        currentUser.username
      ).map((p) =>
        p.id === currentUser.id
          ? { ...p, avatarUrl: currentUser.avatarUrl }
          : p
      ),
      playbackState: {
        status: "paused",
        positionMs: 0,
        serverTime: Date.now(),
      },
    }
  }

  const fromHomeFixtures =
    FRIENDS_LIVE_ROOMS.find((r) => r.uid.toLowerCase() === key) ||
    RECENT_ROOMS.find((r) => r.uid.toLowerCase() === key)

  const isOwnRecent = fromHomeFixtures?.host.id === "me"

  if (isOwnRecent) {
    return {
      ...seed,
      adminId: currentUser.id,
      participants: [
        {
          id: currentUser.id,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
          role: "admin",
          muted: false,
          mutedByAdmin: false,
          hasPlaybackControl: true,
        },
        ...fixtureExtras.slice(0, 2).map((p) => ({ ...p })),
      ],
    }
  }

  const hostId = fromHomeFixtures?.host.id ?? "host-1"
  const hostUsername = fromHomeFixtures?.host.username ?? "host"
  const others = fixtureExtras.filter((p) => p.username !== hostUsername)

  return {
    ...seed,
    adminId: hostId,
    participants: [
      {
        id: hostId,
        username: hostUsername,
        avatarUrl: fromHomeFixtures?.host.avatarUrl ?? null,
        role: "admin",
        muted: false,
        mutedByAdmin: false,
        hasPlaybackControl: true,
      },
      ...others.map((p) => ({ ...p })),
      {
        id: currentUser.id,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        role: "viewer",
        muted: false,
        mutedByAdmin: false,
        hasPlaybackControl: false,
      },
    ],
  }
}

export const MOCK_ROOM_PASSWORD = MOCK_JOIN_PASSWORD
