import type { SupabaseClient } from "@supabase/supabase-js"

import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from "@/lib/settings/types"

export type ProfileUpdateResult =
  | { ok: true; username: string; avatarUrl: string | null }
  | { ok: false; error: string }

export const normalizeUsername = (raw: string): string =>
  raw.trim().toLowerCase()

export const validateUsername = (
  username: string
): { ok: true; username: string } | { ok: false; error: string } => {
  const normalized = normalizeUsername(username)

  if (
    normalized.length < USERNAME_MIN_LENGTH ||
    normalized.length > USERNAME_MAX_LENGTH
  ) {
    return {
      ok: false,
      error: `Username must be ${USERNAME_MIN_LENGTH}–${USERNAME_MAX_LENGTH} characters.`,
    }
  }

  if (!USERNAME_PATTERN.test(normalized)) {
    return {
      ok: false,
      error:
        "Username can only use lowercase letters, numbers, dots, underscores, and hyphens.",
    }
  }

  return { ok: true, username: normalized }
}

export const updateUsername = async (
  supabase: SupabaseClient,
  userId: string,
  rawUsername: string
): Promise<ProfileUpdateResult> => {
  const validated = validateUsername(rawUsername)
  if (!validated.ok) {
    return validated
  }

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", validated.username)
    .neq("id", userId)
    .maybeSingle()

  if (existing) {
    return { ok: false, error: "That username is already taken." }
  }

  const { data, error } = await supabase
    .from("users")
    .update({ username: validated.username })
    .eq("id", userId)
    .select("username, avatar_url")
    .single()

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That username is already taken." }
    }
    return { ok: false, error: error.message || "Could not update username." }
  }

  return {
    ok: true,
    username: data.username,
    avatarUrl: data.avatar_url,
  }
}

const extensionForMime = (mime: string): string | null => {
  switch (mime) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    default:
      return null
  }
}

export const uploadAvatar = async (
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<ProfileUpdateResult> => {
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Avatar must be an image file." }
  }

  const ext = extensionForMime(file.type)
  if (!ext) {
    return {
      ok: false,
      error: "Use a JPEG, PNG, WebP, or GIF image.",
    }
  }

  if (file.size > 2 * 1024 * 1024) {
    return { ok: false, error: "Avatar must be 2MB or smaller." }
  }

  const path = `${userId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    return {
      ok: false,
      error: uploadError.message || "Could not upload avatar.",
    }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path)

  const { data, error } = await supabase
    .from("users")
    .update({ avatar_url: publicUrl })
    .eq("id", userId)
    .select("username, avatar_url")
    .single()

  if (error) {
    return { ok: false, error: error.message || "Could not save avatar." }
  }

  return {
    ok: true,
    username: data.username,
    avatarUrl: data.avatar_url,
  }
}

export const removeAvatar = async (
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileUpdateResult> => {
  const { data: files } = await supabase.storage.from("avatars").list(userId)

  if (files && files.length > 0) {
    const paths = files.map((file) => `${userId}/${file.name}`)
    await supabase.storage.from("avatars").remove(paths)
  }

  const { data, error } = await supabase
    .from("users")
    .update({ avatar_url: null })
    .eq("id", userId)
    .select("username, avatar_url")
    .single()

  if (error) {
    return { ok: false, error: error.message || "Could not remove avatar." }
  }

  return {
    ok: true,
    username: data.username,
    avatarUrl: data.avatar_url,
  }
}
