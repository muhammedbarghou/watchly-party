"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { DoorOpenIcon, Trash2Icon } from "lucide-react"

import { useNotifications } from "@/components/notifications/notification-provider"
import { RoomCardSkeleton } from "@/components/home/room-card"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { deleteRoomAction } from "@/lib/home/delete-room"
import { fetchMyRecentRooms } from "@/lib/home/rooms"
import type { RoomCardData } from "@/lib/home/types"

type MyRoomsPageShellProps = {
  currentUser: {
    id: string
    username: string
    avatarUrl: string | null
  }
}

export const MyRoomsPageShell = ({ currentUser }: MyRoomsPageShellProps) => {
  const { notify } = useNotifications()
  const [rooms, setRooms] = useState<RoomCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<RoomCardData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadRooms = useCallback(async () => {
    setIsLoading(true)
    const next = await fetchMyRecentRooms(currentUser)
    setRooms(next)
    setIsLoading(false)
  }, [currentUser])

  useEffect(() => {
    void loadRooms()
  }, [loadRooms])

  const activeCount = rooms.filter((room) => room.status === "active").length

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await deleteRoomAction(deleteTarget.id)
    setIsDeleting(false)

    if (!result.ok) {
      notify(result.error)
      return
    }

    setRooms((prev) => prev.filter((room) => room.id !== deleteTarget.id))
    notify(
      deleteTarget.name?.trim()
        ? `Deleted “${deleteTarget.name.trim()}”`
        : "Room deleted"
    )
    setDeleteTarget(null)
  }

  const getTitle = (room: RoomCardData) =>
    room.name?.trim() || `${room.host.username}'s room`

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <p className="mb-1 text-xs tracking-[0.2em] text-amber-flame uppercase">
          Rooms
        </p>
        <h1 className="font-serif text-3xl text-[#f3eadc] sm:text-4xl">
          Your rooms
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#f3eadc]/60">
          Manage rooms you created. Delete ones you no longer need — active
          rooms stop showing as live for friends once you leave or delete them.
        </p>
        {!isLoading ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="border-amber-flame/40 text-amber-flame"
            >
              {activeCount} live
            </Badge>
            <Badge
              variant="outline"
              className="border-night-bordeaux/50 text-[#f3eadc]/70"
            >
              {rooms.length} total
            </Badge>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
          <RoomCardSkeleton />
          <RoomCardSkeleton />
          <RoomCardSkeleton />
        </div>
      ) : rooms.length === 0 ? (
        <div className="glass-panel rounded-2xl px-6 py-10 text-center">
          <DoorOpenIcon className="mx-auto mb-3 size-8 text-[#f3eadc]/40" />
          <p className="text-sm text-[#f3eadc]/70">
            You haven&apos;t created any rooms yet.
          </p>
          <Button
            type="button"
            className="mt-4 bg-amber-flame text-ink-black hover:bg-[#e5a500]"
            render={<Link href="/home-page" />}
            aria-label="Go home to create a room"
          >
            Create a room
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {rooms.map((room) => {
            const title = getTitle(room)
            const isLive = room.status === "active"

            return (
              <li
                key={room.id}
                className="glass-panel flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-[#f3eadc]">
                      {title}
                    </p>
                    {isLive ? (
                      <Badge className="bg-brick-ember text-white">LIVE</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-night-bordeaux/50 text-[#f3eadc]/55"
                      >
                        Closed
                      </Badge>
                    )}
                    {room.isPrivate ? (
                      <Badge
                        variant="outline"
                        className="border-night-bordeaux/50 text-[#f3eadc]/55"
                      >
                        Private
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-[#f3eadc]/50">
                    UID {room.uid}
                    {room.closedAt
                      ? ` · Closed ${new Date(room.closedAt).toLocaleString()}`
                      : ` · Created ${new Date(room.createdAt).toLocaleString()}`}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {isLive ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-night-bordeaux/50 text-[#f3eadc]"
                      render={<Link href={`/room/${room.uid}`} />}
                      aria-label={`Rejoin ${title}`}
                    >
                      Open
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-brick-ember hover:bg-brick-ember/10 hover:text-brick-ember"
                    onClick={() => setDeleteTarget(room)}
                    aria-label={`Delete ${title}`}
                  >
                    <Trash2Icon />
                    Delete
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent className="border-night-bordeaux/50 bg-ink-black text-[#f3eadc] ring-night-bordeaux/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#f3eadc]">
              Delete room?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#f3eadc]/55">
              {deleteTarget
                ? `Permanently delete “${getTitle(deleteTarget)}”? Friends will no longer see it, and this cannot be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-night-bordeaux/40 bg-transparent">
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-night-bordeaux/50 text-[#f3eadc]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-brick-ember text-white hover:bg-brick-ember/90"
              onClick={(event) => {
                event.preventDefault()
                void handleConfirmDelete()
              }}
            >
              {isDeleting ? "Deleting…" : "Delete room"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
