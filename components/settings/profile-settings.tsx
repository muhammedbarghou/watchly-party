"use client"

import { useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { SettingsSection } from "@/components/settings/settings-section"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import {
  removeAvatar,
  updateUsername,
  uploadAvatar,
  validateUsername,
} from "@/lib/settings/update-profile"
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  type SettingsProfile,
} from "@/lib/settings/types"

type ProfileSettingsProps = {
  profile: SettingsProfile
  onProfileChange: (profile: SettingsProfile) => void
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export const ProfileSettings = ({
  profile,
  onProfileChange,
}: ProfileSettingsProps) => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [username, setUsername] = useState(profile.username)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const usernameValidation = validateUsername(username)
  const showUsernameError =
    hasAttemptedSubmit && !usernameValidation.ok
      ? usernameValidation.error
      : null

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handlePickAvatar = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarSelected = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setIsUploading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const supabase = createClient()
    const result = await uploadAvatar(supabase, profile.id, file)

    if (!result.ok) {
      setErrorMessage(result.error)
      setIsUploading(false)
      return
    }

    onProfileChange({
      ...profile,
      username: result.username,
      avatarUrl: result.avatarUrl,
    })
    setSuccessMessage("Avatar updated.")
    setIsUploading(false)
    router.refresh()
  }

  const handleRemoveAvatar = async () => {
    setIsUploading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const supabase = createClient()
    const result = await removeAvatar(supabase, profile.id)

    if (!result.ok) {
      setErrorMessage(result.error)
      setIsUploading(false)
      return
    }

    onProfileChange({
      ...profile,
      username: result.username,
      avatarUrl: null,
    })
    setSuccessMessage("Avatar removed.")
    setIsUploading(false)
    router.refresh()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasAttemptedSubmit(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!usernameValidation.ok) return

    setIsSaving(true)
    const supabase = createClient()
    const result = await updateUsername(supabase, profile.id, username)

    if (!result.ok) {
      setErrorMessage(result.error)
      setIsSaving(false)
      return
    }

    setUsername(result.username)
    onProfileChange({
      ...profile,
      username: result.username,
      avatarUrl: result.avatarUrl,
    })
    setSuccessMessage("Profile saved.")
    setIsSaving(false)
    router.refresh()
  }

  return (
    <SettingsSection
      title="Profile"
      description="This is how friends see you across Watchly rooms and requests."
    >
      <div className="flex flex-wrap items-center gap-4">
        <Avatar size="lg" className="size-16">
          {profile.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt="" />
          ) : null}
          <AvatarFallback className="bg-night-bordeaux text-sm text-[#f3eadc]">
            {getInitials(profile.username)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-night-bordeaux/50 text-[#f3eadc]"
            onClick={handlePickAvatar}
            disabled={isUploading || isSaving}
            aria-label="Upload avatar image"
          >
            {isUploading ? (
              <>
                <Loader2Icon className="animate-spin" aria-hidden />
                Uploading…
              </>
            ) : (
              "Upload photo"
            )}
          </Button>
          {profile.avatarUrl ? (
            <Button
              type="button"
              variant="ghost"
              className="text-[#f3eadc]/70 hover:text-[#f3eadc]"
              onClick={() => void handleRemoveAvatar()}
              disabled={isUploading || isSaving}
              aria-label="Remove avatar"
            >
              Remove
            </Button>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(event) => void handleAvatarSelected(event)}
            tabIndex={-1}
            aria-hidden
          />
        </div>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)}>
        <FieldGroup>
          <Field data-invalid={Boolean(showUsernameError) || undefined}>
            <FieldLabel htmlFor="settings-username">Username</FieldLabel>
            <Input
              id="settings-username"
              value={username}
              onChange={handleUsernameChange}
              autoComplete="username"
              minLength={USERNAME_MIN_LENGTH}
              maxLength={USERNAME_MAX_LENGTH}
              className="border-night-bordeaux/60 bg-white/5 text-[#f3eadc]"
              disabled={isSaving || isUploading}
              aria-invalid={Boolean(showUsernameError)}
              aria-describedby="settings-username-hint"
            />
            <FieldDescription
              id="settings-username-hint"
              className="text-[#f3eadc]/45"
            >
              {USERNAME_MIN_LENGTH}–{USERNAME_MAX_LENGTH} characters. Letters,
              numbers, dots, underscores, hyphens.
            </FieldDescription>
            {showUsernameError ? (
              <FieldError>{showUsernameError}</FieldError>
            ) : null}
          </Field>
        </FieldGroup>

        {errorMessage ? (
          <Alert
            variant="destructive"
            className="mt-4 border-destructive/40"
          >
            <AlertTitle>Couldn&apos;t save</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert className="mt-4 border-night-bordeaux/40 bg-white/[0.03] text-[#f3eadc]">
            <AlertTitle>Saved</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-5">
          <Button
            type="submit"
            disabled={isSaving || isUploading}
            className="bg-amber-flame text-ink-black hover:bg-[#e5a500]"
            aria-label="Save profile"
          >
            {isSaving ? (
              <>
                <Loader2Icon className="animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Save profile"
            )}
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}
