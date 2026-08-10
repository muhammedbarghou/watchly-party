"use client"

import { useState } from "react"

import { SettingsSection } from "@/components/settings/settings-section"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { savePreferencesAction } from "@/lib/settings/actions"
import type { UserPreferences } from "@/lib/settings/types"

type RoomDefaultsSettingsProps = {
  preferences: UserPreferences
  onPreferencesChange: (preferences: UserPreferences) => void
}

export const RoomDefaultsSettings = ({
  preferences,
  onPreferencesChange,
}: RoomDefaultsSettingsProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  const handleToggle = async (
    key: keyof Pick<
      UserPreferences,
      "defaultRoomPrivate" | "defaultVisibleToFriends"
    >,
    checked: boolean
  ) => {
    setPendingKey(key)
    setErrorMessage(null)

    const previous = preferences
    const optimistic = { ...preferences, [key]: checked }
    onPreferencesChange(optimistic)

    const result = await savePreferencesAction({ [key]: checked })

    if (!result.ok) {
      onPreferencesChange(previous)
      setErrorMessage(result.error)
      setPendingKey(null)
      return
    }

    onPreferencesChange(result.preferences)
    setPendingKey(null)
  }

  return (
    <SettingsSection
      title="Room defaults"
      description="Pre-fill privacy options when you create a new watch room."
    >
      <FieldGroup>
        <Field
          orientation="horizontal"
          className="items-center justify-between gap-4"
        >
          <div>
            <FieldLabel htmlFor="default-room-private">
              Private by default
            </FieldLabel>
            <FieldDescription className="text-[#f3eadc]/45">
              New rooms start locked behind a password
            </FieldDescription>
          </div>
          <Switch
            id="default-room-private"
            checked={preferences.defaultRoomPrivate}
            disabled={pendingKey !== null}
            onCheckedChange={(checked) =>
              void handleToggle("defaultRoomPrivate", checked)
            }
            aria-label="Create private rooms by default"
          />
        </Field>

        <Field
          orientation="horizontal"
          className="items-center justify-between gap-4"
        >
          <div>
            <FieldLabel htmlFor="default-visible-friends">
              Visible to friends
            </FieldLabel>
            <FieldDescription className="text-[#f3eadc]/45">
              Show new rooms on friends&apos; home feeds
            </FieldDescription>
          </div>
          <Switch
            id="default-visible-friends"
            checked={preferences.defaultVisibleToFriends}
            disabled={pendingKey !== null}
            onCheckedChange={(checked) =>
              void handleToggle("defaultVisibleToFriends", checked)
            }
            aria-label="Show new rooms to friends by default"
          />
        </Field>
      </FieldGroup>

      {errorMessage ? (
        <Alert variant="destructive" className="border-destructive/40">
          <AlertTitle>Couldn&apos;t save</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
    </SettingsSection>
  )
}
