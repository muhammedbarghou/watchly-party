import { redirect } from "next/navigation"

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

  return <>{children}</>
}

export default ProtectedLayout
