"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  createMockRoomUid,
  isValidHttpUrl,
} from "@/lib/home/fixtures"
import type { RoomCardData } from "@/lib/home/types"

type CreateRoomDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (room: RoomCardData) => void
  hostUsername: string
}

type CreateFormState = {
  name: string
  isPrivate: boolean
  password: string
  videoUrl: string
  visibleToFriends: boolean
}

export const CreateRoomDialog = ({
  open,
  onOpenChange,
  onCreated,
  hostUsername,
}: CreateRoomDialogProps) => {
  const router = useRouter()
  const { notify } = useNotifications()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formState, setFormState] = useState<CreateFormState>({
    name: "",
    isPrivate: false,
    password: "",
    videoUrl: "",
    visibleToFriends: true,
  })

  const resetForm = () => {
    setErrorMessage(null)
    setIsSubmitting(false)
    setFormState({
      name: "",
      isPrivate: false,
      password: "",
      videoUrl: "",
      visibleToFriends: true,
    })
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

    if (!formState.videoUrl.trim()) {
      setErrorMessage("Video source URL is required.")
      return
    }

    if (!isValidHttpUrl(formState.videoUrl.trim())) {
      setErrorMessage("Enter a valid http(s) URL.")
      return
    }

    if (formState.isPrivate && !formState.password.trim()) {
      setErrorMessage("Private rooms need a password.")
      return
    }

    setIsSubmitting(true)

    await new Promise((resolve) => window.setTimeout(resolve, 700))

    const uid = createMockRoomUid()
    const room: RoomCardData = {
      id: `created-${uid}`,
      uid,
      name: formState.name.trim() || null,
      status: "active",
      videoUrl: formState.videoUrl.trim(),
      posterUrl:
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=640&h=360&fit=crop",
      host: {
        id: "me",
        username: hostUsername,
        avatarUrl: null,
      },
      participantCount: 1,
      requiresApproval: false,
      isPrivate: formState.isPrivate,
      visibleToFriends: formState.visibleToFriends,
      createdAt: new Date().toISOString(),
      closedAt: null,
    }

    onCreated(room)
    notify("Room created")
    setIsSubmitting(false)
    onOpenChange(false)
    resetForm()
    router.push(`/room/${uid}`)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-night-bordeaux/50 bg-ink-black text-[#f3eadc] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#f3eadc]">Create room</DialogTitle>
          <DialogDescription className="text-[#f3eadc]/55">
            Paste a video link and invite friends. Room UID is generated for
            you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="create-room-name">Room name</FieldLabel>
              <Input
                id="create-room-name"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="Optional"
                className="border-night-bordeaux/60 bg-white/5 text-[#f3eadc]"
                disabled={isSubmitting}
              />
            </Field>

            <Field orientation="horizontal" className="items-center justify-between">
              <div>
                <FieldLabel htmlFor="create-room-private">Private room</FieldLabel>
                <FieldDescription className="text-[#f3eadc]/45">
                  Requires a password to join
                </FieldDescription>
              </div>
              <Switch
                id="create-room-private"
                checked={formState.isPrivate}
                onCheckedChange={(checked) =>
                  setFormState((prev) => ({
                    ...prev,
                    isPrivate: checked,
                    password: checked ? prev.password : "",
                  }))
                }
                disabled={isSubmitting}
                aria-label="Private room"
              />
            </Field>

            {formState.isPrivate ? (
              <Field>
                <FieldLabel htmlFor="create-room-password">Password</FieldLabel>
                <Input
                  id="create-room-password"
                  type="password"
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  autoComplete="new-password"
                  className="border-night-bordeaux/60 bg-white/5 text-[#f3eadc]"
                  disabled={isSubmitting}
                />
              </Field>
            ) : null}

            <Field>
              <FieldLabel htmlFor="create-room-video">Video source URL</FieldLabel>
              <Input
                id="create-room-video"
                type="url"
                required
                value={formState.videoUrl}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    videoUrl: event.target.value,
                  }))
                }
                placeholder="https://…"
                className="border-night-bordeaux/60 bg-white/5 text-[#f3eadc]"
                disabled={isSubmitting}
              />
            </Field>

            <Field orientation="horizontal" className="items-center justify-between">
              <div>
                <FieldLabel htmlFor="create-room-visible">
                  Visible to friends
                </FieldLabel>
                <FieldDescription className="text-[#f3eadc]/45">
                  Show this room on friends&apos; home feeds
                </FieldDescription>
              </div>
              <Switch
                id="create-room-visible"
                checked={formState.visibleToFriends}
                onCheckedChange={(checked) =>
                  setFormState((prev) => ({
                    ...prev,
                    visibleToFriends: checked,
                  }))
                }
                disabled={isSubmitting}
                aria-label="Visible to friends"
              />
            </Field>
          </FieldGroup>

          {errorMessage ? (
            <Alert variant="destructive" className="border-destructive/40">
              <AlertTitle>Couldn&apos;t create room</AlertTitle>
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
                  Creating…
                </>
              ) : (
                "Create room"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
