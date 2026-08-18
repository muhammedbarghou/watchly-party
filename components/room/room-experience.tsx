"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2Icon } from "lucide-react"

import { useNotifications } from "@/components/notifications/notification-provider"
import { RoomChat } from "@/components/room/room-chat"
import { RoomParticipantList } from "@/components/room/room-participant-list"
import { RoomQueue } from "@/components/room/room-queue"
import { RoomReactionBar } from "@/components/room/room-reaction-bar"
import { RoomRemovedGate } from "@/components/room/room-removed-gate"
import { RoomTopBar } from "@/components/room/room-top-bar"
import { RoomVideoPlayer } from "@/components/room/room-video-player"
import { RoomVoiceStrip } from "@/components/room/room-voice-strip"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { messageForRoomError } from "@/lib/room/error-messages"
import { useRoomSocket } from "@/lib/room/use-room-socket"
import { useVoiceChat } from "@/lib/room/use-voice-chat"
import type { CurrentUser } from "@/lib/room/types"

type RoomExperienceProps = {
  roomUid: string
  currentUser: CurrentUser
  joinVoiceMuted?: boolean
}

const titleForErrorCode = (code: string | null): string => {
  switch (code) {
    case "NOT_FOUND":
    case "ROOM_NOT_FOUND":
      return "Room not found"
    case "BAD_PASSWORD":
    case "INVALID_PASSWORD":
      return "Password required"
    case "BANNED":
      return "Banned from this room"
    case "FORBIDDEN":
    case "NOT_AUTHORIZED":
      return "Not authorized"
    case "ROOM_FULL":
      return "Room is full"
    case "ROOM_CLOSED":
      return "Room closed"
    case "RATE_LIMITED":
      return "Too many attempts"
    default:
      return "Couldn't join room"
  }
}

