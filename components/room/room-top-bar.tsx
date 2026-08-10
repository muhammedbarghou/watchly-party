"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CheckIcon,
  CopyIcon,
  LogOutIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"
import Image from "next/image"

import { NotificationBell } from "@/components/notifications/notification-bell"
import { useNotifications } from "@/components/notifications/notification-provider"
import { InviteFriendsSheet } from "@/components/room/invite-friends-sheet"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { PendingAccessRequest } from "@/lib/room/use-room-socket"
import type {
  ClientEventName,
  ClientToServerEvents,
  RoomParticipant,
} from "@/lib/room/types"

type RoomTopBarProps = {
  roomUid: string
  roomName: string | null
  participantCount: number
  isAdmin: boolean
  participants: RoomParticipant[]
  pendingAccessRequests: PendingAccessRequest[]
  onLeave: () => void
  emit: <K extends ClientEventName>(
    event: K,
    payload: ClientToServerEvents[K]
  ) => void
  onClearPendingAccess: (userId: string) => void
}

const getInitials = (name: string): string => name.slice(0, 2).toUpperCase()

export const RoomTopBar = ({
  roomUid,
  roomName,
  participantCount,
  isAdmin,
  participants,
  pendingAccessRequests,
  onLeave,
  emit,
  onClearPendingAccess,
}: RoomTopBarProps) => {
  const { notify, pushInboxNotification, removeInboxById } = useNotifications()
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleLeaveClick = () => {
    if (isAdmin) {
      setLeaveOpen(true)
      return
    }
    onLeave()
  }

  const handleConfirmLeave = () => {
    setLeaveOpen(false)
    onLeave()
  }

  const handleCopyUid = async () => {
    try {
      await navigator.clipboard.writeText(roomUid)
      setCopied(true)
      notify("Room code copied")
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      notify("Could not copy room code")
    }
  }

  const handleApprove = (request: PendingAccessRequest) => {
    emit("approve_access", { roomUid, targetUserId: request.userId })
    onClearPendingAccess(request.userId)
    removeInboxById(`access-${roomUid}-${request.userId}`)
    notify(`Approved ${request.username}`)
  }

  const handleDeny = (request: PendingAccessRequest) => {
    emit("deny_access", { roomUid, targetUserId: request.userId })
    onClearPendingAccess(request.userId)
    removeInboxById(`access-${roomUid}-${request.userId}`)
    notify(`Denied ${request.username}`)
  }

  // Keep inbox in sync when pending arrives via room socket only
  const syncAccessToInbox = (request: PendingAccessRequest) => {
    pushInboxNotification({
      id: `access-${roomUid}-${request.userId}`,
      type: "access_request",
      title: "Access request",
      body: `${request.username} wants to join this room`,
      actorUsername: request.username,
      actorAvatarUrl: request.avatarUrl,
      roomUid,
      fromUserId: request.userId,
    })
  }

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-night-bordeaux/50 bg-ink-black/95 px-2 sm:gap-3 sm:px-4">
        <Link
          href="/home-page"
          className="shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-amber-flame/60"
          aria-label="Watchly home"
        >
          <Image
            src="/Logo/Logo.png"
            alt="Watchly"
            width={100}
            height={36}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-[#f3eadc]">
            <span className="font-medium">
              {roomName?.trim() || "Untitled room"}
            </span>
            <span className="mx-2 text-[#f3eadc]/35">·</span>
            <span className="text-xs tracking-wide text-brick-ember uppercase">
              LIVE
            </span>
          </p>
        </div>

        <div
          className="hidden items-center gap-1.5 text-xs text-[#f3eadc]/70 sm:flex"
          aria-label={`${participantCount} participants`}
        >
          <UsersIcon className="size-3.5" aria-hidden />
          <span>{participantCount}</span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-[#f3eadc]/80 hover:bg-white/5 hover:text-[#f3eadc]"
          onClick={() => void handleCopyUid()}
          aria-label="Copy room code"
          title="Copy room code"
        >
          {copied ? (
            <CheckIcon className="size-4 text-amber-flame" aria-hidden />
          ) : (
            <CopyIcon className="size-4" aria-hidden />
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-[#f3eadc]/80 hover:bg-white/5 hover:text-[#f3eadc]"
          onClick={() => setInviteOpen(true)}
          aria-label="Invite friends"
          title="Invite friends"
        >
          <UserPlusIcon className="size-4" aria-hidden />
        </Button>

        {isAdmin && pendingAccessRequests.length > 0 ? (
          <Popover
            onOpenChange={(open) => {
              if (open) {
                pendingAccessRequests.forEach(syncAccessToInbox)
              }
            }}
          >
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="relative text-[#f3eadc]/80 hover:bg-white/5"
                  aria-label={`${pendingAccessRequests.length} access requests`}
                />
              }
            >
              <UsersIcon className="size-4" aria-hidden />
              <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-amber-flame px-1 text-[10px] text-ink-black">
                {pendingAccessRequests.length}
              </Badge>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-72 border-night-bordeaux/50 bg-ink-black p-3 text-[#f3eadc]"
            >
              <PopoverHeader className="mb-2">
                <PopoverTitle className="text-sm text-[#f3eadc]">
                  Access requests
                </PopoverTitle>
              </PopoverHeader>
              <ul className="flex flex-col gap-2">
                {pendingAccessRequests.map((request) => (
                  <li
                    key={request.userId}
                    className="flex items-center gap-2 rounded-md border border-night-bordeaux/40 px-2 py-2"
                  >
                    <Avatar className="size-7">
                      {request.avatarUrl ? (
                        <AvatarImage src={request.avatarUrl} alt="" />
                      ) : null}
                      <AvatarFallback className="bg-night-bordeaux text-[9px] text-[#f3eadc]">
                        {getInitials(request.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1 truncate text-xs">
                      {request.username}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 bg-amber-flame px-2 text-[11px] text-ink-black hover:bg-[#e5a500]"
                      onClick={() => handleApprove(request)}
                      aria-label={`Approve ${request.username}`}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 border-night-bordeaux/50 px-2 text-[11px] text-[#f3eadc]"
                      onClick={() => handleDeny(request)}
                      aria-label={`Deny ${request.username}`}
                    >
                      No
                    </Button>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        ) : null}

        <NotificationBell />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-night-bordeaux/60 bg-transparent text-[#f3eadc] hover:bg-night-bordeaux/40"
          onClick={handleLeaveClick}
          aria-label="Leave room"
        >
          <LogOutIcon className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Leave</span>
        </Button>
      </header>

      <InviteFriendsSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        roomUid={roomUid}
        participants={participants}
        emit={emit}
      />

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent className="border-night-bordeaux/50 bg-ink-black text-[#f3eadc]">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave as admin?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#f3eadc]/60">
              You can transfer admin to someone else first for a smoother
              handoff. If you leave now, the room will auto-promote another
              participant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-night-bordeaux/50 bg-transparent text-[#f3eadc]">
              Stay
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-flame text-ink-black hover:bg-[#e5a500]"
              onClick={handleConfirmLeave}
            >
              Leave anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
