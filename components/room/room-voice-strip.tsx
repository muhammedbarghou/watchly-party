"use client"

import { MicOffIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RoomParticipant } from "@/lib/room/types"

type RoomVoiceStripProps = {
  participants: RoomParticipant[]
  selfId: string
  onToggleSelfMute: () => void
}

const getInitials = (name: string) => name.slice(0, 2).toUpperCase()

export const RoomVoiceStrip = ({
  participants,
  selfId,
  onToggleSelfMute,
}: RoomVoiceStripProps) => {
  const self = participants.find((p) => p.id === selfId)

  return (
    <div
      className="flex items-center gap-3 overflow-x-auto border-t border-night-bordeaux/40 px-3 py-2"
      role="group"
      aria-label="Voice chat"
    >
      {participants.map((participant) => {
        const isSelf = participant.id === selfId
        return (
          <div
            key={participant.id}
            className="relative flex shrink-0 flex-col items-center gap-1"
          >
            <div className="rounded-full p-0.5 shadow-[0_0_0_2px_transparent]">
              <Avatar size="default" className="size-9">
                {participant.avatarUrl ? (
                  <AvatarImage src={participant.avatarUrl} alt="" />
                ) : null}
                <AvatarFallback className="bg-night-bordeaux text-[10px] text-[#f3eadc]">
                  {getInitials(participant.username)}
                </AvatarFallback>
              </Avatar>
            </div>
            {participant.muted ? (
              <span
                className="absolute -right-0.5 top-0 rounded-full bg-ink-black p-0.5 text-brick-ember"
                aria-label="Muted"
              >
                <MicOffIcon className="size-3" aria-hidden />
              </span>
            ) : null}
            <span className="max-w-14 truncate text-[10px] text-[#f3eadc]/60">
              {isSelf ? "You" : participant.username}
            </span>
          </div>
        )
      })}

      {self ? (
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          className="ml-auto shrink-0 border-night-bordeaux/50 bg-transparent text-[#f3eadc]"
          onClick={onToggleSelfMute}
          disabled={self.mutedByAdmin && self.muted}
          aria-label={self.muted ? "Unmute microphone" : "Mute microphone"}
          title={
            self.mutedByAdmin && self.muted
              ? "Muted by admin"
              : self.muted
                ? "Unmute"
                : "Mute"
          }
        >
          <MicOffIcon
            className={cn("size-4", self.muted ? "text-brick-ember" : "opacity-50")}
            aria-hidden
          />
        </Button>
      ) : null}
    </div>
  )
}
