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

type NotificationSettingsProps = {
  preferences: UserPreferences
  onPreferencesChange: (preferences: UserPreferences) => void
}

export const NotificationSettings = ({
  preferences,
  onPreferencesChange,
}: NotificationSettingsProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  const handleToggle = async (
    key: keyof Pick<
      UserPreferences,
      | "notifyFriendRequest"
      | "notifyRoomInvite"
      | "notifyAccessRequest"
      | "notifyToastsEnabled"
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
      title="Notifications"
      description="Control which in-app alerts land in your inbox and toast tray."
    >
      <FieldGroup>
        <Field
          orientation="horizontal"
          className="items-center justify-between gap-4"
        >
          <div>
            <FieldLabel htmlFor="notify-friend-request">
              Friend requests
            </FieldLabel>
            <FieldDescription className="text-[#f3eadc]/45">
              When someone wants to connect
            </FieldDescription>
          </div>
          <Switch
            id="notify-friend-request"
            checked={preferences.notifyFriendRequest}
            disabled={pendingKey !== null}
            onCheckedChange={(checked) =>
              void handleToggle("notifyFriendRequest", checked)
            }
            aria-label="Notify on friend requests"
          />
        </Field>

        <Field
          orientation="horizontal"
          className="items-center justify-between gap-4"
        >
          <div>
            <FieldLabel htmlFor="notify-room-invite">Room invites</FieldLabel>
            <FieldDescription className="text-[#f3eadc]/45">
              When a friend invites you to a room
            </FieldDescription>
          </div>
          <Switch
            id="notify-room-invite"
            checked={preferences.notifyRoomInvite}
            disabled={pendingKey !== null}
            onCheckedChange={(checked) =>
              void handleToggle("notifyRoomInvite", checked)
            }
            aria-label="Notify on room invites"
          />
        </Field>

        <Field
          orientation="horizontal"
          className="items-center justify-between gap-4"
        >
          <div>
            <FieldLabel htmlFor="notify-access-request">
              Access requests
            </FieldLabel>
            <FieldDescription className="text-[#f3eadc]/45">
              When someone asks to join your private room
            </FieldDescription>
          </div>
          <Switch
            id="notify-access-request"
            checked={preferences.notifyAccessRequest}
            disabled={pendingKey !== null}
            onCheckedChange={(checked) =>
              void handleToggle("notifyAccessRequest", checked)
            }
            aria-label="Notify on access requests"
          />
        </Field>

        <Field
          orientation="horizontal"
          className="items-center justify-between gap-4"
        >
          <div>
            <FieldLabel htmlFor="notify-toasts">Toast messages</FieldLabel>
            <FieldDescription className="text-[#f3eadc]/45">
              Short confirmation toasts across the app
            </FieldDescription>
          </div>
          <Switch
            id="notify-toasts"
            checked={preferences.notifyToastsEnabled}
            disabled={pendingKey !== null}
            onCheckedChange={(checked) =>
              void handleToggle("notifyToastsEnabled", checked)
            }
            aria-label="Enable toast notifications"
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