export const RoomExperience = ({
  roomUid,
  currentUser,
  joinVoiceMuted = false,
}: RoomExperienceProps) => {
  const router = useRouter()
  const { notify, pushInboxNotification } = useNotifications()
  const {
    status,
    errorMessage,
    errorCode,
    roomState,
    participants,
    messages,
    reactions,
    playback,
    removalReason,
    pendingAccessRequests,
    inRoomNotice,
    socket,
    emit,
    leave,
    clearPendingAccess,
  } = useRoomSocket({ roomUid, currentUser })

  const selfParticipant = participants.find((p) => p.id === currentUser.id)
  const selfMuted = Boolean(selfParticipant?.muted)

  useVoiceChat({
    socket,
    selfId: currentUser.id,
    participants,
    selfMuted,
    enabled: status === "joined" && Boolean(roomState),
    onMicDenied: () => {
      notify("Microphone access denied — voice chat is unavailable")
    },
  })

  const prevAdminId = useRef<string | null>(null)
  const notifiedMute = useRef(false)
  const appliedJoinMute = useRef(false)

  useEffect(() => {
    if (!joinVoiceMuted || appliedJoinMute.current) return
    if (status !== "joined" || !selfParticipant) return
    if (selfParticipant.muted) {
      appliedJoinMute.current = true
      return
    }
    emit("self_mute", { muted: true })
    appliedJoinMute.current = true
  }, [joinVoiceMuted, status, selfParticipant, emit])

  useEffect(() => {
    for (const request of pendingAccessRequests) {
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
  }, [pendingAccessRequests, pushInboxNotification, roomUid])

  useEffect(() => {
    if (!roomState) return

    if (
      prevAdminId.current &&
      prevAdminId.current !== roomState.adminId
    ) {
      if (roomState.adminId === currentUser.id) {
        notify("You are now the room admin")
      } else {
        const next = roomState.participants.find(
          (p) => p.id === roomState.adminId
        )
        notify(
          next
            ? `${next.username} is now the room admin`
            : "Admin role transferred"
        )
      }
    }
    prevAdminId.current = roomState.adminId
  }, [roomState, currentUser.id, notify])

  useEffect(() => {
    const self = participants.find((p) => p.id === currentUser.id)
    if (!self) return
    if (self.mutedByAdmin && self.muted) {
      if (!notifiedMute.current) {
        notify("The admin muted your mic")
        notifiedMute.current = true
      }
    } else {
      notifiedMute.current = false
    }
  }, [participants, currentUser.id, notify])

  const prevGrant = useRef<boolean | null>(null)
  useEffect(() => {
    const self = participants.find((p) => p.id === currentUser.id)
    if (!self) return
    if (prevGrant.current === null) {
      prevGrant.current = self.hasPlaybackControl
      return
    }
    if (prevGrant.current !== self.hasPlaybackControl) {
      notify(
        self.hasPlaybackControl
          ? "You were granted playback control"
          : "Playback control was revoked"
      )
      prevGrant.current = self.hasPlaybackControl
    }
  }, [participants, currentUser.id, notify])

  const prevQueueGrant = useRef<boolean | null>(null)
  useEffect(() => {
    const self = participants.find((p) => p.id === currentUser.id)
    if (!self) return
    if (prevQueueGrant.current === null) {
      prevQueueGrant.current = self.hasQueueControl
      return
    }
    if (prevQueueGrant.current !== self.hasQueueControl) {
      notify(
        self.hasQueueControl
          ? "You were granted queue control"
          : "Queue control was revoked"
      )
      prevQueueGrant.current = self.hasQueueControl
    }
  }, [participants, currentUser.id, notify])

  useEffect(() => {
    if (!inRoomNotice) return
    notify(inRoomNotice.message)
  }, [inRoomNotice, notify])

  const handleLeave = () => {
    leave()
    router.push("/home-page")
  }

  const handleSendChat = (text: string) => {
    emit("chat_message", { text })
  }

  const handleToggleSelfMute = () => {
    const self = participants.find((p) => p.id === currentUser.id)
    if (!self) return
    emit("self_mute", { muted: !self.muted })
  }

  if (status === "removed") {
    return <RoomRemovedGate reason={removalReason} />
  }

  if (status === "connecting" || (status === "joined" && !roomState)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6">
        <Loader2Icon
          className="size-8 animate-spin text-amber-flame"
          aria-hidden
        />
        <p className="text-sm text-[#f3eadc]/70">Joining room…</p>
      </main>
    )
  }

  if (status === "error" || !roomState || !playback) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif mb-2 text-2xl text-[#f3eadc]">
          {titleForErrorCode(errorCode)}
        </h1>
        <p className="mb-6 text-sm text-[#f3eadc]/60">
          {errorMessage ??
            messageForRoomError(errorCode ?? "", "Something went wrong.")}
        </p>
        <Button
          className="rounded-xl bg-amber-flame text-ink-black hover:bg-[#e5a500]"
          render={<Link href="/home-page" />}
        >
          Back to home
        </Button>
      </main>
    )
  }

  const isAdmin = roomState.adminId === currentUser.id
  const self = participants.find((p) => p.id === currentUser.id)
  const canControl =
    isAdmin || Boolean(self?.hasPlaybackControl)
  const canMutateQueue =
    isAdmin || Boolean(self?.hasQueueControl)

  const sidebar = (
    <>
      <RoomParticipantList
        participants={participants}
        adminId={roomState.adminId}
        selfId={currentUser.id}
        isAdmin={isAdmin}
        emit={emit}
        className="shrink-0 border-b border-night-bordeaux/50"
      />
      <RoomChat
        messages={messages}
        selfId={currentUser.id}
        onSend={handleSendChat}
        className="min-h-0 flex-1"
      />
    </>
  )

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-ink-black text-[#f3eadc]">
      <RoomTopBar
        roomUid={roomUid}
        roomName={roomState.name}
        participantCount={participants.length}
        isAdmin={isAdmin}
        participants={participants}
        pendingAccessRequests={pendingAccessRequests}
        onLeave={handleLeave}
        emit={emit}
        onClearPendingAccess={clearPendingAccess}
      />

      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto sm:overflow-hidden">
            <div className="min-h-[12rem] flex-1 p-2 sm:min-h-0 sm:p-3">
              <RoomVideoPlayer
                videoUrl={roomState.videoUrl}
                playback={playback}
                canControl={canControl}
                reactions={reactions}
                emit={emit}
              />
            </div>
            <div className="shrink-0 space-y-2 px-2 pb-2 sm:px-3">
              <RoomReactionBar emit={emit} />
              <RoomQueue
                currentUrl={roomState.videoUrl}
                queue={roomState.queue ?? []}
                canMutate={canMutateQueue}
                emit={emit}
              />
            </div>
          </div>
          <RoomVoiceStrip
            participants={participants}
            selfId={currentUser.id}
            onToggleSelfMute={handleToggleSelfMute}
          />
          <Tabs
            defaultValue="chat"
            className="min-h-0 flex-1 px-2 pb-2 sm:hidden"
          >
            <TabsList className="w-full bg-night-bordeaux/40">
              <TabsTrigger value="chat" className="flex-1">
                Chat
              </TabsTrigger>
              <TabsTrigger value="people" className="flex-1">
                People
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="chat"
              className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-night-bordeaux/40"
            >
              <RoomChat
                messages={messages}
                selfId={currentUser.id}
                onSend={handleSendChat}
                className="min-h-[40vh] flex-1"
              />
            </TabsContent>
            <TabsContent
              value="people"
              className="mt-2 overflow-hidden rounded-lg border border-night-bordeaux/40"
            >
              <RoomParticipantList
                participants={participants}
                adminId={roomState.adminId}
                selfId={currentUser.id}
                isAdmin={isAdmin}
                emit={emit}
              />
            </TabsContent>
          </Tabs>
        </div>
        <aside className="hidden w-80 shrink-0 flex-col border-l border-night-bordeaux/50 bg-ink-black sm:flex lg:w-96">
          {sidebar}
        </aside>
      </div>
    </div>
  )
}
