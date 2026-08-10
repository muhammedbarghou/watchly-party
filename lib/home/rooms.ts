import { createClient } from "@/lib/supabase/client"
import type { JoinRoomResult, RoomCardData } from "@/lib/home/types"

type SoftLookupRow = {
  uid: string
  is_private: boolean | null
  status: string | null
}

export const softLookupRoom = async (
  uid: string
): Promise<SoftLookupRow | null> => {
  const normalized = uid.trim().toLowerCase()
  if (!normalized) return null

  const supabase = createClient()
  const { data } = await supabase
    .from("rooms")
    .select("uid, is_private, status")
    .eq("uid", normalized)
    .maybeSingle()

  return data
}

export const prepareJoinRoom = async (
  uid: string,
  password?: string
): Promise<JoinRoomResult> => {
  const normalized = uid.trim().toLowerCase()
  if (!normalized) {
    return { ok: false, error: "Enter a room UID." }
  }

  const row = await softLookupRoom(normalized)

  if (row) {
    if (row.status === "closed") {
      return { ok: false, error: "This room is closed." }
    }

    if (row.is_private && !password?.trim()) {
      return {
        ok: false,
        error: "This room requires a password.",
        needsPassword: true,
      }
    }

    return { ok: true, uid: row.uid }
  }

  // RLS may hide private/non-visible rooms — socket is the source of truth.
  return { ok: true, uid: normalized }
}

type RecentRoomRow = {
  id: string
  uid: string
  name: string | null
  status: string | null
  video_url: string
  is_private: boolean | null
  visible_to_friends: boolean | null
  created_at: string | null
  closed_at?: string | null
  created_by: string
}

type RoomHost = {
  id: string
  username: string
  avatarUrl: string | null
}

const DEFAULT_POSTER =
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=640&h=360&fit=crop"

const RECENT_ROOMS_SELECT =
  "id, uid, name, status, video_url, is_private, visible_to_friends, created_at, closed_at, created_by"

const RECENT_ROOMS_SELECT_LEGACY =
  "id, uid, name, status, video_url, is_private, visible_to_friends, created_at, created_by"

const mapRoomCard = (row: RecentRoomRow, host: RoomHost): RoomCardData => ({
  id: row.id,
  uid: row.uid,
  name: row.name,
  status: row.status === "closed" ? "closed" : "active",
  videoUrl: row.video_url,
  posterUrl: DEFAULT_POSTER,
  host: {
    id: host.id,
    username: host.username,
    avatarUrl: host.avatarUrl,
  },
  participantCount: 0,
  requiresApproval: Boolean(row.is_private),
  isPrivate: Boolean(row.is_private),
  visibleToFriends: Boolean(row.visible_to_friends),
  createdAt: row.created_at ?? new Date().toISOString(),
  closedAt: row.status === "closed" ? (row.closed_at ?? null) : null,
})

export const fetchMyRecentRooms = async (
  host: RoomHost
): Promise<RoomCardData[]> => {
  const supabase = createClient()
  const primary = await supabase
    .from("rooms")
    .select(RECENT_ROOMS_SELECT)
    .eq("created_by", host.id)
    .order("created_at", { ascending: false })
    .limit(24)

  let data: RecentRoomRow[] | null = primary.data as RecentRoomRow[] | null
  let error = primary.error

  // closed_at may not exist until the rooms_closed_at migration is applied.
  if (error?.code === "42703") {
    const legacy = await supabase
      .from("rooms")
      .select(RECENT_ROOMS_SELECT_LEGACY)
      .eq("created_by", host.id)
      .order("created_at", { ascending: false })
      .limit(24)

    data = legacy.data as RecentRoomRow[] | null
    error = legacy.error
  }

  if (error || !data) {
    return []
  }

  return data.map((row) => mapRoomCard(row, host))
}

/** Active rooms hosted by accepted friends with visible_to_friends. */
export const fetchFriendsLiveRooms = async (
  friends: RoomHost[]
): Promise<RoomCardData[]> => {
  if (friends.length === 0) return []

  const hostById = new Map(friends.map((friend) => [friend.id, friend]))
  const friendIds = friends.map((friend) => friend.id)
  const supabase = createClient()

  const primary = await supabase
    .from("rooms")
    .select(RECENT_ROOMS_SELECT)
    .in("created_by", friendIds)
    .eq("status", "active")
    .eq("visible_to_friends", true)
    .order("created_at", { ascending: false })
    .limit(24)

  let data: RecentRoomRow[] | null = primary.data as RecentRoomRow[] | null
  let error = primary.error

  if (error?.code === "42703") {
    const legacy = await supabase
      .from("rooms")
      .select(RECENT_ROOMS_SELECT_LEGACY)
      .in("created_by", friendIds)
      .eq("status", "active")
      .eq("visible_to_friends", true)
      .order("created_at", { ascending: false })
      .limit(24)

    data = legacy.data as RecentRoomRow[] | null
    error = legacy.error
  }

  if (error || !data) {
    return []
  }

  return data.flatMap((row) => {
    const host = hostById.get(row.created_by)
    if (!host) return []
    return [mapRoomCard(row, host)]
  })
}

/** Map of friend user id → live room uid for friends list badges. */
export const buildLiveRoomByFriendId = (
  rooms: RoomCardData[]
): Map<string, string> => {
  const map = new Map<string, string>()
  for (const room of rooms) {
    if (!map.has(room.host.id)) {
      map.set(room.host.id, room.uid)
    }
  }
  return map
}
