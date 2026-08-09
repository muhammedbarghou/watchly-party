import { RoomExperience } from "@/components/room/room-experience"
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

  const username =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "viewer"

  const avatarUrl =
    typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user?.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : null

  return (
    <RoomExperience
      key={uid}
      roomUid={uid}
      currentUser={{
        id: user?.id ?? "anonymous",
        username,
        avatarUrl,
      }}
    />
  )
}

export default RoomPage
