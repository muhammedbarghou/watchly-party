"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import gsap from "gsap"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { navLinks } from "@/components/landing/landing-data"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollToPlugin)

const HEADER_OFFSET = 80
const SCROLL_DURATION = 1
const SCROLL_EASE = "power2.inOut"

const getHashFromHref = (href: string): string | null => {
  const hashIndex = href.indexOf("#")
  if (hashIndex === -1) return null
  return href.slice(hashIndex + 1)
}

const isInPageScrollHref = (href: string): boolean => {
  return href === "/" || href.startsWith("/#")
}

const scrollToTarget = (target: string | number) => {
  gsap.to(window, {
    duration: SCROLL_DURATION,
    ease: SCROLL_EASE,
    scrollTo: {
      y: target,
      offsetY: typeof target === "number" ? 0 : HEADER_OFFSET,
      autoKill: true,
    },
  })
}

export const LandingHeader = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleScrollToHash = useCallback((hash: string) => {
    const el = document.getElementById(hash)
    if (!el) return
    scrollToTarget(`#${hash}`)
    window.history.pushState(null, "", `/#${hash}`)
  }, [])

  useEffect(() => {
    if (pathname !== "/") return

    const hash = window.location.hash.replace("#", "")
    if (!hash) return

    const frameId = requestAnimationFrame(() => {
      const el = document.getElementById(hash)
      if (!el) return
      scrollToTarget(`#${hash}`)
    })

    return () => cancelAnimationFrame(frameId)
  }, [pathname])

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!isInPageScrollHref(href)) {
      handleClose()
      return
    }

    if (pathname !== "/") {
      handleClose()
      return
    }

    event.preventDefault()
    handleClose()

    const hash = getHashFromHref(href)

    if (href === "/" || !hash) {
      scrollToTarget(0)
      window.history.pushState(null, "", "/")
      return
    }

    handleScrollToHash(hash)
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-surface-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-white transition-opacity hover:opacity-90"
          aria-label="Watchly home"
          onClick={(event) => handleNavClick(event, "/")}
        >
          <Image
            src="/Logo/Logo.png"
            alt=""
            width={100}
            height={100}
            priority
          />
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={(event) => handleNavClick(event, link.href)}
              className="text-sm font-medium text-text-muted transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium text-text-muted hover:bg-white/5 hover:text-white"
            aria-label="Sign in"
          >
            <Link href="/auth/sign-in" className="text-sm font-medium">
              Sign In
            </Link>
          </Button>
          <Button
            size="sm"
            className="h-9 rounded-full bg-amber-flame px-5 text-sm font-bold text-ink-black hover:bg-white"
            aria-label="Get started"
          >
            <Link href="/auth/sign-up" className="text-sm font-medium">
              Get Started
            </Link>
          </Button>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-lg text-white md:hidden",
              "transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-amber-flame/50 focus-visible:outline-none",
            )}
            aria-label="Open menu"
          >
            <Menu className="size-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="border-white/10 bg-surface-raised text-white"
          >
            <SheetHeader>
              <SheetTitle className="text-white">Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(event) => handleNavClick(event, link.href)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 border-t border-white/5 p-4">
              <Button
                variant="ghost"
                className="justify-start text-text-muted hover:bg-white/5 hover:text-white"
                aria-label="Sign in"
                onClick={handleClose}
              >
                <Link href="/auth/sign-in" className="text-sm font-medium">
                  Sign In
                </Link>
              </Button>
              <Button
                className="rounded-full bg-amber-flame font-bold text-ink-black hover:bg-white"
                aria-label="Get started"
                onClick={handleClose}
              >
                <Link href="/auth/sign-up" className="text-sm font-medium">
                  Get Started
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
