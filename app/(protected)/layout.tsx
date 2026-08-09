import { redirect } from "next/navigation"

import { ProtectedShell } from "@/components/home/protected-shell"
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

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "viewer"

  const avatarUrl =
    typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user?.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : null

  return (
    <ProtectedShell displayName={displayName} avatarUrl={avatarUrl}>
      {children}
    </ProtectedShell>
  )
}

export default ProtectedLayout
