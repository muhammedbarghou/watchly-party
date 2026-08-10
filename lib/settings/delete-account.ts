"use server"

import { createClient as createSupabaseJsClient } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; error: string }

const createAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !secretKey) {
    return null
  }

  return createSupabaseJsClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const deleteAccountAction = async (
  confirmation: string
): Promise<DeleteAccountResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "You must be signed in." }
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .maybeSingle()

  const expected =
    profile?.username ||
    user.email?.split("@")[0] ||
    user.email ||
    ""

  if (
    !expected ||
    confirmation.trim().toLowerCase() !== expected.toLowerCase()
  ) {
    return {
      ok: false,
      error: "Type your username exactly to confirm deletion.",
    }
  }

  const admin = createAdminClient()
  if (!admin) {
    return {
      ok: false,
      error:
        "Account deletion is not configured. Ask an admin to set SUPABASE_SECRET_KEY.",
    }
  }

  await admin.from("room_bans").delete().eq("user_id", user.id)

  const { data: ownedRooms } = await admin
    .from("rooms")
    .select("id")
    .eq("created_by", user.id)

  const ownedRoomIds = (ownedRooms ?? []).map((room) => room.id)
  if (ownedRoomIds.length > 0) {
    await admin.from("room_bans").delete().in("room_id", ownedRoomIds)
  }

  await admin.from("rooms").delete().eq("created_by", user.id)
  await admin
    .from("friendships")
    .delete()
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)

  const { data: avatarFiles } = await admin.storage
    .from("avatars")
    .list(user.id)

  if (avatarFiles && avatarFiles.length > 0) {
    await admin.storage
      .from("avatars")
      .remove(avatarFiles.map((file) => `${user.id}/${file.name}`))
  }

  const { error: profileError } = await admin
    .from("users")
    .delete()
    .eq("id", user.id)

  if (profileError) {
    return {
      ok: false,
      error: profileError.message || "Could not delete profile data.",
    }
  }

  const { error: authError } = await admin.auth.admin.deleteUser(user.id)

  if (authError) {
    return {
      ok: false,
      error: authError.message || "Could not delete auth account.",
    }
  }

  await supabase.auth.signOut()

  return { ok: true }
}
