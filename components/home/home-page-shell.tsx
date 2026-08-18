"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DoorOpenIcon, PlusIcon, RadioIcon, UsersIcon } from "lucide-react"

import { useFriends } from "@/components/friends/friends-provider"
import { CreateRoomDialog } from "@/components/home/create-room-dialog"
import { JoinRoomDialog } from "@/components/home/join-room-dialog"
import { RoomCard, RoomCardSkeleton } from "@/components/home/room-card"
import { RoomHistoryList } from "@/components/home/room-history-list"
import { useAppSocket } from "@/components/notifications/app-socket-provider"
import { useNotifications } from "@/components/notifications/notification-provider"
import { usePreferences } from "@/components/settings/preferences-provider"
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
import { fetchRoomHistory, type RoomHistoryEntry } from "@/lib/home/room-history"
import { fetchMyRecentRooms, fetchPublicLiveRooms } from "@/lib/home/rooms"
import type { RoomCardData } from "@/lib/home/types"
import { createClient } from "@/lib/supabase/client"
import type { RoomSocket } from "@/lib/socket"

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
  const { emit, subscribe } = useAppSocket()
  const { preferences } = usePreferences()
  const { friendsLiveRooms, isLoading: isFriendsLoading } = useFriends()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [recentRooms, setRecentRooms] = useState<RoomCardData[]>([])
  const [publicRooms, setPublicRooms] = useState<RoomCardData[]>([])
  const [liveCounts, setLiveCounts] = useState<Map<string, number>>(
    () => new Map()
  )
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(true)
  const [joinedHistory, setJoinedHistory] = useState<RoomHistoryEntry[]>([])
  const [requestedRoomIds, setRequestedRoomIds] = useState<Set<string>>(
    () => new Set()
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [closedDetailRoom, setClosedDetailRoom] = useState<RoomCardData | null>(
    null
  )
  const [closedHistoryEntry, setClosedHistoryEntry] =
    useState<RoomHistoryEntry | null>(null)
  const [requestRoom, setRequestRoom] = useState<RoomCardData | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadRecent = async () => {
      if (!currentUser) {
        if (!cancelled) {
          setRecentRooms([])
          setJoinedHistory([])
          setIsLoading(false)
        }
        return
      }

      const [rooms, history] = await Promise.all([
        fetchMyRecentRooms(currentUser),
        fetchRoomHistory(),
      ])
      if (!cancelled) {
        setRecentRooms(rooms)
        setJoinedHistory(history)
        setIsLoading(false)
      }
    }

    void loadRecent()
    return () => {
      cancelled = true
    }
  }, [currentUser])

  useEffect(() => {
    let cancelled = false

    const loadDiscover = async () => {
      const rooms = await fetchPublicLiveRooms()
      if (!cancelled) {
        setPublicRooms(rooms)
        setIsDiscoverLoading(false)
      }
    }

    void loadDiscover()

    const supabase = createClient()
    const channel = supabase
      .channel("public-rooms-discover")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
        },
        () => {
          void loadDiscover()
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    let activeSocket: RoomSocket | null = null

    const handleSnapshot = (payload: {
      rooms: { roomUid: string; participantCount: number }[]
    }) => {
      const next = new Map<string, number>()
      for (const room of payload.rooms) {
        next.set(room.roomUid, room.participantCount)
      }
      setLiveCounts(next)
    }

    const handleCount = (payload: {
      roomUid: string
      participantCount: number
    }) => {
      setLiveCounts((prev) => {
        const next = new Map(prev)
        if (payload.participantCount <= 0) {
          next.delete(payload.roomUid)
        } else {
          next.set(payload.roomUid, payload.participantCount)
        }
        return next
      })
    }

    const requestCounts = (socket: RoomSocket) => {
      socket.emit("get_public_room_counts", {})
    }

    const handleConnect = () => {
      if (activeSocket) requestCounts(activeSocket)
    }

    const unsubscribe = subscribe((socket) => {
      if (activeSocket === socket) {
        if (socket.connected) requestCounts(socket)
        return
      }

      if (activeSocket) {
        activeSocket.off("public_room_counts", handleSnapshot)
        activeSocket.off("public_room_count", handleCount)
        activeSocket.off("connect", handleConnect)
      }

      activeSocket = socket
      socket.on("public_room_counts", handleSnapshot)
      socket.on("public_room_count", handleCount)
      socket.on("connect", handleConnect)
      if (socket.connected) requestCounts(socket)
    })

    return () => {
      unsubscribe()
      if (activeSocket) {
        activeSocket.off("public_room_counts", handleSnapshot)
        activeSocket.off("public_room_count", handleCount)
        activeSocket.off("connect", handleConnect)
      }
    }
  }, [subscribe])

  const handleCreated = (room: RoomCardData) => {
    setRecentRooms((prev) => [room, ...prev.filter((r) => r.id !== room.id)])
    if (room.visibility === "public" && room.status === "active") {
      setPublicRooms((prev) => [room, ...prev.filter((r) => r.id !== room.id)])
    }
  }

  const handleRequestAccess = (room: RoomCardData) => {
    if (requestedRoomIds.has(room.id)) return
    setRequestRoom(room)
  }

  const handleConfirmRequest = () => {
    if (!requestRoom) return
    setIsRequesting(true)
    const ok = emit("request_access", { roomUid: requestRoom.uid })
    setIsRequesting(false)
    if (!ok) {
      notify("Not connected — try again in a moment.")
      return
    }
    setRequestedRoomIds((prev) => new Set(prev).add(requestRoom.id))
    notify("Access request sent")
    setRequestRoom(null)
  }

  const discoverRooms = publicRooms.map((room) => ({
    ...room,
    participantCount: liveCounts.get(room.uid) ?? room.participantCount,
  }))

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
          Welcome back, {displayName}. Create a room or jump into one that is
          already open — including public rooms in Discover.
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

      <section aria-labelledby="discover-heading" className="mb-12">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2
            id="discover-heading"
            className="font-serif text-xl text-[#f3eadc]"
          >
            Discover
          </h2>
          {!isDiscoverLoading ? (
            <Badge
              variant="outline"
              className="border-amber-flame/40 text-amber-flame"
            >
              <span
                className="mr-1.5 inline-block size-1.5 rounded-full bg-brick-ember"
                aria-hidden
              />
              {discoverRooms.length} public
            </Badge>
          ) : null}
        </div>

        {isDiscoverLoading ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
            <RoomCardSkeleton />
            <RoomCardSkeleton />
            <RoomCardSkeleton />
          </div>
        ) : discoverRooms.length === 0 ? (
          <div className="glass-panel rounded-2xl px-6 py-10 text-center">
            <RadioIcon className="mx-auto mb-3 size-8 text-[#f3eadc]/40" />
            <p className="text-sm text-[#f3eadc]/70">
              No public rooms are open right now. Create one so anyone signed in
              can join.
            </p>
            <Button
              type="button"
              className="mt-4 bg-amber-flame text-ink-black hover:bg-[#e5a500]"
              onClick={() => setIsCreateOpen(true)}
            >
              Create a public room
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
            {discoverRooms.map((room) => (
              <RoomCard key={room.id} room={room} variant="public" />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="recent-rooms-heading" className="mb-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2
            id="recent-rooms-heading"
            className="font-serif text-xl text-[#f3eadc]"
          >
            Your recent rooms
          </h2>
          <Button
            type="button"
            variant="ghost"
            className="text-[#f3eadc]/70 hover:bg-white/5 hover:text-[#f3eadc]"
            render={<Link href="/rooms" />}
            aria-label="Manage your rooms"
          >
            Manage
          </Button>
        </div>

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

      <section aria-labelledby="joined-rooms-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2
            id="joined-rooms-heading"
            className="font-serif text-xl text-[#f3eadc]"
          >
            Recently joined
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            <div className="glass-panel h-16 rounded-xl" />
            <div className="glass-panel h-16 rounded-xl" />
          </div>
        ) : joinedHistory.length === 0 ? (
          <div className="glass-panel rounded-2xl px-6 py-10 text-center">
            <p className="text-sm text-[#f3eadc]/70">
              Rooms you join will show up here, even after they close.
            </p>
          </div>
        ) : (
          <RoomHistoryList
            entries={joinedHistory}
            onSelectActive={(entry) => router.push(`/room/${entry.roomUid}`)}
            onSelectClosed={setClosedHistoryEntry}
          />
        )}
      </section>

      <CreateRoomDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleCreated}
        defaultIsPrivate={preferences.defaultRoomPrivate}
        defaultVisibleToFriends={preferences.defaultVisibleToFriends}
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
              disabled={isRequesting}
            >
              {isRequesting ? "Sending…" : "Send request"}
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

      <Dialog
        open={Boolean(closedHistoryEntry)}
        onOpenChange={(open) => {
          if (!open) setClosedHistoryEntry(null)
        }}
      >
        <DialogContent className="border-night-bordeaux/50 bg-ink-black text-[#f3eadc] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#f3eadc]">
              {closedHistoryEntry?.roomName?.trim() || "Closed room"}
            </DialogTitle>
            <DialogDescription className="text-[#f3eadc]/55">
              {closedHistoryEntry
                ? `This room is closed. Hosted by ${closedHistoryEntry.hostUsername}.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-night-bordeaux/40 bg-transparent">
            <Button
              type="button"
              className="bg-amber-flame text-ink-black hover:bg-[#e5a500]"
              onClick={() => setClosedHistoryEntry(null)}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
