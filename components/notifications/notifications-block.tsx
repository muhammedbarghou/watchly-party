"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCheck,
  DoorOpenIcon,
  UserPlus,
  UsersIcon,
} from "lucide-react"

import { useAppSocket } from "@/components/notifications/app-socket-provider"
import { useNotifications } from "@/components/notifications/notification-provider"
import { useFriends } from "@/components/friends/friends-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { InboxNotification } from "@/lib/home/types"
import { cn } from "@/lib/utils"

type Filter = "all" | "unread" | "requests"

const formatRelativeTime = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(1, Math.floor(diffMs / 60_000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const isRequestType = (item: InboxNotification): boolean =>
  item.type === "friend_request" ||
  item.type === "access_request" ||
  item.type === "room_invite"

const iconForType = (type: InboxNotification["type"]) => {
  switch (type) {
    case "friend_request":
      return UserPlus
    case "access_request":
      return UsersIcon
    case "room_invite":
      return DoorOpenIcon
    default:
      return UserPlus
  }
}

type NotificationsBlockProps = {
  className?: string
  compact?: boolean
}

export const NotificationsBlock = ({
  className,
  compact = true,
}: NotificationsBlockProps) => {
  const router = useRouter()
  const {
    inbox,
    unreadCount,
    markAllRead,
    markRead,
    removeInboxById,
    notify,
  } = useNotifications()
  const { acceptRequest, declineRequest, incoming } = useFriends()
  const { emit } = useAppSocket()
  const [filter, setFilter] = useState<Filter>("all")
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set())

  const requestsCount = useMemo(
    () => inbox.filter(isRequestType).length,
    [inbox]
  )

  const visible = useMemo(() => {
    if (filter === "unread") return inbox.filter((item) => !item.read)
    if (filter === "requests") return inbox.filter(isRequestType)
    return inbox
  }, [inbox, filter])

  const setRowPending = (id: string, pending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev)
      if (pending) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleAcceptFriend = async (item: InboxNotification) => {
    const friendshipId =
      item.friendshipId ||
      incoming.find((row) => row.otherUser.username === item.actorUsername)?.id
    if (!friendshipId) {
      notify("Could not find that friend request.")
      return
    }
    setRowPending(item.id, true)
    try {
      await acceptRequest(friendshipId)
      removeInboxById(item.id)
    } finally {
      setRowPending(item.id, false)
    }
  }

  const handleDeclineFriend = async (item: InboxNotification) => {
    const friendshipId =
      item.friendshipId ||
      incoming.find((row) => row.otherUser.username === item.actorUsername)?.id
    if (!friendshipId) {
      notify("Could not find that friend request.")
      return
    }
    setRowPending(item.id, true)
    try {
      await declineRequest(friendshipId)
      removeInboxById(item.id)
    } finally {
      setRowPending(item.id, false)
    }
  }

  const handleApproveAccess = (item: InboxNotification) => {
    if (!item.roomUid || !item.fromUserId) {
      notify("Missing access request details.")
      return
    }
    const ok = emit("approve_access", {
      roomUid: item.roomUid,
      targetUserId: item.fromUserId,
    })
    if (!ok) {
      notify("Not connected — open the room or try again.")
      return
    }
    removeInboxById(item.id)
    notify("Access approved")
  }

  const handleDenyAccess = (item: InboxNotification) => {
    if (!item.roomUid || !item.fromUserId) {
      notify("Missing access request details.")
      return
    }
    const ok = emit("deny_access", {
      roomUid: item.roomUid,
      targetUserId: item.fromUserId,
    })
    if (!ok) {
      notify("Not connected — open the room or try again.")
      return
    }
    removeInboxById(item.id)
    notify("Access denied")
  }

  const handleJoinInvite = (item: InboxNotification) => {
    if (!item.roomUid) {
      notify("Missing room invite details.")
      return
    }
    markRead(item.id)
    removeInboxById(item.id)
    router.push(`/room/${item.roomUid}`)
  }

  const handleDismissInvite = (item: InboxNotification) => {
    removeInboxById(item.id)
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col text-[#f3eadc]",
        compact ? "gap-3" : "gap-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-[#f3eadc]">
            Notifications
            {unreadCount > 0 ? (
              <Badge className="bg-amber-flame text-[10px] text-ink-black">
                {unreadCount} new
              </Badge>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs text-[#f3eadc]/50">
            Friends, invites, and room access
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-1 py-0 text-xs text-amber-flame hover:bg-transparent hover:text-[#e5a500]"
          onClick={markAllRead}
          disabled={unreadCount === 0}
          aria-label="Mark all notifications as read"
        >
          <CheckCheck className="size-3.5" aria-hidden />
          Mark all read
        </Button>
      </div>

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as Filter)}
        className="gap-3"
      >
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-1 border-b border-night-bordeaux/40 bg-transparent p-0"
        >
          <TabsTrigger
            value="all"
            className="flex-1 rounded-none px-2 py-2 text-[#f3eadc]/60 data-active:text-[#f3eadc]"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="flex-1 rounded-none px-2 py-2 text-[#f3eadc]/60 data-active:text-[#f3eadc]"
          >
            Unread
            {unreadCount > 0 ? (
              <span className="ml-1 rounded-full bg-amber-flame/15 px-1.5 text-[10px] text-amber-flame tabular-nums">
                {unreadCount}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="flex-1 rounded-none px-2 py-2 text-[#f3eadc]/60 data-active:text-[#f3eadc]"
          >
            Requests
            {requestsCount > 0 ? (
              <span className="ml-1 rounded-full bg-white/10 px-1.5 text-[10px] text-[#f3eadc]/70 tabular-nums">
                {requestsCount}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="outline-none">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
              <CheckCheck className="size-5 text-[#f3eadc]/35" aria-hidden />
              <p className="text-sm text-[#f3eadc]/70">You&apos;re all caught up</p>
              <p className="text-xs text-[#f3eadc]/45">
                No notifications in this view.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-80">
              <ul className="pr-2">
                {visible.map((item, index) => {
                  const Icon = iconForType(item.type)
                  const actor =
                    item.actorUsername ||
                    item.title.split(" ")[0] ||
                    "Someone"
                  const isPending = pendingIds.has(item.id)

                  return (
                    <li key={item.id}>
                      {index > 0 ? (
                        <Separator className="bg-night-bordeaux/40 opacity-60" />
                      ) : null}
                      <div
                        className={cn(
                          "flex w-full items-start gap-3 rounded-md px-2 py-3",
                          !item.read && "bg-amber-flame/5"
                        )}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="size-9">
                            {item.actorAvatarUrl ? (
                              <AvatarImage
                                src={item.actorAvatarUrl}
                                alt=""
                              />
                            ) : null}
                            <AvatarFallback className="bg-night-bordeaux text-[10px] text-[#f3eadc]">
                              {item.actorAvatarUrl ? (
                                getInitials(actor)
                              ) : (
                                <Icon className="size-4" aria-hidden />
                              )}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <p
                              className={cn(
                                "truncate text-sm text-[#f3eadc]",
                                !item.read ? "font-semibold" : "font-medium"
                              )}
                            >
                              {item.title}
                            </p>
                            <span className="ml-auto shrink-0 text-[11px] text-[#f3eadc]/45">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs text-[#f3eadc]/60">
                            {item.body}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.type === "friend_request" ? (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-7 bg-amber-flame px-2.5 text-xs text-ink-black hover:bg-[#e5a500]"
                                  disabled={isPending}
                                  onClick={() => void handleAcceptFriend(item)}
                                  aria-label={`Accept friend request from ${actor}`}
                                >
                                  Accept
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-7 border-night-bordeaux/50 px-2.5 text-xs text-[#f3eadc]"
                                  disabled={isPending}
                                  onClick={() => void handleDeclineFriend(item)}
                                  aria-label={`Decline friend request from ${actor}`}
                                >
                                  Decline
                                </Button>
                              </>
                            ) : null}

                            {item.type === "access_request" ? (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-7 bg-amber-flame px-2.5 text-xs text-ink-black hover:bg-[#e5a500]"
                                  onClick={() => handleApproveAccess(item)}
                                  aria-label={`Approve access for ${actor}`}
                                >
                                  Approve
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-7 border-night-bordeaux/50 px-2.5 text-xs text-[#f3eadc]"
                                  onClick={() => handleDenyAccess(item)}
                                  aria-label={`Deny access for ${actor}`}
                                >
                                  Deny
                                </Button>
                              </>
                            ) : null}

                            {item.type === "room_invite" ? (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-7 bg-amber-flame px-2.5 text-xs text-ink-black hover:bg-[#e5a500]"
                                  onClick={() => handleJoinInvite(item)}
                                  aria-label={`Join room ${item.roomUid}`}
                                >
                                  Join
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2.5 text-xs text-[#f3eadc]/70"
                                  onClick={() => handleDismissInvite(item)}
                                  aria-label="Dismiss invite"
                                >
                                  Dismiss
                                </Button>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <span
                          className={cn(
                            "mt-1.5 size-2 shrink-0 rounded-full",
                            !item.read ? "bg-amber-flame" : "bg-transparent"
                          )}
                          aria-hidden
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default NotificationsBlock
