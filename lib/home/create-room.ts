"use server"

import bcrypt from "bcryptjs"

import { createClient } from "@/lib/supabase/server"
import type { RoomCardData, RoomVisibility } from "@/lib/home/types"

const UID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789"
const MAX_UID_ATTEMPTS = 8
const BCRYPT_ROUNDS = 10

export type CreateRoomInput = {
  name: string
  videoUrl: string
  isPrivate: boolean
  password?: string
  visibility: RoomVisibility
}

export type CreateRoomResult =
  | { ok: true; room: RoomCardData }
  | { ok: false; error: string }

const generateRoomUid = (): string => {
  let uid = ""
  for (let i = 0; i < 6; i += 1) {
    uid += UID_ALPHABET[Math.floor(Math.random() * UID_ALPHABET.length)]
  }
  return uid
}

export const createRoomAction = async (
  input: CreateRoomInput
): Promise<CreateRoomResult> => {
  const videoUrl = input.videoUrl.trim()
  if (!videoUrl) {
    return { ok: false, error: "Video source URL is required." }
  }

  try {
    const parsed = new URL(videoUrl)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, error: "Enter a valid http(s) URL." }
    }
  } catch {
    return { ok: false, error: "Enter a valid http(s) URL." }
  }

  const visibility: RoomVisibility =
    input.visibility === "public" ||
    input.visibility === "friends" ||
    input.visibility === "private"
      ? input.visibility
      : "friends"

  if (visibility === "public" && input.isPrivate) {
    return {
      ok: false,
      error: "Public rooms cannot require a password or approval.",
    }
  }

  if (visibility !== "public" && input.isPrivate && !input.password?.trim()) {
    return { ok: false, error: "Private rooms need a password." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "You must be signed in to create a room." }
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    return {
      ok: false,
      error: "Complete your profile before creating a room.",
    }
  }

  const isPrivate = visibility === "public" ? false : input.isPrivate
  const passwordHash = isPrivate
    ? await bcrypt.hash(input.password!.trim(), BCRYPT_ROUNDS)
    : null
  const visibleToFriends = visibility !== "private"

  const name = input.name.trim() || null

  for (let attempt = 0; attempt < MAX_UID_ATTEMPTS; attempt += 1) {
    const uid = generateRoomUid()
    const { data, error } = await supabase
      .from("rooms")
      .insert({
        uid,
        name,
        created_by: user.id,
        video_url: videoUrl,
        password_hash: passwordHash,
        is_private: isPrivate,
        visible_to_friends: visibleToFriends,
        visibility,
        status: "active",
      })
      .select(
        "id, uid, name, created_by, video_url, is_private, visible_to_friends, visibility, status, created_at"
      )
      .single()

    if (error) {
      if (error.code === "23505") {
        continue
      }
      return { ok: false, error: error.message || "Could not create room." }
    }

    const room: RoomCardData = {
      id: data.id,
      uid: data.uid,
      name: data.name,
      status: data.status === "closed" ? "closed" : "active",
      videoUrl: data.video_url,
      posterUrl:
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=640&h=360&fit=crop",
      host: {
        id: profile.id,
        username: profile.username,
        avatarUrl: profile.avatar_url,
      },
      participantCount: 1,
      requiresApproval: isPrivate,
      isPrivate: Boolean(data.is_private),
      visibility,
      visibleToFriends,
      createdAt: data.created_at ?? new Date().toISOString(),
      closedAt: null,
    }

    return { ok: true, room }
  }

  return { ok: false, error: "Could not allocate a unique room UID. Try again." }
}
