"use client"

import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react"

import { NotificationBell } from "@/components/notifications/notification-bell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"

type AppNavProps = {
  displayName: string
  avatarUrl?: string | null
}

type AccountMenuLink = {
  label: string
  href: string
  icon: LucideIcon
}

const accountMenuLinks: AccountMenuLink[] = [
  { label: "Profile", href: "/profile", icon: UserIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
]

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export const AppNav = ({ displayName, avatarUrl }: AppNavProps) => {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/sign-in")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-night-bordeaux/40 bg-ink-black/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/home-page"
          className="font-serif text-lg tracking-wide text-[#f3eadc] transition-colors hover:text-amber-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-flame/60"
          aria-label="Watchly home"
        >
          Watchly
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-[#f3eadc] hover:bg-white/5"
                  aria-label="Account menu"
                />
              }
            >
              <Avatar size="sm">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                <AvatarFallback className="bg-night-bordeaux text-[10px] text-[#f3eadc]">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-48 border-night-bordeaux/50 bg-ink-black text-[#f3eadc]"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[#f3eadc]/70">
                  {displayName}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-night-bordeaux/40" />
              <DropdownMenuGroup>
                {accountMenuLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem
                      key={item.href}
                      className="gap-2"
                      render={<Link href={item.href} />}
                    >
                      <Icon />
                      {item.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-night-bordeaux/40" />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  className="gap-2"
                  onClick={handleSignOut}
                >
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
