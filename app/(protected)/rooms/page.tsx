import { MyRoomsPageShell } from "@/components/rooms/my-rooms-page-shell"
import { createClient } from "@/lib/supabase/server"

const MyRoomsPage = async () => {
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
    user?.email?.split("@")[0] ||
    "you"

  return (
    <MyRoomsPageShell
      currentUser={{
        id: profile?.id ?? user?.id ?? "",
        username: profile?.username ?? displayName,
        avatarUrl: profile?.avatar_url ?? null,
      }}
    />
  )
}

export default MyRoomsPage
