import type { SupabaseClient } from "@supabase/supabase-js"

import {
  DEFAULT_USER_PREFERENCES,
  type UserPreferences,
  type UserPreferencesUpdate,
} from "@/lib/settings/types"

type PreferencesRow = {
  user_id: string
  notify_friend_request: boolean
  notify_room_invite: boolean
  notify_access_request: boolean
  notify_toasts_enabled: boolean
  default_room_private: boolean
  default_visible_to_friends: boolean
  join_voice_muted: boolean
  updated_at: string
}

const mapPreferencesRow = (row: PreferencesRow): UserPreferences => ({
  userId: row.user_id,
  notifyFriendRequest: row.notify_friend_request,
  notifyRoomInvite: row.notify_room_invite,
  notifyAccessRequest: row.notify_access_request,
  notifyToastsEnabled: row.notify_toasts_enabled,
  defaultRoomPrivate: row.default_room_private,
  defaultVisibleToFriends: row.default_visible_to_friends,
  joinVoiceMuted: row.join_voice_muted,
  updatedAt: row.updated_at,
})

const preferencesSelect =
  "user_id, notify_friend_request, notify_room_invite, notify_access_request, notify_toasts_enabled, default_room_private, default_visible_to_friends, join_voice_muted, updated_at"

export const defaultPreferencesForUser = (
  userId: string
): UserPreferences => ({
  userId,
  ...DEFAULT_USER_PREFERENCES,
  updatedAt: new Date().toISOString(),
})

export const ensureUserPreferences = async (
  supabase: SupabaseClient,
  userId: string
): Promise<UserPreferences> => {
  const { data, error } = await supabase
    .from("user_preferences")
    .select(preferencesSelect)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message || "Could not load preferences.")
  }

  if (data) {
    return mapPreferencesRow(data as PreferencesRow)
  }

  const { data: inserted, error: insertError } = await supabase
    .from("user_preferences")
    .insert({ user_id: userId })
    .select(preferencesSelect)
    .single()

  if (insertError) {
    // Race: another request may have inserted — re-read
    const { data: retry } = await supabase
      .from("user_preferences")
      .select(preferencesSelect)
      .eq("user_id", userId)
      .maybeSingle()

    if (retry) {
      return mapPreferencesRow(retry as PreferencesRow)
    }

    throw new Error(insertError.message || "Could not create preferences.")
  }

  return mapPreferencesRow(inserted as PreferencesRow)
}

export const updateUserPreferences = async (
  supabase: SupabaseClient,
  userId: string,
  update: UserPreferencesUpdate
): Promise<UserPreferences> => {
  const payload: Record<string, boolean> = {}

  if (typeof update.notifyFriendRequest === "boolean") {
    payload.notify_friend_request = update.notifyFriendRequest
  }
  if (typeof update.notifyRoomInvite === "boolean") {
    payload.notify_room_invite = update.notifyRoomInvite
  }
  if (typeof update.notifyAccessRequest === "boolean") {
    payload.notify_access_request = update.notifyAccessRequest
  }
  if (typeof update.notifyToastsEnabled === "boolean") {
    payload.notify_toasts_enabled = update.notifyToastsEnabled
  }
  if (typeof update.defaultRoomPrivate === "boolean") {
    payload.default_room_private = update.defaultRoomPrivate
  }
  if (typeof update.defaultVisibleToFriends === "boolean") {
    payload.default_visible_to_friends = update.defaultVisibleToFriends
  }
  if (typeof update.joinVoiceMuted === "boolean") {
    payload.join_voice_muted = update.joinVoiceMuted
  }

  if (Object.keys(payload).length === 0) {
    return ensureUserPreferences(supabase, userId)
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .update(payload)
    .eq("user_id", userId)
    .select(preferencesSelect)
    .single()

  if (error) {
    throw new Error(error.message || "Could not save preferences.")
  }

  return mapPreferencesRow(data as PreferencesRow)
}
