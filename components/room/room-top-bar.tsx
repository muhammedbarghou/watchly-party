"use client"

import Link from "next/link"
import { LogOutIcon, UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { useState } from "react"
import Image from "next/image"

type RoomTopBarProps = {
  roomName: string | null
  participantCount: number
  isAdmin: boolean
  onLeave: () => void
}

export const RoomTopBar = ({
  roomName,
  participantCount,
  isAdmin,
  onLeave,
}: RoomTopBarProps) => {
  const [leaveOpen, setLeaveOpen] = useState(false)

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

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-night-bordeaux/50 bg-ink-black/95 px-3 sm:px-4">
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
          variant="outline"
          size="sm"
          className="border-night-bordeaux/60 bg-transparent text-[#f3eadc] hover:bg-night-bordeaux/40"
          onClick={handleLeaveClick}
          aria-label="Leave room"
        >
          <LogOutIcon className="size-3.5" aria-hidden />
          Leave
        </Button>
      </header>

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
