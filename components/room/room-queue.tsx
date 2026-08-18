"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  SkipForwardIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type {
  ClientEventName,
  ClientToServerEvents,
  QueueItem,
} from "@/lib/room/types"
import { cn } from "@/lib/utils"

type RoomQueueProps = {
  currentUrl: string
  queue: QueueItem[]
  canMutate: boolean
  emit: <K extends ClientEventName>(
    event: K,
    payload: ClientToServerEvents[K]
  ) => void
  className?: string
}

const displayUrl = (url: string): string => {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname === "/" ? "" : parsed.pathname
    return `${parsed.hostname}${path}`
  } catch {
    return url
  }
}

const isValidHttpUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export const RoomQueue = ({
  currentUrl,
  queue,
  canMutate,
  emit,
  className,
}: RoomQueueProps) => {
  const [draft, setDraft] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleAdd = (event?: FormEvent) => {
    event?.preventDefault()
    const url = draft.trim()
    if (!url) return
    if (!isValidHttpUrl(url)) {
      setErrorMessage("Enter a valid http(s) URL.")
      return
    }
    setErrorMessage(null)
    emit("queue_add", { url })
    setDraft("")
  }

  const handleMove = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= queue.length) return
    const moved = queue[index]
    if (!moved) return
    const itemIds = queue.map((item) => item.id)
    itemIds.splice(index, 1)
    itemIds.splice(nextIndex, 0, moved.id)
    emit("queue_reorder", { itemIds })
  }

  const handleNext = () => {
    emit("video_ended", {})
  }

  return (
    <section
      className={cn(
        "rounded-none border border-night-bordeaux/40 bg-night-bordeaux/20 sm:rounded-md",
        className
      )}
      aria-label="Video queue"
    >
      <div className="flex items-center justify-between gap-2 border-b border-night-bordeaux/40 px-3 py-2">
        <p className="text-xs font-medium tracking-wide text-[#f3eadc]/70 uppercase">
          Up next
        </p>
        {canMutate ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-[#f3eadc]/80 hover:bg-white/5 hover:text-[#f3eadc]"
            aria-label="Play next video"
            disabled={queue.length === 0}
            onClick={handleNext}
          >
            <SkipForwardIcon className="size-3.5" aria-hidden />
            Next
          </Button>
        ) : null}
      </div>

      <p className="truncate px-3 pt-2 text-xs text-[#f3eadc]/55">
        Now playing: {displayUrl(currentUrl)}
      </p>

      <ul
        className="max-h-28 overflow-y-auto px-1 py-1"
        role="list"
        aria-label="Upcoming videos"
      >
        {queue.length === 0 ? (
          <li className="px-2 py-2 text-xs text-[#f3eadc]/45">
            {canMutate
              ? "Add a URL to play next."
              : "No videos queued."}
          </li>
        ) : (
          queue.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-1 rounded-md px-2 py-1.5"
            >
              <span className="w-4 shrink-0 text-center text-[10px] text-[#f3eadc]/40">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-[#f3eadc]/85">
                {displayUrl(item.url)}
              </span>
              {canMutate ? (
                <div className="flex shrink-0 items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-[#f3eadc]/60 hover:bg-white/5 hover:text-[#f3eadc]"
                    aria-label={`Move ${displayUrl(item.url)} up`}
                    disabled={index === 0}
                    onClick={() => handleMove(index, -1)}
                  >
                    <ChevronUpIcon className="size-3.5" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-[#f3eadc]/60 hover:bg-white/5 hover:text-[#f3eadc]"
                    aria-label={`Move ${displayUrl(item.url)} down`}
                    disabled={index === queue.length - 1}
                    onClick={() => handleMove(index, 1)}
                  >
                    <ChevronDownIcon className="size-3.5" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-[#f3eadc]/60 hover:bg-white/5 hover:text-brick-ember"
                    aria-label={`Remove ${displayUrl(item.url)} from queue`}
                    onClick={() => emit("queue_remove", { itemId: item.id })}
                  >
                    <Trash2Icon className="size-3.5" aria-hidden />
                  </Button>
                </div>
              ) : null}
            </li>
          ))
        )}
      </ul>

      {canMutate ? (
        <form
          onSubmit={handleAdd}
          className="flex items-center gap-2 border-t border-night-bordeaux/40 px-3 py-2"
        >
          <Input
            type="url"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              if (errorMessage) setErrorMessage(null)
            }}
            placeholder="Paste a video URL to add to the queue"
            aria-label="Video URL to queue"
            aria-invalid={Boolean(errorMessage)}
            className="h-8 border-night-bordeaux/50 bg-ink-black text-[#f3eadc] placeholder:text-[#f3eadc]/35"
          />
          <Button
            type="submit"
            size="sm"
            className="h-8 shrink-0 bg-amber-flame px-3 text-ink-black hover:bg-[#e5a500]"
          >
            Add
          </Button>
        </form>
      ) : null}
      {errorMessage ? (
        <p className="px-3 pb-2 text-xs text-brick-ember" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  )
}
