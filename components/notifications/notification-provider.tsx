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

type NotificationContextValue = {
  inbox: InboxNotification[]
  unreadCount: number
  toasts: TransientNotification[]
  notify: (message: string) => void
  markAllRead: () => void
  dismissToast: (id: string) => void
  upsertFriendRequestInbox: (username: string) => void
  removeInboxByFriendUsername: (username: string) => void
  pushInboxNotification: (notification: {
    type: InboxNotificationType
    title: string
    body: string
  }) => void
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

  const pushInboxNotification = useCallback(
    (notification: {
      type: InboxNotificationType
      title: string
      body: string
    }) => {
      if (!isInboxTypeEnabled(notification.type)) return

      setInbox((prev) => [
        {
          id: `notif-${notification.type}-${Date.now()}`,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ])
    },
    [isInboxTypeEnabled]
  )

  const upsertFriendRequestInbox = useCallback(
    (username: string) => {
      if (!preferences.notifyFriendRequest) return

      const body = friendRequestBody(username)
      setInbox((prev) => {
        const existing = prev.find(
          (item) => item.type === "friend_request" && item.body === body
        )
        if (existing) {
          return prev.map((item) =>
            item.id === existing.id ? { ...item, read: false } : item
          )
        }
        return [
          {
            id: `notif-fr-${username}-${Date.now()}`,
            type: "friend_request" as const,
            title: "Friend request",
            body,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]
      })
    },
    [preferences.notifyFriendRequest]
  )

  const removeInboxByFriendUsername = useCallback((username: string) => {
    const body = friendRequestBody(username)
    setInbox((prev) =>
      prev.filter(
        (item) => !(item.type === "friend_request" && item.body === body)
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
      dismissToast,
      upsertFriendRequestInbox,
      removeInboxByFriendUsername,
      pushInboxNotification,
    }),
    [
      inbox,
      unreadCount,
      toasts,
      notify,
      markAllRead,
      dismissToast,
      upsertFriendRequestInbox,
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
