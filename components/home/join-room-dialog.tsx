"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { AlertCircleIcon, Loader2Icon } from "lucide-react"

import { useNotifications } from "@/components/notifications/notification-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { mockJoinRoom } from "@/lib/home/fixtures"
import { stashRoomPassword } from "@/lib/room/password-store"

type JoinRoomDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const JoinRoomDialog = ({
  open,
  onOpenChange,
}: JoinRoomDialogProps) => {
  const router = useRouter()
  const { notify } = useNotifications()
  const [uid, setUid] = useState("")
  const [password, setPassword] = useState("")
  const [needsPassword, setNeedsPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setUid("")
    setPassword("")
    setNeedsPassword(false)
    setErrorMessage(null)
    setIsSubmitting(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting && nextOpen === false) return
    onOpenChange(nextOpen)
    if (!nextOpen) {
      resetForm()
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    await new Promise((resolve) => window.setTimeout(resolve, 450))

    const result = mockJoinRoom(uid, password || undefined)
    setIsSubmitting(false)

    if (!result.ok) {
      setErrorMessage(result.error)
      if (result.needsPassword) {
        setNeedsPassword(true)
      }
      return
    }

    notify("Joined room")
    setIsSubmitting(false)
    onOpenChange(false)
    if (password) {
      stashRoomPassword(result.uid, password)
    }
    resetForm()
    router.push(`/room/${result.uid}`)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-night-bordeaux/50 bg-ink-black text-[#f3eadc] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#f3eadc]">Join room</DialogTitle>
          <DialogDescription className="text-[#f3eadc]/55">
            Enter a room UID shared by a host. Try fixtures like{" "}
            <span className="text-amber-flame">watch7k</span>,{" "}
            <span className="text-amber-flame">private1</span> (password{" "}
            <span className="text-amber-flame">secret</span>), or{" "}
            <span className="text-amber-flame">missing</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="join-room-uid">Room UID</FieldLabel>
              <Input
                id="join-room-uid"
                value={uid}
                onChange={(event) => setUid(event.target.value)}
                placeholder="e.g. watch7k"
                autoComplete="off"
                className="border-night-bordeaux/60 bg-white/5 text-[#f3eadc]"
                disabled={isSubmitting}
                required
              />
            </Field>

            {needsPassword ? (
              <Field>
                <FieldLabel htmlFor="join-room-password">Password</FieldLabel>
                <Input
                  id="join-room-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="border-night-bordeaux/60 bg-white/5 text-[#f3eadc]"
                  disabled={isSubmitting}
                />
              </Field>
            ) : null}
          </FieldGroup>

          {errorMessage ? (
            <Alert variant="destructive" className="border-destructive/40">
              <AlertCircleIcon />
              <AlertTitle>Couldn&apos;t join</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter className="border-night-bordeaux/40 bg-transparent">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="border-night-bordeaux/50 text-[#f3eadc]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-flame text-ink-black hover:bg-[#e5a500]"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Joining…
                </>
              ) : (
                "Join room"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
