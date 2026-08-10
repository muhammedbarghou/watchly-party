import { HomePageShell } from "@/components/home/home-page-shell"
import { createClient } from "@/lib/supabase/server"

const HomePage = async () => {
  const supabase = await createClient()
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
    user?.email ||
    "viewer"

  return (
    <HomePageShell
      displayName={displayName}
      currentUser={
        user
          ? {
              id: user.id,
              username: profile?.username ?? displayName,
              avatarUrl: profile?.avatar_url ?? null,
            }
          : null
      }
    />
  )
}

export default HomePage
