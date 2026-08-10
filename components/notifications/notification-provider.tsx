"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { usePreferences } from "@/components/settings/preferences-provider"
import type {
  InboxNotification,
  InboxNotificationType,
  TransientNotification,
} from "@/lib/home/types"

export type PushInboxInput = {
  type: InboxNotificationType
  title: string
  body: string
  id?: string
  actorUsername?: string
  actorAvatarUrl?: string | null
  friendshipId?: string
  roomUid?: string
  fromUserId?: string
}

export type FriendRequestInboxInput = {
  friendshipId: string
  username: string
  avatarUrl?: string | null
}

type NotificationContextValue = {
  inbox: InboxNotification[]
  unreadCount: number
  toasts: TransientNotification[]
  notify: (message: string) => void
  markAllRead: () => void
  markRead: (id: string) => void
  dismissToast: (id: string) => void
  removeInboxById: (id: string) => void
  upsertFriendRequestInbox: (input: FriendRequestInboxInput) => void
  removeInboxByFriendshipId: (friendshipId: string) => void
  removeInboxByFriendUsername: (username: string) => void
  pushInboxNotification: (notification: PushInboxInput) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null
)

const TOAST_TTL_MS = 4000

const friendRequestBody = (username: string) =>
  `${username} wants to be friends`

type NotificationProviderProps = {
  children: ReactNode
  initialInbox?: InboxNotification[]
}

export const NotificationProvider = ({
  children,
  initialInbox = [],
}: NotificationProviderProps) => {
  const { preferences } = usePreferences()
  const [inbox, setInbox] = useState<InboxNotification[]>(initialInbox)
  const [toasts, setToasts] = useState<TransientNotification[]>([])

  const unreadCount = useMemo(
    () => inbox.filter((item) => !item.read).length,
    [inbox]
  )

  const isInboxTypeEnabled = useCallback(
    (type: InboxNotificationType): boolean => {
      switch (type) {
        case "friend_request":
          return preferences.notifyFriendRequest
        case "room_invite":
          return preferences.notifyRoomInvite
        case "access_request":
          return preferences.notifyAccessRequest
        default:
          return true
      }
    },
    [preferences]
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (message: string) => {
      if (!preferences.notifyToastsEnabled) return

      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => [
        ...prev,
        { id, message, createdAt: Date.now() },
      ])

      window.setTimeout(() => {
        dismissToast(id)
      }, TOAST_TTL_MS)
    },
    [dismissToast, preferences.notifyToastsEnabled]
  )

  const markAllRead = useCallback(() => {
    setInbox((prev) => prev.map((item) => ({ ...item, read: true })))
  }, [])

  const markRead = useCallback((id: string) => {
    setInbox((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    )
  }, [])

  const removeInboxById = useCallback((id: string) => {
    setInbox((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const pushInboxNotification = useCallback(
    (notification: PushInboxInput) => {
      if (!isInboxTypeEnabled(notification.type)) return

      const id =
        notification.id ??
        `notif-${notification.type}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`

      setInbox((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === id)
        if (existingIndex >= 0) {
          return prev.map((item, index) =>
            index === existingIndex
              ? {
                  ...item,
                  ...notification,
                  id,
                  read: false,
                  createdAt: item.createdAt,
                }
              : item
          )
        }

        // Dedupe access requests / invites by room + actor
        if (
          notification.type === "access_request" &&
          notification.roomUid &&
          notification.fromUserId
        ) {
          const dup = prev.find(
            (item) =>
              item.type === "access_request" &&
              item.roomUid === notification.roomUid &&
              item.fromUserId === notification.fromUserId
          )
          if (dup) {
            return prev.map((item) =>
              item.id === dup.id
                ? { ...item, ...notification, id: dup.id, read: false }
                : item
            )
          }
        }

        if (
          notification.type === "room_invite" &&
          notification.roomUid &&
          notification.fromUserId
        ) {
          const dup = prev.find(
            (item) =>
              item.type === "room_invite" &&
              item.roomUid === notification.roomUid &&
              item.fromUserId === notification.fromUserId
          )
          if (dup) {
            return prev.map((item) =>
              item.id === dup.id
                ? { ...item, ...notification, id: dup.id, read: false }
                : item
            )
          }
        }

        return [
          {
            id,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            createdAt: new Date().toISOString(),
            read: false,
            actorUsername: notification.actorUsername,
            actorAvatarUrl: notification.actorAvatarUrl,
            friendshipId: notification.friendshipId,
            roomUid: notification.roomUid,
            fromUserId: notification.fromUserId,
          },
          ...prev,
        ]
      })
    },
    [isInboxTypeEnabled]
  )

  const upsertFriendRequestInbox = useCallback(
    (input: FriendRequestInboxInput) => {
      if (!preferences.notifyFriendRequest) return

      const body = friendRequestBody(input.username)
      setInbox((prev) => {
        const existing = prev.find(
          (item) =>
            item.type === "friend_request" &&
            (item.friendshipId === input.friendshipId ||
              item.actorUsername === input.username)
        )
        if (existing) {
          return prev.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  friendshipId: input.friendshipId,
                  actorUsername: input.username,
                  actorAvatarUrl: input.avatarUrl ?? item.actorAvatarUrl,
                  body,
                  read: false,
                }
              : item
          )
        }
        return [
          {
            id: `notif-fr-${input.friendshipId}`,
            type: "friend_request" as const,
            title: "Friend request",
            body,
            createdAt: new Date().toISOString(),
            read: false,
            actorUsername: input.username,
            actorAvatarUrl: input.avatarUrl ?? null,
            friendshipId: input.friendshipId,
          },
          ...prev,
        ]
      })
    },
    [preferences.notifyFriendRequest]
  )

  const removeInboxByFriendshipId = useCallback((friendshipId: string) => {
    setInbox((prev) =>
      prev.filter(
        (item) =>
          !(
            item.type === "friend_request" &&
            item.friendshipId === friendshipId
          )
      )
    )
  }, [])

  const removeInboxByFriendUsername = useCallback((username: string) => {
    setInbox((prev) =>
      prev.filter(
        (item) =>
          !(
            item.type === "friend_request" &&
            (item.actorUsername === username ||
              item.body === friendRequestBody(username))
          )
      )
    )
  }, [])

  const value = useMemo(
    () => ({
      inbox,
      unreadCount,
      toasts,
      notify,
      markAllRead,
      markRead,
      dismissToast,
      removeInboxById,
      upsertFriendRequestInbox,
      removeInboxByFriendshipId,
      removeInboxByFriendUsername,
      pushInboxNotification,
    }),
    [
      inbox,
      unreadCount,
      toasts,
      notify,
      markAllRead,
      markRead,
      dismissToast,
      removeInboxById,
      upsertFriendRequestInbox,
      removeInboxByFriendshipId,
      removeInboxByFriendUsername,
      pushInboxNotification,
    ]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    )
  }
  return context
}
