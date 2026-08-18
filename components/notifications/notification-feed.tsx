"use client"

import { useRouter } from "next/navigation"
import {
  CheckCheck,
  DoorOpenIcon,
  UserCheck,
  UserPlus,
  UsersIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { AppNotification, NotificationType } from "@/lib/notifications/api"
import { cn } from "@/lib/utils"

type NotificationFeedProps = {
  notifications: AppNotification[]
  onMarkRead: (id: string) => Promise<void>
  className?: string
}

const formatRelativeTime = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(1, Math.floor(diffMs / 60_000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined

const titleForType = (type: NotificationType): string => {
  switch (type) {
    case "friend_request":
      return "Friend request"
    case "friend_accepted":
      return "Friend request accepted"
    case "room_invite":
      return "Room invite"
    case "access_approved":
      return "Access approved"
    case "access_denied":
      return "Access denied"
  }
}

const bodyForNotification = (item: AppNotification): string => {
  const fromUsername = asString(item.payload.fromUsername) ?? "Someone"
  const byUsername = asString(item.payload.byUsername) ?? "Someone"
  const roomName = asString(item.payload.roomName) ?? "a watch room"
  const roomUid = asString(item.payload.roomUid)

  switch (item.type) {
    case "friend_request":
      return `${fromUsername} wants to be friends`
    case "friend_accepted":
      return `${byUsername} accepted your friend request`
    case "room_invite":
      return `${fromUsername} invited you to ${roomName}`
    case "access_approved":
      return roomUid
        ? `You can join room ${roomUid}`
        : "Your access request was approved"
    case "access_denied":
      return roomUid
        ? `Access was denied for room ${roomUid}`
        : "Your access request was denied"
  }
}

const iconForType = (type: NotificationType) => {
  switch (type) {
    case "friend_request":
      return UserPlus
    case "friend_accepted":
      return UserCheck
    case "room_invite":
      return DoorOpenIcon
    case "access_approved":
    case "access_denied":
      return UsersIcon
  }
}

export const NotificationFeed = ({
  notifications,
  onMarkRead,
  className,
}: NotificationFeedProps) => {
  const router = useRouter()

  const handleJoinInvite = (item: AppNotification) => {
    const roomUid = asString(item.payload.roomUid)
    if (!roomUid) return
    void onMarkRead(item.id)
    router.push(`/room/${roomUid}`)
  }

  const handleActivate = (item: AppNotification) => {
    if (item.readAt) return
    void onMarkRead(item.id)
  }

  if (notifications.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 px-4 py-10 text-center",
          className
        )}
      >
        <CheckCheck className="size-5 text-[#f3eadc]/35" aria-hidden />
        <p className="text-sm text-[#f3eadc]/70">No activity yet</p>
        <p className="text-xs text-[#f3eadc]/45">
          Friend requests, invites, and access decisions land here.
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className={cn("h-80", className)}>
      <ul className="pr-2">
        {notifications.map((item, index) => {
          const Icon = iconForType(item.type)
          const title = titleForType(item.type)
          const body = bodyForNotification(item)
          const isUnread = !item.readAt
          const roomUid = asString(item.payload.roomUid)

          return (
            <li key={item.id}>
              {index > 0 ? (
                <Separator className="bg-night-bordeaux/40 opacity-60" />
              ) : null}
              <div
                className={cn(
                  "flex w-full items-start gap-3 rounded-md px-2 py-3",
                  isUnread && "bg-amber-flame/5"
                )}
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  onClick={() => handleActivate(item)}
                  aria-label={
                    isUnread ? `Mark ${title} as read` : title
                  }
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-night-bordeaux">
                    <Icon className="size-4 text-[#f3eadc]" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p
                        className={cn(
                          "truncate text-sm text-[#f3eadc]",
                          isUnread ? "font-semibold" : "font-medium"
                        )}
                      >
                        {title}
                      </p>
                      <span className="ml-auto shrink-0 text-[11px] text-[#f3eadc]/45">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-[#f3eadc]/60">
                      {body}
                    </p>
                  </div>
                </button>
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    isUnread ? "bg-amber-flame" : "bg-transparent"
                  )}
                  aria-hidden
                />
              </div>
              {item.type === "room_invite" && roomUid ? (
                <div className="-mt-1 mb-2 ml-14 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 bg-amber-flame px-2.5 text-xs text-ink-black hover:bg-[#e5a500]"
                    onClick={() => handleJoinInvite(item)}
                    aria-label={`Join room ${roomUid}`}
                  >
                    Join
                  </Button>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </ScrollArea>
  )
}
