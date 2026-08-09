"use client"

import { useState } from "react"
import { MoreVerticalIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type {
  ClientEventName,
  ClientToServerEvents,
  RoomParticipant,
} from "@/lib/room/types"

type ConfirmKind = "kick" | "ban" | "transfer" | null

type RoomParticipantListProps = {
  participants: RoomParticipant[]
  adminId: string
  selfId: string
  isAdmin: boolean
  emit: <K extends ClientEventName>(
    event: K,
    payload: ClientToServerEvents[K]
  ) => void
  className?: string
}

const getInitials = (name: string) => name.slice(0, 2).toUpperCase()

export const RoomParticipantList = ({
  participants,
  adminId,
  selfId,
  isAdmin,
  emit,
  className,
}: RoomParticipantListProps) => {
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null)
  const [target, setTarget] = useState<RoomParticipant | null>(null)

  const handleOpenConfirm = (
    kind: Exclude<ConfirmKind, null>,
    participant: RoomParticipant
  ) => {
    setTarget(participant)
    setConfirmKind(kind)
  }

  const handleConfirm = () => {
    if (!target || !confirmKind) return
    if (confirmKind === "kick") {
      emit("kick_user", { targetUserId: target.id })
    } else if (confirmKind === "ban") {
      emit("ban_user", { targetUserId: target.id })
    } else if (confirmKind === "transfer") {
      emit("transfer_admin", { targetUserId: target.id })
    }
    setConfirmKind(null)
    setTarget(null)
  }

  return (
    <div className={className}>
      <div className="border-b border-night-bordeaux/50 px-3 py-2">
        <p className="text-xs font-medium tracking-wide text-[#f3eadc]/70 uppercase">
          Participants ({participants.length})
        </p>
      </div>
      <ul className="max-h-40 overflow-y-auto sm:max-h-none" role="list">
        {participants.map((participant) => {
          const isSelf = participant.id === selfId
          const isTargetAdmin = participant.id === adminId
          const showMenu = isAdmin && !isSelf

          return (
            <li
              key={participant.id}
              className="flex items-center gap-2 border-b border-night-bordeaux/30 px-3 py-2 last:border-b-0"
            >
              <Avatar size="default" className="size-8 shrink-0">
                {participant.avatarUrl ? (
                  <AvatarImage src={participant.avatarUrl} alt="" />
                ) : null}
                <AvatarFallback className="bg-night-bordeaux text-[10px] text-[#f3eadc]">
                  {getInitials(participant.username)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate text-sm text-[#f3eadc]">
                    {participant.username}
                    {isSelf ? " (you)" : ""}
                  </span>
                  {isTargetAdmin ? (
                    <Badge className="bg-amber-flame/20 text-[10px] text-amber-flame">
                      Admin
                    </Badge>
                  ) : null}
                  {participant.role === "moderator" && !isTargetAdmin ? (
                    <Badge className="bg-night-bordeaux text-[10px] text-[#f3eadc]/70">
                      Mod
                    </Badge>
                  ) : null}
                </div>
              </div>

              {showMenu ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-[#f3eadc]/70 hover:bg-white/5 hover:text-[#f3eadc]"
                        aria-label={`Actions for ${participant.username}`}
                      />
                    }
                  >
                    <MoreVerticalIcon className="size-4" aria-hidden />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-48 border-night-bordeaux/50 bg-ink-black text-[#f3eadc]"
                  >
                    <DropdownMenuCheckboxItem
                      checked={participant.hasPlaybackControl}
                      onCheckedChange={(checked) =>
                        emit("grant_playback_control", {
                          targetUserId: participant.id,
                          granted: Boolean(checked),
                        })
                      }
                    >
                      Playback control
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={participant.muted}
                      onCheckedChange={(checked) =>
                        emit("mute_user", {
                          targetUserId: participant.id,
                          muted: Boolean(checked),
                        })
                      }
                    >
                      Mute mic
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator className="bg-night-bordeaux/40" />
                    <DropdownMenuItem
                      onClick={() => handleOpenConfirm("kick", participant)}
                    >
                      Kick
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-brick-ember focus:text-brick-ember"
                      onClick={() => handleOpenConfirm("ban", participant)}
                    >
                      Ban
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleOpenConfirm("transfer", participant)}
                    >
                      Transfer admin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </li>
          )
        })}
      </ul>

      <AlertDialog
        open={confirmKind !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmKind(null)
            setTarget(null)
          }
        }}
      >
        <AlertDialogContent className="border-night-bordeaux/50 bg-ink-black text-[#f3eadc]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmKind === "kick"
                ? `Kick ${target?.username}?`
                : confirmKind === "ban"
                  ? `Ban ${target?.username}?`
                  : `Make ${target?.username} admin?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#f3eadc]/60">
              {confirmKind === "kick"
                ? `Kick ${target?.username} from the room? They can rejoin unless you also ban them.`
                : confirmKind === "ban"
                  ? `Ban ${target?.username} from this room? They won't be able to rejoin, even with the room code.`
                  : `Make ${target?.username} the room admin? You'll lose admin controls immediately.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-night-bordeaux/50 bg-transparent text-[#f3eadc]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                confirmKind === "ban"
                  ? "bg-brick-ember text-white hover:bg-brick-ember/90"
                  : "bg-amber-flame text-ink-black hover:bg-[#e5a500]"
              }
              onClick={handleConfirm}
            >
              {confirmKind === "kick"
                ? "Kick"
                : confirmKind === "ban"
                  ? "Ban"
                  : "Transfer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
