import { RoomExperience } from "@/components/room/room-experience"
import {
  defaultPreferencesForUser,
  ensureUserPreferences,
} from "@/lib/settings/preferences"
import { createClient } from "@/lib/supabase/server"

type RoomPageProps = {
  params: Promise<{ uid: string }>
}

const RoomPage = async ({ params }: RoomPageProps) => {
  const { uid } = await params
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

  const username =
    profile?.username ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "viewer"

  const avatarUrl =
    profile?.avatar_url ||
    (typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user?.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : null)

  let joinVoiceMuted = false
  if (user) {
    try {
      const preferences = await ensureUserPreferences(supabase, user.id)
      joinVoiceMuted = preferences.joinVoiceMuted
    } catch {
      joinVoiceMuted = defaultPreferencesForUser(user.id).joinVoiceMuted
    }
  }

  return (
    <RoomExperience
      key={uid}
      roomUid={uid}
      currentUser={{
        id: user?.id ?? "anonymous",
        username,
        avatarUrl,
      }}
      joinVoiceMuted={joinVoiceMuted}
    />
  )
}

export default RoomPage
