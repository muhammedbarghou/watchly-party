import { FRIENDS_LIVE_ROOMS } from "@/lib/home/fixtures"
import type { RoomCardData } from "@/lib/home/types"

import type { FriendUser, FriendshipRow } from "@/lib/friends/types"

export const SELF_USERNAME = "you"

export const SELF_USER: FriendUser = {
  id: "me",
  username: SELF_USERNAME,
  avatarUrl: null,
}

export const FRIEND_DIRECTORY: FriendUser[] = [
  { id: "friend-1", username: "maya", avatarUrl: null },
  { id: "friend-2", username: "jordan", avatarUrl: null },
  { id: "friend-3", username: "sam", avatarUrl: null },
  { id: "friend-alex", username: "alex", avatarUrl: null },
  { id: "friend-kai", username: "kai", avatarUrl: null },
  { id: "friend-rio", username: "rio", avatarUrl: null },
  { id: "friend-nova", username: "nova", avatarUrl: null },
]

const liveRoomUidByHostId = new Map(
  FRIENDS_LIVE_ROOMS.map((room) => [room.host.id, room.uid])
)

export const INITIAL_ACCEPTED_FRIENDS: FriendshipRow[] = [
  {
    id: "fs-maya",
    status: "accepted",
    otherUser: FRIEND_DIRECTORY[0],
    liveRoomUid: liveRoomUidByHostId.get("friend-1") ?? null,
    createdAt: "2026-07-01T12:00:00.000Z",
  },
  {
    id: "fs-jordan",
    status: "accepted",
    otherUser: FRIEND_DIRECTORY[1],
    liveRoomUid: liveRoomUidByHostId.get("friend-2") ?? null,
    createdAt: "2026-07-12T09:30:00.000Z",
  },
  {
    id: "fs-sam",
    status: "accepted",
    otherUser: FRIEND_DIRECTORY[2],
    liveRoomUid: liveRoomUidByHostId.get("friend-3") ?? null,
    createdAt: "2026-07-20T18:00:00.000Z",
  },
]

export const INITIAL_INCOMING_REQUESTS: FriendshipRow[] = [
  {
    id: "fs-alex-in",
    status: "pending_incoming",
    otherUser: FRIEND_DIRECTORY[3],
    liveRoomUid: null,
    createdAt: "2026-08-09T10:00:00.000Z",
  },
]

export const INITIAL_OUTGOING_REQUESTS: FriendshipRow[] = [
  {
    id: "fs-kai-out",
    status: "pending_outgoing",
    otherUser: FRIEND_DIRECTORY[4],
    liveRoomUid: null,
    createdAt: "2026-08-08T16:00:00.000Z",
  },
]

export const friendsLiveRoomsFromAccepted = (
  accepted: FriendshipRow[]
): RoomCardData[] => {
  const acceptedHostIds = new Set(accepted.map((row) => row.otherUser.id))
  return FRIENDS_LIVE_ROOMS.filter((room) =>
    acceptedHostIds.has(room.host.id)
  )
}

export const findDirectoryUser = (
  username: string
): FriendUser | undefined => {
  const normalized = username.trim().toLowerCase()
  return FRIEND_DIRECTORY.find(
    (user) => user.username.toLowerCase() === normalized
  )
}
