"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { RemovalReason } from "@/lib/room/types"

type RoomRemovedGateProps = {
  reason: RemovalReason
}

export const RoomRemovedGate = ({ reason }: RoomRemovedGateProps) => {
  if (!reason) return null

  const title =
    reason === "banned"
      ? "You were banned from this room"
      : "You were removed from this room"

  const body =
    reason === "banned"
      ? "The admin banned you from this room. Rejoining with the same room code will not work."
      : "The admin removed you from this room. You can try rejoining unless you have also been banned."

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/95 px-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="room-removed-title"
      aria-describedby="room-removed-desc"
    >
      <div className="w-full max-w-md rounded-xl border border-night-bordeaux/50 bg-ink-black p-6 text-center">
        <h1
          id="room-removed-title"
          className="font-serif mb-3 text-2xl text-[#f3eadc]"
        >
          {title}
        </h1>
        <p id="room-removed-desc" className="mb-6 text-sm text-[#f3eadc]/65">
          {body}
        </p>
        <Button
          className="rounded-xl bg-amber-flame text-ink-black hover:bg-[#e5a500]"
          render={<Link href="/home-page" />}
        >
          Back to home
        </Button>
      </div>
    </div>
  )
}
