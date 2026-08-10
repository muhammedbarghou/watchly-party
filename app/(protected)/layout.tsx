import { redirect } from "next/navigation"

import { ProtectedShell } from "@/components/home/protected-shell"
import {
  defaultPreferencesForUser,
  ensureUserPreferences,
} from "@/lib/settings/preferences"
import { createClient } from "@/lib/supabase/server"

const ProtectedLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect("/auth/sign-in")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from("users")
        .select("id, username, avatar_url")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null }

  const displayName =
    profile?.username ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    user?.email ||
    "viewer"

  const avatarUrl =
    profile?.avatar_url ||
    (typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user?.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : null)

  let preferences = user
    ? defaultPreferencesForUser(user.id)
    : defaultPreferencesForUser("anonymous")

  if (user) {
    try {
      preferences = await ensureUserPreferences(supabase, user.id)
    } catch {
      preferences = defaultPreferencesForUser(user.id)
    }
  }

  return (
    <ProtectedShell
      displayName={displayName}
      avatarUrl={avatarUrl}
      preferences={preferences}
    >
      {children}
    </ProtectedShell>
  )
}

export default ProtectedLayout
