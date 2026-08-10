export type RoomRole = "admin" | "moderator" | "viewer"

export type PlaybackStatus = "playing" | "paused"

export type RoomParticipant = {
  id: string
  username: string
  avatarUrl: string | null
  role: RoomRole
  muted: boolean
  mutedByAdmin: boolean
  hasPlaybackControl: boolean
}

export type PlaybackState = {
  status: PlaybackStatus
  positionMs: number
  serverTime: number
}

export type RoomState = {
  roomUid: string
  name: string | null
  videoUrl: string
  adminId: string
  participants: RoomParticipant[]
  playbackState: PlaybackState
}

export type ChatMessage = {
  id: string
  userId: string
  username: string
  text: string
  timestamp: number
}

export type RoomError = {
  code: string
  message: string
}

export type RemovalReason = "kicked" | "banned" | null

/** Client → Server event payloads (protocol §2) */
export type ClientToServerEvents = {
  join_room: { roomUid: string; password?: string }
  leave_room: Record<string, never>
  chat_message: { text: string }
  playback_control: {
    action: "play" | "pause" | "seek"
    positionMs: number
  }
  sync_ping: { clientPositionMs: number }
  grant_playback_control: { targetUserId: string; granted: boolean }
  kick_user: { targetUserId: string }
  mute_user: { targetUserId: string; muted: boolean }
  ban_user: { targetUserId: string }
  transfer_admin: { targetUserId: string }
  self_mute: { muted: boolean }
  rtc_offer: { targetUserId: string; payload: RTCSessionDescriptionInit }
  rtc_answer: { targetUserId: string; payload: RTCSessionDescriptionInit }
  rtc_ice_candidate: { targetUserId: string; payload: RTCIceCandidateInit }
}

/** Server → Client event payloads */
export type ServerToClientEvents = {
  room_state: RoomState
  user_joined: { user: RoomParticipant }
  user_left: { userId: string }
  chat_message: ChatMessage
  playback_sync: {
    status: PlaybackStatus
    positionMs: number
    serverTime: number
  }
  playback_control_granted: { userId: string; granted: boolean }
  user_kicked: { userId: string }
  user_banned: { userId: string }
  user_muted: { userId: string; muted: boolean; byAdmin?: boolean }
  admin_changed: { newAdminId: string }
  rtc_offer: { fromUserId: string; payload: RTCSessionDescriptionInit }
  rtc_answer: { fromUserId: string; payload: RTCSessionDescriptionInit }
  rtc_ice_candidate: { fromUserId: string; payload: RTCIceCandidateInit }
  error: RoomError
}

export type ClientEventName = keyof ClientToServerEvents
export type ServerEventName = keyof ServerToClientEvents

export type RoomSocketStatus =
  | "idle"
  | "connecting"
  | "joined"
  | "error"
  | "left"
  | "removed"

export type CurrentUser = {
  id: string
  username: string
  avatarUrl: string | null
}
