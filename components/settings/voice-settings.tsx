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

type VoiceSettingsProps = {
  preferences: UserPreferences
  onPreferencesChange: (preferences: UserPreferences) => void
}

export const VoiceSettings = ({
  preferences,
  onPreferencesChange,
}: VoiceSettingsProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleToggle = async (checked: boolean) => {
    setIsPending(true)
    setErrorMessage(null)

    const previous = preferences
    const optimistic = { ...preferences, joinVoiceMuted: checked }
    onPreferencesChange(optimistic)

    const result = await savePreferencesAction({ joinVoiceMuted: checked })

    if (!result.ok) {
      onPreferencesChange(previous)
      setErrorMessage(result.error)
      setIsPending(false)
      return
    }

    onPreferencesChange(result.preferences)
    setIsPending(false)
  }

  return (
    <SettingsSection
      title="Voice"
      description="Choose how your microphone starts when you join a room."
    >
      <FieldGroup>
        <Field
          orientation="horizontal"
          className="items-center justify-between gap-4"
        >
          <div>
            <FieldLabel htmlFor="join-voice-muted">
              Join rooms muted
            </FieldLabel>
            <FieldDescription className="text-[#f3eadc]/45">
              Start with your mic off; unmute when you&apos;re ready
            </FieldDescription>
          </div>
          <Switch
            id="join-voice-muted"
            checked={preferences.joinVoiceMuted}
            disabled={isPending}
            onCheckedChange={(checked) => void handleToggle(checked)}
            aria-label="Join rooms with microphone muted"
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
