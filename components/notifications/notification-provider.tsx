"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { PENDING_NOTIFICATIONS } from "@/lib/home/fixtures"
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
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null
)

const TOAST_TTL_MS = 4000

type NotificationProviderProps = {
  children: ReactNode
  initialInbox?: InboxNotification[]
}

export const NotificationProvider = ({
  children,
  initialInbox = PENDING_NOTIFICATIONS,
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

  const value = useMemo(
    () => ({
      inbox,
      unreadCount,
      toasts,
      notify,
      markAllRead,
      dismissToast,
    }),
    [inbox, unreadCount, toasts, notify, markAllRead, dismissToast]
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
