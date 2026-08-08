export const getSiteUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  return "http://localhost:3000"
}

export const getAuthCallbackUrl = (next = "/home-page") => {
  const url = new URL("/auth/callback", getSiteUrl())
  url.searchParams.set("next", next)
  return url.toString()
}

export const getSafeNextPath = (next: string | null | undefined) => {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/home-page"
  }

  return next
}
