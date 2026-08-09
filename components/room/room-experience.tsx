"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2Icon } from "lucide-react"

import { useNotifications } from "@/components/notifications/notification-provider"
import { RoomChat } from "@/components/room/room-chat"
import { RoomParticipantList } from "@/components/room/room-participant-list"
import { RoomRemovedGate } from "@/components/room/room-removed-gate"
import { RoomTopBar } from "@/components/room/room-top-bar"
import { RoomVideoPlayer } from "@/components/room/room-video-player"
import { RoomVoiceStrip } from "@/components/room/room-voice-strip"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRoomSocket } from "@/lib/room/use-room-socket"
import type { CurrentUser } from "@/lib/room/types"

type RoomExperienceProps = {
  roomUid: string
  currentUser: CurrentUser
}

export const RoomExperience = ({
  roomUid,
  currentUser,
}: RoomExperienceProps) => {
  const router = useRouter()
  const { notify } = useNotifications()
  const {
    status,
    errorMessage,
    roomState,
    participants,
    messages,
    playback,
    removalReason,
    emit,
    leave,
  } = useRoomSocket({ roomUid, currentUser })

  const prevAdminId = useRef<string | null>(null)
  const notifiedMute = useRef(false)

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
          Couldn’t join room
        </h1>
        <p className="mb-6 text-sm text-[#f3eadc]/60">
          {errorMessage ?? "Something went wrong."}
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
        roomName={roomState.name}
        participantCount={participants.length}
        isAdmin={isAdmin}
        onLeave={handleLeave}
      />

      {/* Desktop: video + sidebar */}
      <div className="hidden min-h-0 flex-1 sm:flex">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 p-3">
            <RoomVideoPlayer
              videoUrl={roomState.videoUrl}
              playback={playback}
              canControl={canControl}
              emit={emit}
            />
          </div>
          <RoomVoiceStrip
            participants={participants}
            selfId={currentUser.id}
            onToggleSelfMute={handleToggleSelfMute}
          />
        </div>
        <aside className="flex w-80 shrink-0 flex-col border-l border-night-bordeaux/50 bg-ink-black lg:w-96">
          {sidebar}
        </aside>
      </div>

      {/* Mobile: stacked + tabs */}
      <div className="flex min-h-0 flex-1 flex-col sm:hidden">
        <div className="shrink-0 p-2">
          <RoomVideoPlayer
            videoUrl={roomState.videoUrl}
            playback={playback}
            canControl={canControl}
            emit={emit}
          />
        </div>
        <RoomVoiceStrip
          participants={participants}
          selfId={currentUser.id}
          onToggleSelfMute={handleToggleSelfMute}
        />
        <Tabs defaultValue="chat" className="min-h-0 flex-1 px-2 pb-2">
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
    </div>
  )
}
