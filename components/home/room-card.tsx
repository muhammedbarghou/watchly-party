"use client"

import type { KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { UsersIcon } from "lucide-react"

import { VideoPlayerPreview } from "@/components/kibo-ui/video-player"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { RoomCardData } from "@/lib/home/types"
import { cn } from "@/lib/utils"

type RoomCardProps = {
  room: RoomCardData
  variant: "friends" | "recent" | "public"
  accessRequested?: boolean
  onRequestAccess?: (room: RoomCardData) => void
  onSelectClosed?: (room: RoomCardData) => void
}

const getRoomTitle = (room: RoomCardData): string => {
  if (room.name?.trim()) return room.name.trim()
  return `${room.host.username}'s room`
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return parts[0].slice(0, 2).toUpperCase()
}

export const RoomCard = ({
  room,
  variant,
  accessRequested = false,
  onRequestAccess,
  onSelectClosed,
}: RoomCardProps) => {
  const router = useRouter()
  const isLive = room.status === "active"
  const isClosed = room.status === "closed"
  const title = getRoomTitle(room)

  const handleActivate = () => {
    if (isClosed) {
      onSelectClosed?.(room)
      return
    }

    if (variant === "friends" && room.requiresApproval && room.visibility !== "public") {
      onRequestAccess?.(room)
      return
    }

    router.push(`/room/${room.uid}`)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleActivate()
    }
  }

  return (
    <Card
      role={isClosed && !onSelectClosed ? undefined : "button"}
      tabIndex={isClosed && !onSelectClosed ? undefined : 0}
      aria-label={
        isClosed
          ? `${title}, closed`
          : room.requiresApproval && variant === "friends"
            ? `${title}, request access`
            : `Join ${title}`
      }
      onClick={isClosed && !onSelectClosed ? undefined : handleActivate}
      onKeyDown={isClosed && !onSelectClosed ? undefined : handleKeyDown}
      className={cn(
        "glass-panel gap-0 border-none bg-transparent p-0 ring-1 ring-white/8 transition",
        isClosed
          ? "cursor-default opacity-55"
          : "cursor-pointer hover:ring-amber-flame/40 focus-visible:ring-2 focus-visible:ring-amber-flame/60"
      )}
    >
      <div className="relative">
        <VideoPlayerPreview poster={room.posterUrl} alt="" />
        {isLive ? (
          <Badge className="absolute top-2 left-2 bg-brick-ember text-white">
            LIVE
          </Badge>
        ) : null}
      </div>
      <CardContent className="flex flex-col gap-3 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-[#f3eadc]">{title}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-[#f3eadc]/60">
              <Avatar size="sm" className="size-5">
                {room.host.avatarUrl ? (
                  <AvatarImage src={room.host.avatarUrl} alt="" />
                ) : null}
                <AvatarFallback className="bg-night-bordeaux text-[9px] text-[#f3eadc]">
                  {getInitials(room.host.username)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{room.host.username}</span>
            </div>
          </div>
          {isLive ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-[#f3eadc]/70">
              <UsersIcon className="size-3.5" aria-hidden />
              {room.participantCount}
            </span>
          ) : (
            <span className="shrink-0 text-[11px] text-[#f3eadc]/45">Closed</span>
          )}
        </div>

        {variant === "friends" && room.requiresApproval && isLive ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full border-amber-flame/40 text-[#f3eadc] hover:bg-amber-flame/10"
            disabled={accessRequested}
            onClick={(event) => {
              event.stopPropagation()
              onRequestAccess?.(room)
            }}
            aria-label={
              accessRequested
                ? `Access requested for ${title}`
                : `Request access to ${title}`
            }
          >
            {accessRequested ? "Request sent" : "Request access"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

export const RoomCardSkeleton = () => (
  <Card className="glass-panel gap-0 border-none bg-transparent p-0 ring-1 ring-white/8">
    <Skeleton className="aspect-video w-full rounded-none bg-white/10" />
    <CardContent className="flex flex-col gap-3 p-3">
      <Skeleton className="h-4 w-3/4 bg-white/10" />
      <Skeleton className="h-3 w-1/2 bg-white/10" />
    </CardContent>
  </Card>
)
