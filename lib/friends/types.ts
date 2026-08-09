export type FriendUser = {
  id: string
  username: string
  avatarUrl: string | null
}

export type FriendshipStatus = "accepted" | "pending_incoming" | "pending_outgoing"

export type FriendshipRow = {
  id: string
  status: FriendshipStatus
  otherUser: FriendUser
  /** Present when this friend hosts an active room visible to you */
  liveRoomUid: string | null
  createdAt: string
}

export type FriendLookupRelation =
  | "none"
  | "already_friends"
  | "outgoing_pending"
  | "incoming_pending"

export type FriendLookupResult =
  | { ok: false; error: "not_found" | "self" }
  | {
      ok: true
      user: FriendUser
      relation: FriendLookupRelation
    }
