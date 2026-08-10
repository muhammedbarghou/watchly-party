"use client"

import { useState } from "react"
import { UserPlusIcon } from "lucide-react"

import { useFriends } from "@/components/friends/friends-provider"
import { useNotifications } from "@/components/notifications/notification-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { RoomParticipant } from "@/lib/room/types"
import type { ClientEventName, ClientToServerEvents } from "@/lib/room/types"

type InviteFriendsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomUid: string
  participants: RoomParticipant[]
  emit: <K extends ClientEventName>(
    event: K,
    payload: ClientToServerEvents[K]
  ) => void
}

const getInitials = (name: string): string => name.slice(0, 2).toUpperCase()

export const InviteFriendsSheet = ({
  open,
  onOpenChange,
  roomUid,
  participants,
  emit,
}: InviteFriendsSheetProps) => {
  const { friends, isLoading } = useFriends()
  const { notify } = useNotifications()
  const [invitedIds, setInvitedIds] = useState<Set<string>>(() => new Set())

  const participantIds = new Set(participants.map((p) => p.id))
  const inviteable = friends.filter(
    (row) => !participantIds.has(row.otherUser.id)
  )

  const handleInvite = (targetUserId: string, username: string) => {
    emit("invite_to_room", { roomUid, targetUserId })
    setInvitedIds((prev) => new Set(prev).add(targetUserId))
    notify(`Invite sent to ${username}`)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="border-night-bordeaux/50 bg-ink-black text-[#f3eadc] sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle className="text-[#f3eadc]">Invite friends</SheetTitle>
          <SheetDescription className="text-[#f3eadc]/55">
            Send a one-tap join invite to friends who aren&apos;t in this room.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-2 px-1">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-[#f3eadc]/55">
              Loading friends…
            </p>
          ) : inviteable.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#f3eadc]/55">
              No friends available to invite right now.
            </p>
          ) : (
            inviteable.map((row) => {
              const alreadyInvited = invitedIds.has(row.otherUser.id)
              return (
                <div
                  key={row.id}
                  className="flex items-center gap-3 rounded-lg border border-night-bordeaux/40 px-3 py-2.5"
                >
                  <Avatar className="size-9">
                    {row.otherUser.avatarUrl ? (
                      <AvatarImage src={row.otherUser.avatarUrl} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-night-bordeaux text-[10px] text-[#f3eadc]">
                      {getInitials(row.otherUser.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#f3eadc]">
                      {row.otherUser.username}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={alreadyInvited ? "outline" : "default"}
                    className={
                      alreadyInvited
                        ? "border-night-bordeaux/50 text-[#f3eadc]/70"
                        : "bg-amber-flame text-ink-black hover:bg-[#e5a500]"
                    }
                    disabled={alreadyInvited}
                    onClick={() =>
                      handleInvite(row.otherUser.id, row.otherUser.username)
                    }
                    aria-label={
                      alreadyInvited
                        ? `Already invited ${row.otherUser.username}`
                        : `Invite ${row.otherUser.username}`
                    }
                  >
                    <UserPlusIcon className="size-3.5" aria-hidden />
                    {alreadyInvited ? "Invited" : "Invite"}
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
