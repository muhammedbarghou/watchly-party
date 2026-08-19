"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"

import { CinemaPageLoader } from "@/components/brand/cinema-page-loader"
import { cn } from "@/lib/utils"

type PageTransitionOverlayProps = {
  children: ReactNode
  enabled: boolean
  fillBelowNav?: boolean
}

const SAFETY_TIMEOUT_MS = 8000

const isInternalNavigationAnchor = (anchor: HTMLAnchorElement): boolean => {
  if (anchor.target && anchor.target !== "_self") return false
  if (anchor.hasAttribute("download")) return false

  const href = anchor.getAttribute("href")
  if (!href) return false
  if (
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return false
  }

  let url: URL
  try {
    url = new URL(href, window.location.href)
  } catch {
    return false
  }

  if (url.origin !== window.location.origin) return false
  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  ) {
    return false
  }

  return true
}

export const PageTransitionOverlay = ({
  children,
  enabled,
  fillBelowNav = false,
}: PageTransitionOverlayProps) => {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  useEffect(() => {
    if (!isNavigating) return

    const timeoutId = window.setTimeout(() => {
      setIsNavigating(false)
    }, SAFETY_TIMEOUT_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isNavigating])

  useEffect(() => {
    if (!enabled) return

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      if (event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const eventTarget = event.target
      if (!(eventTarget instanceof Element)) return

      const anchor = eventTarget.closest("a")
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (!isInternalNavigationAnchor(anchor)) return

      setIsNavigating(true)
    }

    document.addEventListener("click", handleDocumentClick, true)

    return () => {
      document.removeEventListener("click", handleDocumentClick, true)
    }
  }, [enabled])

  const showLoader = enabled && isNavigating

  return (
    <div
      aria-busy={showLoader || undefined}
      className={cn(
        "relative",
        fillBelowNav ? "min-h-[calc(100vh-3.5rem)]" : "min-h-screen",
      )}
    >
      {children}
      {showLoader ? (
        <div className="pointer-events-none absolute inset-0 z-30">
          <CinemaPageLoader className="h-full min-h-full" />
        </div>
      ) : null}
    </div>
  )
}
