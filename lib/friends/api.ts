import { createClient } from "@/lib/supabase/client"
import type {
  FriendLookupResult,
  FriendUser,
  FriendshipRow,
  FriendshipStatus,
  SendFriendRequestResult,
} from "@/lib/friends/types"

type UserRow = {
  id: string
  username: string
  avatar_url: string | null
}

type FriendshipDbRow = {
  id: string
  requester_id: string
  recipient_id: string
  status: "pending" | "accepted"
  created_at: string | null
  requester: UserRow | UserRow[] | null
  recipient: UserRow | UserRow[] | null
}

export type FriendshipsSnapshot = {
  friends: FriendshipRow[]
  incoming: FriendshipRow[]
  outgoing: FriendshipRow[]
}

const normalizeUsername = (username: string): string =>
  username.trim().toLowerCase()

const pairFilter = (userAId: string, userBId: string): string =>
  `and(requester_id.eq.${userAId},recipient_id.eq.${userBId}),and(requester_id.eq.${userBId},recipient_id.eq.${userAId})`

const asUser = (value: UserRow | UserRow[] | null): UserRow | null => {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

const toFriendUser = (row: UserRow): FriendUser => ({
  id: row.id,
  username: row.username,
  avatarUrl: row.avatar_url,
})

const mapFriendshipRow = (
  row: FriendshipDbRow,
  currentUserId: string,
  liveRoomByFriendId: Map<string, string>
): FriendshipRow | null => {
  const requester = asUser(row.requester)
  const recipient = asUser(row.recipient)
  if (!requester || !recipient) return null

  const isRequester = row.requester_id === currentUserId
  const other = isRequester ? recipient : requester

  let status: FriendshipStatus
  if (row.status === "accepted") {
    status = "accepted"
  } else if (isRequester) {
    status = "pending_outgoing"
  } else {
    status = "pending_incoming"
  }

  return {
    id: row.id,
    status,
    otherUser: toFriendUser(other),
    liveRoomUid: liveRoomByFriendId.get(other.id) ?? null,
    createdAt: row.created_at ?? new Date().toISOString(),
  }
}

const FRIENDSHIP_SELECT = `
  id,
  requester_id,
  recipient_id,
  status,
  created_at,
  requester:users!friendships_requester_id_fkey ( id, username, avatar_url ),
  recipient:users!friendships_recipient_id_fkey ( id, username, avatar_url )
`

export const fetchFriendships = async (
  currentUserId: string,
  liveRoomByFriendId: Map<string, string> = new Map()
): Promise<FriendshipsSnapshot> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("friendships")
    .select(FRIENDSHIP_SELECT)
    .or(`requester_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
    .order("created_at", { ascending: false })

  if (error || !data) {
    return { friends: [], incoming: [], outgoing: [] }
  }

  const friends: FriendshipRow[] = []
  const incoming: FriendshipRow[] = []
  const outgoing: FriendshipRow[] = []

  for (const raw of data as FriendshipDbRow[]) {
    const mapped = mapFriendshipRow(raw, currentUserId, liveRoomByFriendId)
    if (!mapped) continue

    if (mapped.status === "accepted") {
      friends.push(mapped)
    } else if (mapped.status === "pending_incoming") {
      incoming.push(mapped)
    } else {
      outgoing.push(mapped)
    }
  }

  return { friends, incoming, outgoing }
}

export const lookupUsername = async (
  username: string,
  currentUserId: string
): Promise<FriendLookupResult> => {
  const normalized = normalizeUsername(username)
  if (!normalized) {
    return { ok: false, error: "not_found" }
  }

  const supabase = createClient()
  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .eq("username", normalized)
    .maybeSingle()

  if (error || !user) {
    return { ok: false, error: "not_found" }
  }

  if (user.id === currentUserId) {
    return { ok: false, error: "self" }
  }

  const { data: existing } = await supabase
    .from("friendships")
    .select("id, requester_id, recipient_id, status")
    .or(pairFilter(currentUserId, user.id))
    .maybeSingle()

  let relation: "none" | "already_friends" | "outgoing_pending" | "incoming_pending" =
    "none"

  if (existing) {
    if (existing.status === "accepted") {
      relation = "already_friends"
    } else if (existing.requester_id === currentUserId) {
      relation = "outgoing_pending"
    } else {
      relation = "incoming_pending"
    }
  }

  return {
    ok: true,
    user: toFriendUser(user as UserRow),
    relation,
  }
}

export type FriendMutationResult =
  | { ok: true }
  | { ok: false; error: string }

const sendFriendRequestOnce = async (
  targetUserId: string,
  currentUserId: string,
  retried: boolean
): Promise<SendFriendRequestResult> => {
  if (targetUserId === currentUserId) {
    return { ok: false, error: "You can't friend yourself." }
  }

  const supabase = createClient()

  const { data: existing, error: lookupError } = await supabase
    .from("friendships")
    .select("id, requester_id, recipient_id, status")
    .or(pairFilter(currentUserId, targetUserId))
    .maybeSingle()

  if (lookupError) {
    return { ok: false, error: lookupError.message }
  }

  if (existing) {
    if (existing.status === "accepted") {
      return { ok: true, status: "already_friends" }
    }

    if (existing.requester_id === currentUserId) {
      return { ok: true, status: "already_pending" }
    }

    const { error: updateError } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", existing.id)

    if (updateError) {
      return { ok: false, error: updateError.message }
    }

    return { ok: true, status: "auto_accepted" }
  }

  const { error: insertError } = await supabase.from("friendships").insert({
    requester_id: currentUserId,
    recipient_id: targetUserId,
    status: "pending",
  })

  if (insertError) {
    if (insertError.code === "23505" && !retried) {
      return sendFriendRequestOnce(targetUserId, currentUserId, true)
    }
    return { ok: false, error: insertError.message }
  }

  return { ok: true, status: "created" }
}

export const sendFriendRequest = async (
  targetUserId: string,
  currentUserId: string
): Promise<SendFriendRequestResult> =>
  sendFriendRequestOnce(targetUserId, currentUserId, false)

export const acceptFriendRequest = async (
  friendshipId: string
): Promise<FriendMutationResult> => {
  const supabase = createClient()
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId)

  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

export const deleteFriendship = async (
  friendshipId: string
): Promise<FriendMutationResult> => {
  const supabase = createClient()
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId)

  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true }
}
