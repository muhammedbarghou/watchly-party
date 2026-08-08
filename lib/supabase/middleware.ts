import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const isPublicPath = (pathname: string) => {
  if (pathname === "/") {
    return true
  }

  if (pathname.startsWith("/auth")) {
    return true
  }

  if (pathname === "/privacy" || pathname === "/terms" || pathname === "/support") {
    return true
  }

  return false
}

const isAuthEntryPath = (pathname: string) => {
  return pathname === "/auth/sign-in" || pathname === "/auth/sign-up"
}

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and getClaims().
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims
  const { pathname } = request.nextUrl

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/sign-in"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthEntryPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/home-page"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
