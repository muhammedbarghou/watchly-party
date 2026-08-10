"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { FriendsProvider } from "@/components/friends/friends-provider"
import { AppNav } from "@/components/home/app-nav"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { NotificationToastRegion } from "@/components/notifications/notification-toast-region"

type ProtectedShellProps = {
  children: ReactNode
  displayName: string
  avatarUrl?: string | null
}

export const ProtectedShell = ({
  children,
  displayName,
  avatarUrl,
}: ProtectedShellProps) => {
  const pathname = usePathname()
  const hideAppNav = pathname.startsWith("/room/")

  return (
    <NotificationProvider>
      <FriendsProvider>
        <div className="min-h-screen bg-ink-black text-[#f3eadc]">
          {hideAppNav ? null : (
            <AppNav displayName={displayName} avatarUrl={avatarUrl} />
          )}
          {children}
          <NotificationToastRegion />
        </div>
      </FriendsProvider>
    </NotificationProvider>
  )
}
