import { createClient } from "@/lib/supabase/client"

export type RoomHistoryEntry = {
  roomId: string
  roomUid: string
  roomName: string | null
  hostUsername: string
  joinedAt: string
  isActive: boolean
}

type HostRow = {
  username: string
}

type RoomEmbed = {
  id: string
  uid: string
  name: string | null
  status: string | null
  host: HostRow | HostRow[] | null
}

type HistoryRow = {
  joined_at: string
  left_at: string | null
  rooms: RoomEmbed | RoomEmbed[] | null
}

const asOne = <T>(value: T | T[] | null): T | null => {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

export const fetchRoomHistory = async (
  limit = 20
): Promise<RoomHistoryEntry[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("room_history")
    .select(
      `joined_at, left_at,
       rooms:room_id (
         id, uid, name, status,
         host:users!rooms_created_by_fkey ( username )
       )`
    )
    .order("joined_at", { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return (data as HistoryRow[])
    .map((row) => {
      const room = asOne(row.rooms)
      if (!room) return null
      const host = asOne(room.host)
      return {
        roomId: room.id,
        roomUid: room.uid,
        roomName: room.name,
        hostUsername: host?.username ?? "unknown",
        joinedAt: row.joined_at,
        isActive: room.status === "active",
      }
    })
    .filter((entry): entry is RoomHistoryEntry => entry !== null)
}
