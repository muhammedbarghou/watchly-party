"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { useNotifications } from "@/components/notifications/notification-provider"
import {
  findDirectoryUser,
  friendsLiveRoomsFromAccepted,
  INITIAL_ACCEPTED_FRIENDS,
  INITIAL_INCOMING_REQUESTS,
  INITIAL_OUTGOING_REQUESTS,
  SELF_USERNAME,
} from "@/lib/friends/fixtures"
import type {
  FriendLookupResult,
  FriendshipRow,
} from "@/lib/friends/types"
import type { RoomCardData } from "@/lib/home/types"

const LOAD_DELAY_MS = 650

type FriendsContextValue = {
  friends: FriendshipRow[]
  incoming: FriendshipRow[]
  outgoing: FriendshipRow[]
  incomingCount: number
  isLoading: boolean
  friendsLiveRooms: RoomCardData[]
  filterFriends: (query: string) => FriendshipRow[]
  lookupUsername: (username: string) => FriendLookupResult
  acceptRequest: (id: string) => void
  declineRequest: (id: string) => void
  cancelRequest: (id: string) => void
  sendRequest: (username: string) => boolean
  removeFriend: (id: string) => void
}

const FriendsContext = createContext<FriendsContextValue | null>(null)

type FriendsProviderProps = {
  children: ReactNode
}

export const FriendsProvider = ({ children }: FriendsProviderProps) => {
  const { notify, removeInboxByFriendUsername } = useNotifications()
  const [isLoading, setIsLoading] = useState(true)
  const [friends, setFriends] = useState<FriendshipRow[]>(
    INITIAL_ACCEPTED_FRIENDS
  )
  const [incoming, setIncoming] = useState<FriendshipRow[]>(
    INITIAL_INCOMING_REQUESTS
  )
  const [outgoing, setOutgoing] = useState<FriendshipRow[]>(
    INITIAL_OUTGOING_REQUESTS
  )

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), LOAD_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const incomingCount = incoming.length

  const friendsLiveRooms = useMemo(
    () => friendsLiveRoomsFromAccepted(friends),
    [friends]
  )

  const filterFriends = useCallback(
    (query: string) => {
      const normalized = query.trim().toLowerCase()
      if (!normalized) return friends
      return friends.filter((row) =>
        row.otherUser.username.toLowerCase().includes(normalized)
      )
    },
    [friends]
  )

  const lookupUsername = useCallback(
    (username: string): FriendLookupResult => {
      const normalized = username.trim().toLowerCase()
      if (!normalized) {
        return { ok: false, error: "not_found" }
      }

      if (normalized === SELF_USERNAME) {
        return { ok: false, error: "self" }
      }

      const user = findDirectoryUser(normalized)
      if (!user) {
        return { ok: false, error: "not_found" }
      }

      if (friends.some((row) => row.otherUser.id === user.id)) {
        return { ok: true, user, relation: "already_friends" }
      }
      if (outgoing.some((row) => row.otherUser.id === user.id)) {
        return { ok: true, user, relation: "outgoing_pending" }
      }
      if (incoming.some((row) => row.otherUser.id === user.id)) {
        return { ok: true, user, relation: "incoming_pending" }
      }

      return { ok: true, user, relation: "none" }
    },
    [friends, incoming, outgoing]
  )

  const acceptRequest = useCallback(
    (id: string) => {
      const row = incoming.find((item) => item.id === id)
      if (!row) return

      setIncoming((prev) => prev.filter((item) => item.id !== id))
      setFriends((prev) => [
        {
          ...row,
          status: "accepted",
          liveRoomUid: null,
        },
        ...prev,
      ])
      removeInboxByFriendUsername(row.otherUser.username)
      notify(`You and ${row.otherUser.username} are now friends`)
    },
    [incoming, notify, removeInboxByFriendUsername]
  )

  const declineRequest = useCallback(
    (id: string) => {
      const row = incoming.find((item) => item.id === id)
      if (!row) return

      setIncoming((prev) => prev.filter((item) => item.id !== id))
      removeInboxByFriendUsername(row.otherUser.username)
      notify(`Declined ${row.otherUser.username}'s friend request`)
    },
    [incoming, notify, removeInboxByFriendUsername]
  )

  const cancelRequest = useCallback(
    (id: string) => {
      const row = outgoing.find((item) => item.id === id)
      if (!row) return

      setOutgoing((prev) => prev.filter((item) => item.id !== id))
      notify(`Cancelled request to ${row.otherUser.username}`)
    },
    [notify, outgoing]
  )

  const sendRequest = useCallback(
    (username: string) => {
      const result = lookupUsername(username)
      if (!result.ok || result.relation !== "none") return false

      const newRow: FriendshipRow = {
        id: `fs-out-${result.user.id}-${Date.now()}`,
        status: "pending_outgoing",
        otherUser: result.user,
        liveRoomUid: null,
        createdAt: new Date().toISOString(),
      }
      setOutgoing((prev) => [newRow, ...prev])
      notify(`Friend request sent to ${result.user.username}`)
      return true
    },
    [lookupUsername, notify]
  )

  const removeFriend = useCallback(
    (id: string) => {
      const row = friends.find((item) => item.id === id)
      if (!row) return

      setFriends((prev) => prev.filter((item) => item.id !== id))
      notify(`Removed ${row.otherUser.username} from your friends`)
    },
    [friends, notify]
  )

  const value = useMemo(
    () => ({
      friends,
      incoming,
      outgoing,
      incomingCount,
      isLoading,
      friendsLiveRooms,
      filterFriends,
      lookupUsername,
      acceptRequest,
      declineRequest,
      cancelRequest,
      sendRequest,
      removeFriend,
    }),
    [
      friends,
      incoming,
      outgoing,
      incomingCount,
      isLoading,
      friendsLiveRooms,
      filterFriends,
      lookupUsername,
      acceptRequest,
      declineRequest,
      cancelRequest,
      sendRequest,
      removeFriend,
    ]
  )

  return (
    <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>
  )
}

export const useFriends = (): FriendsContextValue => {
  const context = useContext(FriendsContext)
  if (!context) {
    throw new Error("useFriends must be used within a FriendsProvider")
  }
  return context
}
