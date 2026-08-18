import { createClient } from "@/lib/supabase/client"

export type NotificationType =
  | "friend_request"
  | "friend_accepted"
  | "room_invite"
  | "access_approved"
  | "access_denied"

export type AppNotification = {
  id: string
  type: NotificationType
  payload: Record<string, unknown>
  readAt: string | null
  createdAt: string
}

type NotificationRow = {
  id: string
  type: NotificationType
  payload: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

export const mapNotificationRow = (row: NotificationRow): AppNotification => ({
  id: row.id,
  type: row.type,
  payload: row.payload ?? {},
  readAt: row.read_at,
  createdAt: row.created_at,
})

export const fetchNotifications = async (
  limit = 30
): Promise<AppNotification[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, payload, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map(mapNotificationRow)
}

export const fetchUnreadCount = async (): Promise<number> => {
  const supabase = createClient()
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null)

  if (error) throw error
  return count ?? 0
}

export const markNotificationRead = async (id: string): Promise<void> => {
  const supabase = createClient()
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
}

export const markAllNotificationsRead = async (): Promise<void> => {
  const supabase = createClient()
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null)
  if (error) throw error
}
