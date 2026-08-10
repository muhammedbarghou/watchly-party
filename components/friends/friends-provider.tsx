"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { useNotifications } from "@/components/notifications/notification-provider"
import {
  acceptFriendRequest,
  deleteFriendship,
  fetchFriendships,
  lookupUsername as lookupUsernameApi,
  sendFriendRequest,
} from "@/lib/friends/api"
import type {
  FriendLookupResult,
  FriendshipRow,
} from "@/lib/friends/types"
import {
  buildLiveRoomByFriendId,
  fetchFriendsLiveRooms,
} from "@/lib/home/rooms"
import type { RoomCardData } from "@/lib/home/types"
import { createClient } from "@/lib/supabase/client"

type FriendsContextValue = {
  friends: FriendshipRow[]
  incoming: FriendshipRow[]
  outgoing: FriendshipRow[]
  incomingCount: number
  isLoading: boolean
  friendsLiveRooms: RoomCardData[]
  filterFriends: (query: string) => FriendshipRow[]
  lookupUsername: (username: string) => Promise<FriendLookupResult>
  acceptRequest: (id: string) => Promise<void>
  declineRequest: (id: string) => Promise<void>
  cancelRequest: (id: string) => Promise<void>
  sendRequest: (username: string) => Promise<boolean>
  removeFriend: (id: string) => Promise<void>
}

const FriendsContext = createContext<FriendsContextValue | null>(null)

type FriendsProviderProps = {
  children: ReactNode
}

export const FriendsProvider = ({ children }: FriendsProviderProps) => {
  const { notify, upsertFriendRequestInbox, removeInboxByFriendUsername } =
    useNotifications()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [friends, setFriends] = useState<FriendshipRow[]>([])
  const [incoming, setIncoming] = useState<FriendshipRow[]>([])
  const [outgoing, setOutgoing] = useState<FriendshipRow[]>([])
  const [friendsLiveRooms, setFriendsLiveRooms] = useState<RoomCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const knownIncomingRef = useRef<Set<string>>(new Set())

  const syncInboxFromIncoming = useCallback(
    (rows: FriendshipRow[]) => {
      const nextIds = new Set(rows.map((row) => row.id))
      for (const row of rows) {
        if (!knownIncomingRef.current.has(row.id)) {
          upsertFriendRequestInbox(row.otherUser.username)
        }
      }
      knownIncomingRef.current = nextIds
    },
    [upsertFriendRequestInbox]
  )

  const refresh = useCallback(async (userId: string) => {
    const snapshot = await fetchFriendships(userId)
    const liveRooms = await fetchFriendsLiveRooms(
      snapshot.friends.map((row) => row.otherUser)
    )
    const liveByFriend = buildLiveRoomByFriendId(liveRooms)

    setFriends(
      snapshot.friends.map((row) => ({
        ...row,
        liveRoomUid: liveByFriend.get(row.otherUser.id) ?? null,
      }))
    )
    setIncoming(snapshot.incoming)
    setOutgoing(snapshot.outgoing)
    setFriendsLiveRooms(liveRooms)
    syncInboxFromIncoming(snapshot.incoming)
  }, [syncInboxFromIncoming])

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    const bootstrap = async () => {
      setIsLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (cancelled) return

      if (!user) {
        setCurrentUserId(null)
        setFriends([])
        setIncoming([])
        setOutgoing([])
        setFriendsLiveRooms([])
        setIsLoading(false)
        return
      }

      setCurrentUserId(user.id)
      await refresh(user.id)
      if (!cancelled) setIsLoading(false)
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [refresh])

  useEffect(() => {
    if (!currentUserId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`friendships:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
        },
        () => {
          void refresh(currentUserId)
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [currentUserId, refresh])

  const incomingCount = incoming.length

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
    async (username: string): Promise<FriendLookupResult> => {
      if (!currentUserId) {
        return { ok: false, error: "not_found" }
      }
      return lookupUsernameApi(username, currentUserId)
    },
    [currentUserId]
  )

  const acceptRequest = useCallback(
    async (id: string) => {
      const row = incoming.find((item) => item.id === id)
      if (!row || !currentUserId) return

      const result = await acceptFriendRequest(id)
      if (!result.ok) {
        notify(result.error)
        return
      }

      removeInboxByFriendUsername(row.otherUser.username)
      notify(`You and ${row.otherUser.username} are now friends`)
      await refresh(currentUserId)
    },
    [
      currentUserId,
      incoming,
      notify,
      refresh,
      removeInboxByFriendUsername,
    ]
  )

  const declineRequest = useCallback(
    async (id: string) => {
      const row = incoming.find((item) => item.id === id)
      if (!row || !currentUserId) return

      const result = await deleteFriendship(id)
      if (!result.ok) {
        notify(result.error)
        return
      }

      removeInboxByFriendUsername(row.otherUser.username)
      notify(`Declined ${row.otherUser.username}'s friend request`)
      await refresh(currentUserId)
    },
    [
      currentUserId,
      incoming,
      notify,
      refresh,
      removeInboxByFriendUsername,
    ]
  )

  const cancelRequest = useCallback(
    async (id: string) => {
      const row = outgoing.find((item) => item.id === id)
      if (!row || !currentUserId) return

      const result = await deleteFriendship(id)
      if (!result.ok) {
        notify(result.error)
        return
      }

      notify(`Cancelled request to ${row.otherUser.username}`)
      await refresh(currentUserId)
    },
    [currentUserId, notify, outgoing, refresh]
  )

  const sendRequest = useCallback(
    async (username: string) => {
      if (!currentUserId) return false

      const result = await lookupUsernameApi(username, currentUserId)
      if (!result.ok || result.relation !== "none") return false

      const mutation = await sendFriendRequest(result.user.id, currentUserId)
      if (!mutation.ok) {
        notify(mutation.error)
        return false
      }

      notify(`Friend request sent to ${result.user.username}`)
      await refresh(currentUserId)
      return true
    },
    [currentUserId, notify, refresh]
  )

  const removeFriend = useCallback(
    async (id: string) => {
      const row = friends.find((item) => item.id === id)
      if (!row || !currentUserId) return

      const result = await deleteFriendship(id)
      if (!result.ok) {
        notify(result.error)
        return
      }

      notify(`Removed ${row.otherUser.username} from your friends`)
      await refresh(currentUserId)
    },
    [currentUserId, friends, notify, refresh]
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
