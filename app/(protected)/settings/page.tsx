import { redirect } from "next/navigation"

import { SettingsPageShell } from "@/components/settings/settings-page-shell"
import { ensureUserPreferences } from "@/lib/settings/preferences"
import type { SettingsProfile } from "@/lib/settings/types"
import { createClient } from "@/lib/supabase/server"

const SettingsPage = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/sign-in")
  }

  const { data: profileRow } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .eq("id", user.id)
    .maybeSingle()

  if (!profileRow) {
    redirect("/home-page")
  }

  const preferences = await ensureUserPreferences(supabase, user.id)

  const identities = user.identities ?? []
  const providers = new Set(
    identities.map((identity) => identity.provider).filter(Boolean)
  )

  const profile: SettingsProfile = {
    id: profileRow.id,
    username: profileRow.username,
    avatarUrl: profileRow.avatar_url,
    email: user.email ?? null,
    hasPasswordProvider: providers.has("email"),
    hasGoogleProvider: providers.has("google"),
  }

  return <SettingsPageShell profile={profile} preferences={preferences} />
}

export default SettingsPage
