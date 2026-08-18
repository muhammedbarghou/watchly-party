"use client"

import { useCallback, useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"
import {
  type AppNotification,
  fetchNotifications,
  fetchUnreadCount,
  mapNotificationRow,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/api"

const isNotificationRow = (value: unknown): value is Parameters<
  typeof mapNotificationRow
>[0] => {
  if (!value || typeof value !== "object") return false
  const row = value as Record<string, unknown>
  return (
    typeof row.id === "string" &&
    typeof row.type === "string" &&
    typeof row.created_at === "string"
  )
}

export const useNotificationFeed = (userId: string | null) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const [list, count] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount(),
      ])
      setNotifications(list)
      setUnreadCount(count)
    } catch {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    void refresh()

    const supabase = createClient()
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (!isNotificationRow(payload.new)) return
          const next = mapNotificationRow(payload.new)
          setNotifications((prev) => {
            if (prev.some((item) => item.id === next.id)) return prev
            return [next, ...prev]
          })
          if (!next.readAt) {
            setUnreadCount((prev) => prev + 1)
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (!isNotificationRow(payload.new)) return
          const next = mapNotificationRow(payload.new)
          setNotifications((prev) => {
            const existing = prev.find((item) => item.id === next.id)
            const wasUnread = existing ? existing.readAt === null : false
            const isUnread = next.readAt === null
            if (wasUnread && !isUnread) {
              setUnreadCount((count) => Math.max(0, count - 1))
            } else if (!wasUnread && isUnread) {
              setUnreadCount((count) => count + 1)
            }
            if (!existing) return [next, ...prev]
            return prev.map((item) => (item.id === next.id ? next : item))
          })
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId, refresh])

  const markRead = useCallback(async (id: string) => {
    const target = notifications.find((item) => item.id === id)
    if (target?.readAt) return
    try {
      await markNotificationRead(id)
    } catch {
      return
    }
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, readAt: new Date().toISOString() } : item
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [notifications])

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead()
    } catch {
      return
    }
    const readAt = new Date().toISOString()
    setNotifications((prev) => prev.map((item) => ({ ...item, readAt })))
    setUnreadCount(0)
  }, [])

  return { notifications, unreadCount, markRead, markAllRead, refresh }
}
