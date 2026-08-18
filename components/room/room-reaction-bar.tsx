"use client"

import { useRef } from "react"

import { REACTION_DEBOUNCE_MS, REACTION_EMOJIS } from "@/lib/room/reactions"
import type { ClientEventName, ClientToServerEvents } from "@/lib/room/types"
import { cn } from "@/lib/utils"

type RoomReactionBarProps = {
  emit: <K extends ClientEventName>(
    event: K,
    payload: ClientToServerEvents[K]
  ) => void
  className?: string
}

export const RoomReactionBar = ({ emit, className }: RoomReactionBarProps) => {
  const lastSentAt = useRef(0)

  const handleReact = (emoji: string) => {
    const now = Date.now()
    if (now - lastSentAt.current < REACTION_DEBOUNCE_MS) return
    lastSentAt.current = now
    emit("send_reaction", { emoji })
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-md border border-night-bordeaux/40 bg-night-bordeaux/30 px-2 py-1",
        className
      )}
      role="toolbar"
      aria-label="Emoji reactions"
    >
      {REACTION_EMOJIS.map(({ emoji, label }) => (
        <button
          key={emoji}
          type="button"
          className="flex size-9 items-center justify-center rounded-md text-lg transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-amber-flame/70 focus-visible:outline-none"
          aria-label={`React with ${label}`}
          tabIndex={0}
          onClick={() => handleReact(emoji)}
        >
          <span aria-hidden>{emoji}</span>
        </button>
      ))}
    </div>
  )
}
