"use server"

import {
  ensureUserPreferences,
  updateUserPreferences,
} from "@/lib/settings/preferences"
import type { UserPreferences, UserPreferencesUpdate } from "@/lib/settings/types"
import { createClient } from "@/lib/supabase/server"

export type PreferencesActionResult =
  | { ok: true; preferences: UserPreferences }
  | { ok: false; error: string }

export const savePreferencesAction = async (
  update: UserPreferencesUpdate
): Promise<PreferencesActionResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "You must be signed in." }
  }

  try {
    await ensureUserPreferences(supabase, user.id)
    const preferences = await updateUserPreferences(supabase, user.id, update)
    return { ok: true, preferences }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not save preferences.",
    }
  }
}
