import { HomePageShell } from "@/components/home/home-page-shell"
import { createClient } from "@/lib/supabase/server"

const HomePage = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "viewer"

  return <HomePageShell displayName={displayName} />
}

export default HomePage
