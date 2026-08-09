"use client"

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { SendIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/room/types"

type RoomChatProps = {
  messages: ChatMessage[]
  selfId: string
  onSend: (text: string) => void
  className?: string
}

const getInitials = (name: string) => name.slice(0, 2).toUpperCase()

export const RoomChat = ({
  messages,
  selfId,
  onSend,
  className,
}: RoomChatProps) => {
  const [draft, setDraft] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)

  useEffect(() => {
    if (!stickToBottom.current) return
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  const handleScroll = () => {
    const el = listRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    stickToBottom.current = distance < 64
  }

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft("")
    stickToBottom.current = true
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          <p className="text-center text-xs text-[#f3eadc]/45">
            Chat is live for this session only. Say hello.
          </p>
        ) : (
          messages.map((message) => {
            const isSelf = message.userId === selfId
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  isSelf ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar size="default" className="size-7 shrink-0">
                  <AvatarFallback className="bg-night-bordeaux text-[10px] text-[#f3eadc]">
                    {getInitials(message.username)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-2.5 py-1.5 text-sm",
                    isSelf
                      ? "bg-amber-flame/15 text-[#f3eadc]"
                      : "bg-night-bordeaux/40 text-[#f3eadc]/90"
                  )}
                >
                  {!isSelf ? (
                    <p className="mb-0.5 text-[11px] font-medium text-amber-flame/90">
                      {message.username}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-end gap-2 border-t border-night-bordeaux/50 p-2"
      >
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message"
          rows={1}
          aria-label="Chat message"
          className="max-h-24 min-h-9 resize-none border-night-bordeaux/50 bg-ink-black text-[#f3eadc] placeholder:text-[#f3eadc]/35"
        />
        <Button
          type="submit"
          size="icon"
          className="shrink-0 bg-amber-flame text-ink-black hover:bg-[#e5a500]"
          aria-label="Send message"
          disabled={!draft.trim()}
        >
          <SendIcon className="size-4" aria-hidden />
        </Button>
      </form>
    </div>
  )
}
