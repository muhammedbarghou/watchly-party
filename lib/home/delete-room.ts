"use server"

import { createClient } from "@/lib/supabase/server"

export type DeleteRoomResult =
  | { ok: true }
  | { ok: false; error: string }

export const deleteRoomAction = async (
  roomId: string
): Promise<DeleteRoomResult> => {
  const id = roomId.trim()
  if (!id) {
    return { ok: false, error: "Missing room id." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "You must be signed in." }
  }

  const { error } = await supabase
    .from("rooms")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id)

  if (error) {
    return { ok: false, error: error.message || "Could not delete room." }
  }

  return { ok: true }
}

export type CloseRoomResult =
  | { ok: true }
  | { ok: false; error: string }

/** Soft-close a room you own (status → closed). Used if needed from client. */
export const closeRoomAction = async (
  roomId: string
): Promise<CloseRoomResult> => {
  const id = roomId.trim()
  if (!id) {
    return { ok: false, error: "Missing room id." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "You must be signed in." }
  }

  const { error } = await supabase
    .from("rooms")
    .update({ status: "closed" })
    .eq("id", id)
    .eq("created_by", user.id)
    .eq("status", "active")

  if (error) {
    return { ok: false, error: error.message || "Could not close room." }
  }

  return { ok: true }
}
