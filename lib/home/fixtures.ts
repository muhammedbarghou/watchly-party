import type {
  InboxNotification,
  JoinRoomResult,
  RoomCardData,
} from "@/lib/home/types"

export const FRIENDS_LIVE_ROOMS: RoomCardData[] = [
  {
    id: "live-1",
    uid: "watch7k",
    name: "Friday night anime",
    status: "active",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    posterUrl:
      "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=640&h=360&fit=crop",
    host: {
      id: "friend-1",
      username: "maya",
      avatarUrl: null,
    },
    participantCount: 4,
    requiresApproval: false,
    isPrivate: false,
    visibleToFriends: true,
    createdAt: "2026-08-09T12:00:00.000Z",
    closedAt: null,
  },
  {
    id: "live-2",
    uid: "cine42x",
    name: null,
    status: "active",
    videoUrl: "https://vimeo.com/76979871",
    posterUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3dd?w=640&h=360&fit=crop",
    host: {
      id: "friend-2",
      username: "jordan",
      avatarUrl: null,
    },
    participantCount: 2,
    requiresApproval: true,
    isPrivate: true,
    visibleToFriends: true,
    createdAt: "2026-08-09T13:20:00.000Z",
    closedAt: null,
  },
  {
    id: "live-3",
    uid: "lofi9m",
    name: "Study with lo-fi",
    status: "active",
    videoUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    posterUrl:
      "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=640&h=360&fit=crop",
    host: {
      id: "friend-3",
      username: "sam",
      avatarUrl: null,
    },
    participantCount: 6,
    requiresApproval: false,
    isPrivate: false,
    visibleToFriends: true,
    createdAt: "2026-08-09T14:05:00.000Z",
    closedAt: null,
  },
]

export const RECENT_ROOMS: RoomCardData[] = [
  {
    id: "recent-1",
    uid: "mine01a",
    name: "My active watch",
    status: "active",
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    posterUrl:
      "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=640&h=360&fit=crop",
    host: {
      id: "me",
      username: "you",
      avatarUrl: null,
    },
    participantCount: 1,
    requiresApproval: false,
    isPrivate: false,
    visibleToFriends: true,
    createdAt: "2026-08-09T11:30:00.000Z",
    closedAt: null,
  },
  {
    id: "recent-2",
    uid: "mine02b",
    name: "Sunday documentary",
    status: "closed",
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    posterUrl:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=640&h=360&fit=crop",
    host: {
      id: "me",
      username: "you",
      avatarUrl: null,
    },
    participantCount: 0,
    requiresApproval: false,
    isPrivate: false,
    visibleToFriends: true,
    createdAt: "2026-08-06T18:00:00.000Z",
    closedAt: "2026-08-06T21:10:00.000Z",
  },
  {
    id: "recent-3",
    uid: "mine03c",
    name: null,
    status: "closed",
    videoUrl: "https://vimeo.com/76979871",
    posterUrl:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=640&h=360&fit=crop",
    host: {
      id: "me",
      username: "you",
      avatarUrl: null,
    },
    participantCount: 0,
    requiresApproval: false,
    isPrivate: true,
    visibleToFriends: false,
    createdAt: "2026-08-03T20:15:00.000Z",
    closedAt: "2026-08-03T23:40:00.000Z",
  },
]

export const PENDING_NOTIFICATIONS: InboxNotification[] = [
  {
    id: "notif-1",
    type: "friend_request",
    title: "Friend request",
    body: "alex wants to be friends",
    createdAt: "2026-08-09T10:00:00.000Z",
    read: false,
  },
  {
    id: "notif-2",
    type: "room_invite",
    title: "Room invite",
    body: "maya invited you to Friday night anime",
    createdAt: "2026-08-09T12:05:00.000Z",
    read: false,
  },
  {
    id: "notif-3",
    type: "access_request",
    title: "Access request",
    body: "kai asked to join your private room",
    createdAt: "2026-08-08T22:30:00.000Z",
    read: false,
  },
]

export const EMPTY_FRIENDS_LIVE_ROOMS: RoomCardData[] = []
export const EMPTY_RECENT_ROOMS: RoomCardData[] = []

const MOCK_JOIN_PASSWORD = "secret"

export const mockJoinRoom = (
  uid: string,
  password?: string
): JoinRoomResult => {
  const normalized = uid.trim().toLowerCase()

  if (!normalized) {
    return { ok: false, error: "Enter a room UID." }
  }

  if (normalized === "missing" || normalized === "gone") {
    return { ok: false, error: "Room not found." }
  }

  if (normalized === "closed") {
    return { ok: false, error: "This room is closed." }
  }

  if (normalized === "full") {
    return { ok: false, error: "This room is full." }
  }

  if (normalized.startsWith("private")) {
    if (!password) {
      return {
        ok: false,
        error: "This room requires a password.",
        needsPassword: true,
      }
    }

    if (password !== MOCK_JOIN_PASSWORD) {
      return { ok: false, error: "Incorrect password.", needsPassword: true }
    }

    return { ok: true, uid: normalized }
  }

  const knownLive = FRIENDS_LIVE_ROOMS.find(
    (room) => room.uid.toLowerCase() === normalized
  )
  const knownRecent = RECENT_ROOMS.find(
    (room) => room.uid.toLowerCase() === normalized && room.status === "active"
  )

  if (knownLive || knownRecent || normalized.length >= 4) {
    return { ok: true, uid: normalized }
  }

  return { ok: false, error: "Room not found." }
}

export const createMockRoomUid = (): string => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
  let uid = ""
  for (let i = 0; i < 6; i += 1) {
    uid += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return uid
}

export const isValidHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}
