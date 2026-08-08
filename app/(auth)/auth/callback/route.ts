import { NextResponse } from "next/server"

import { getSafeNextPath } from "@/lib/auth/urls"
import { createClient } from "@/lib/supabase/server"

export const GET = async (request: Request) => {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = getSafeNextPath(searchParams.get("next"))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  const errorUrl = new URL("/auth/sign-in", origin)
  errorUrl.searchParams.set("error", "auth")
  return NextResponse.redirect(errorUrl)
}
