import type { SupabaseClient } from "@supabase/supabase-js"

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; error: string }

export const changePassword = async (
  supabase: SupabaseClient,
  password: string,
  confirmPassword: string
): Promise<ChangePasswordResult> => {
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." }
  }

  if (password !== confirmPassword) {
    return { ok: false, error: "Passwords do not match." }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { ok: false, error: error.message || "Could not update password." }
  }

  return { ok: true }
}
