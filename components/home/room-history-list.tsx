"use client"

import type { KeyboardEvent } from "react"
import { Clock3Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { RoomHistoryEntry } from "@/lib/home/room-history"
import { cn } from "@/lib/utils"

type RoomHistoryListProps = {
  entries: RoomHistoryEntry[]
  onSelectActive: (entry: RoomHistoryEntry) => void
  onSelectClosed: (entry: RoomHistoryEntry) => void
}

const formatJoinedAt = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(1, Math.floor(diffMs / 60_000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const getRoomTitle = (entry: RoomHistoryEntry): string => {
  if (entry.roomName?.trim()) return entry.roomName.trim()
  return `${entry.hostUsername}'s room`
}

export const RoomHistoryList = ({
  entries,
  onSelectActive,
  onSelectClosed,
}: RoomHistoryListProps) => {
  const handleActivate = (entry: RoomHistoryEntry) => {
    if (entry.isActive) {
      onSelectActive(entry)
      return
    }
    onSelectClosed(entry)
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    entry: RoomHistoryEntry
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleActivate(entry)
    }
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => {
        const title = getRoomTitle(entry)
        return (
          <li key={`${entry.roomId}-${entry.joinedAt}`}>
            <div
              role="button"
              tabIndex={0}
              className={cn(
                "glass-panel flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3",
                "text-[#f3eadc] hover:bg-white/5"
              )}
              aria-label={
                entry.isActive ? `Join ${title}` : `${title}, closed`
              }
              onClick={() => handleActivate(entry)}
              onKeyDown={(event) => handleKeyDown(event, entry)}
            >
              <Clock3Icon
                className="size-4 shrink-0 text-[#f3eadc]/45"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{title}</p>
                <p className="truncate text-xs text-[#f3eadc]/50">
                  Hosted by {entry.hostUsername} · joined{" "}
                  {formatJoinedAt(entry.joinedAt)}
                </p>
              </div>
              <Badge
                variant="outline"
                className={
                  entry.isActive
                    ? "border-amber-flame/40 text-amber-flame"
                    : "border-night-bordeaux/50 text-[#f3eadc]/55"
                }
              >
                {entry.isActive ? "Live" : "Closed"}
              </Badge>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
