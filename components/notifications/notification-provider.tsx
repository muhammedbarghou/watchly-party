"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type {
  InboxNotification,
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
  const [inbox, setInbox] = useState<InboxNotification[]>(initialInbox)
  const [toasts, setToasts] = useState<TransientNotification[]>([])

  const unreadCount = useMemo(
    () => inbox.filter((item) => !item.read).length,
    [inbox]
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => [
        ...prev,
        { id, message, createdAt: Date.now() },
      ])

      window.setTimeout(() => {
        dismissToast(id)
      }, TOAST_TTL_MS)
    },
    [dismissToast]
  )

  const markAllRead = useCallback(() => {
    setInbox((prev) => prev.map((item) => ({ ...item, read: true })))
  }, [])

  const upsertFriendRequestInbox = useCallback((username: string) => {
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
  }, [])

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
