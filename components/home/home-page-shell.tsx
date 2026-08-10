"use client"

import { useEffect, useState } from "react"
import { DoorOpenIcon, PlusIcon, UsersIcon } from "lucide-react"

import { useFriends } from "@/components/friends/friends-provider"
import { CreateRoomDialog } from "@/components/home/create-room-dialog"
import { JoinRoomDialog } from "@/components/home/join-room-dialog"
import { RoomCard, RoomCardSkeleton } from "@/components/home/room-card"
import { useNotifications } from "@/components/notifications/notification-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fetchMyRecentRooms } from "@/lib/home/rooms"
import type { RoomCardData } from "@/lib/home/types"

type HomePageShellProps = {
  displayName: string
  currentUser: {
    id: string
    username: string
    avatarUrl: string | null
  } | null
}

export const HomePageShell = ({
  displayName,
  currentUser,
}: HomePageShellProps) => {
  const { notify } = useNotifications()
  const { friendsLiveRooms, isLoading: isFriendsLoading } = useFriends()
  const [isLoading, setIsLoading] = useState(true)
  const [recentRooms, setRecentRooms] = useState<RoomCardData[]>([])
  const [requestedRoomIds, setRequestedRoomIds] = useState<Set<string>>(
    () => new Set()
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [closedDetailRoom, setClosedDetailRoom] = useState<RoomCardData | null>(
    null
  )
  const [requestRoom, setRequestRoom] = useState<RoomCardData | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadRecent = async () => {
      if (!currentUser) {
        if (!cancelled) {
          setRecentRooms([])
          setIsLoading(false)
        }
        return
      }

      const rooms = await fetchMyRecentRooms(currentUser)
      if (!cancelled) {
        setRecentRooms(rooms)
        setIsLoading(false)
      }
    }

    void loadRecent()
    return () => {
      cancelled = true
    }
  }, [currentUser])

  const handleCreated = (room: RoomCardData) => {
    setRecentRooms((prev) => [room, ...prev.filter((r) => r.id !== room.id)])
  }

  const handleRequestAccess = (room: RoomCardData) => {
    if (requestedRoomIds.has(room.id)) return
    setRequestRoom(room)
  }

  const handleConfirmRequest = () => {
    if (!requestRoom) return
    setRequestedRoomIds((prev) => new Set(prev).add(requestRoom.id))
    notify("Access request sent")
    setRequestRoom(null)
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <p className="mb-1 text-xs tracking-[0.2em] text-amber-flame uppercase">
          Home
        </p>
        <h1 className="font-serif text-3xl text-[#f3eadc] sm:text-4xl">
          Watch together
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#f3eadc]/60">
          Welcome back, {displayName}. Create a room or jump into one your
          friends already opened.
        </p>
      </div>

      <div className="mb-10 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          size="lg"
          className="h-11 w-full rounded-xl bg-amber-flame text-ink-black hover:bg-[#e5a500] sm:w-auto sm:min-w-44"
          onClick={() => setIsCreateOpen(true)}
          aria-label="Create room"
        >
          <PlusIcon />
          Create room
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-11 w-full rounded-xl border-night-bordeaux/60 text-[#f3eadc] hover:bg-white/5 sm:w-auto sm:min-w-44"
          onClick={() => setIsJoinOpen(true)}
          aria-label="Join room"
        >
          <DoorOpenIcon />
          Join room
        </Button>
      </div>

      <section aria-labelledby="friends-live-heading" className="mb-12">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2
            id="friends-live-heading"
            className="font-serif text-xl text-[#f3eadc]"
          >
            Friends watching now
          </h2>
          {!isLoading && !isFriendsLoading ? (
            <Badge
              variant="outline"
              className="border-amber-flame/40 text-amber-flame"
            >
              <span
                className="mr-1.5 inline-block size-1.5 rounded-full bg-brick-ember"
                aria-hidden
              />
              {friendsLiveRooms.length} live
            </Badge>
          ) : null}
        </div>

        {isLoading || isFriendsLoading ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
            <RoomCardSkeleton />
            <RoomCardSkeleton />
            <RoomCardSkeleton />
          </div>
        ) : friendsLiveRooms.length === 0 ? (
          <div className="glass-panel rounded-2xl px-6 py-10 text-center">
            <UsersIcon className="mx-auto mb-3 size-8 text-[#f3eadc]/40" />
            <p className="text-sm text-[#f3eadc]/70">
              No friends are hosting a live room right now.
            </p>
            <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <Button
                type="button"
                className="bg-amber-flame text-ink-black hover:bg-[#e5a500]"
                onClick={() => setIsCreateOpen(true)}
              >
                Create your own
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-night-bordeaux/50 text-[#f3eadc]"
                disabled
              >
                Invite friends
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
            {friendsLiveRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                variant="friends"
                accessRequested={requestedRoomIds.has(room.id)}
                onRequestAccess={handleRequestAccess}
              />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="recent-rooms-heading">
        <h2
          id="recent-rooms-heading"
          className="font-serif mb-4 text-xl text-[#f3eadc]"
        >
          Your recent rooms
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
            <RoomCardSkeleton />
            <RoomCardSkeleton />
          </div>
        ) : recentRooms.length === 0 ? (
          <div className="glass-panel rounded-2xl px-6 py-10 text-center">
            <p className="text-sm text-[#f3eadc]/70">
              You haven&apos;t created a room yet. Start one and it will show up
              here.
            </p>
            <Button
              type="button"
              className="mt-4 bg-amber-flame text-ink-black hover:bg-[#e5a500]"
              onClick={() => setIsCreateOpen(true)}
            >
              Create room
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
            {recentRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                variant="recent"
                onSelectClosed={setClosedDetailRoom}
              />
            ))}
          </div>
        )}
      </section>

      <CreateRoomDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleCreated}
      />
      <JoinRoomDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />

      <Dialog
        open={Boolean(requestRoom)}
        onOpenChange={(open) => {
          if (!open) setRequestRoom(null)
        }}
      >
        <DialogContent className="border-night-bordeaux/50 bg-ink-black text-[#f3eadc] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#f3eadc]">Request access</DialogTitle>
            <DialogDescription className="text-[#f3eadc]/55">
              {requestRoom
                ? `Ask ${requestRoom.host.username} for access to ${
                    requestRoom.name?.trim() ||
                    `${requestRoom.host.username}'s room`
                  }.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-night-bordeaux/40 bg-transparent">
            <Button
              type="button"
              variant="outline"
              className="border-night-bordeaux/50 text-[#f3eadc]"
              onClick={() => setRequestRoom(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-amber-flame text-ink-black hover:bg-[#e5a500]"
              onClick={handleConfirmRequest}
            >
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(closedDetailRoom)}
        onOpenChange={(open) => {
          if (!open) setClosedDetailRoom(null)
        }}
      >
        <DialogContent className="border-night-bordeaux/50 bg-ink-black text-[#f3eadc] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#f3eadc]">
              {closedDetailRoom?.name?.trim() || "Closed room"}
            </DialogTitle>
            <DialogDescription className="text-[#f3eadc]/55">
              {closedDetailRoom
                ? `This room is closed. Created by you${
                    closedDetailRoom.closedAt
                      ? ` · closed ${new Date(
                          closedDetailRoom.closedAt
                        ).toLocaleDateString()}`
                      : ""
                  }.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-night-bordeaux/40 bg-transparent">
            <Button
              type="button"
              className="bg-amber-flame text-ink-black hover:bg-[#e5a500]"
              onClick={() => setClosedDetailRoom(null)}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
