const trimTrailingSlash = (url: string) => url.replace(/\/$/, "")

/**
 * Canonical site origin for auth redirects.
 * Prefer the current browser origin on the client so production OAuth never
 * accidentally uses a localhost Site URL baked into env.
 */
export const getSiteUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) {
    return trimTrailingSlash(configured)
  }

  // Set automatically on Vercel (no protocol). Prefer production domain when present.
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercelProductionUrl) {
    return `https://${trimTrailingSlash(vercelProductionUrl)}`
  }

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    return `https://${trimTrailingSlash(vercelUrl)}`
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
