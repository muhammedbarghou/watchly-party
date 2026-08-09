"use client"

import type { ReactNode } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { FriendUser } from "@/lib/friends/types"

type FriendListRowProps = {
  user: FriendUser
  showLive?: boolean
  actions?: ReactNode
  meta?: ReactNode
  className?: string
}

const getInitials = (username: string) =>
  username.slice(0, 2).toUpperCase()

export const FriendListRow = ({
  user,
  showLive = false,
  actions,
  meta,
  className,
}: FriendListRowProps) => {
  return (
    <li
      className={cn(
        "flex items-center gap-3 border-b border-night-bordeaux/40 px-3 py-3 last:border-b-0",
        className
      )}
    >
      <Avatar size="default" className="size-9">
        {user.avatarUrl ? (
          <AvatarImage src={user.avatarUrl} alt="" />
        ) : null}
        <AvatarFallback className="bg-night-bordeaux text-xs text-[#f3eadc]">
          {getInitials(user.username)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-[#f3eadc]">
            {user.username}
          </p>
          {showLive ? (
            <Badge className="bg-brick-ember text-white">LIVE</Badge>
          ) : null}
        </div>
        {meta ? (
          <div className="mt-0.5 text-xs text-[#f3eadc]/55">{meta}</div>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </li>
  )
}

export const FriendListRowSkeleton = () => {
  return (
    <li className="flex items-center gap-3 border-b border-night-bordeaux/40 px-3 py-3 last:border-b-0">
      <Skeleton className="size-9 rounded-full bg-white/10" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-28 bg-white/10" />
        <Skeleton className="h-3 w-16 bg-white/10" />
      </div>
      <Skeleton className="size-8 rounded-md bg-white/10" />
    </li>
  )
}
