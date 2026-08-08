"use client"

import { useState } from "react"
import Image from "next/image"
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
import Link from "next/link"

export const LandingHeader = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-surface-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Link
          href="#"
          className="flex items-center gap-2.5 text-white transition-opacity hover:opacity-90"
          aria-label="Watchly home"
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
            <Link href="/auth/sign-in" className="text-sm font-medium">Sign In</Link>
          </Button>
          <Button
            size="sm"
            className="h-9 rounded-full bg-amber-flame px-5 text-sm font-bold text-ink-black hover:bg-white"
            aria-label="Get started"
          >
            <Link href="/auth/sign-up" className="text-sm font-medium">Get Started</Link>
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
                  onClick={handleClose}
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
                <Link href="/auth/sign-in" className="text-sm font-medium">Sign In</Link>
              </Button>
              <Button
                className="rounded-full bg-amber-flame font-bold text-ink-black hover:bg-white"
                aria-label="Get started"
                onClick={handleClose}
              >
                <Link href="/auth/sign-up" className="text-sm font-medium">Get Started</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
