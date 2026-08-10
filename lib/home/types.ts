export type RoomStatus = "active" | "closed"

export type RoomCardData = {
  id: string
  uid: string
  name: string | null
  status: RoomStatus
  videoUrl: string
  posterUrl: string
  host: {
    id: string
    username: string
    avatarUrl: string | null
  }
  participantCount: number
  requiresApproval: boolean
  isPrivate: boolean
  visibleToFriends: boolean
  createdAt: string
  closedAt: string | null
}

export type InboxNotificationType =
  | "friend_request"
  | "room_invite"
  | "access_request"

export type InboxNotification = {
  id: string
  type: InboxNotificationType
  title: string
  body: string
  createdAt: string
  read: boolean
  actorUsername?: string
  actorAvatarUrl?: string | null
  friendshipId?: string
  roomUid?: string
  fromUserId?: string
}

export type TransientNotification = {
  id: string
  message: string
  createdAt: number
}

export type JoinRoomResult =
  | { ok: true; uid: string }
  | { ok: false; error: string; needsPassword?: boolean }
