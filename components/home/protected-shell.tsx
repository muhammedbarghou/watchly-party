"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { FriendsProvider } from "@/components/friends/friends-provider"
import { AppNav } from "@/components/home/app-nav"
import { AppSocketProvider } from "@/components/notifications/app-socket-provider"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { NotificationToastRegion } from "@/components/notifications/notification-toast-region"
import { UserPresenceSocket } from "@/components/notifications/user-presence-socket"
import { PreferencesProvider } from "@/components/settings/preferences-provider"
import type { UserPreferences } from "@/lib/settings/types"

type ProtectedShellProps = {
  children: ReactNode
  displayName: string
  avatarUrl?: string | null
  preferences: UserPreferences
}

export const ProtectedShell = ({
  children,
  displayName,
  avatarUrl,
  preferences,
}: ProtectedShellProps) => {
  const pathname = usePathname()
  const hideAppNav = pathname.startsWith("/room/")
  const usePresenceSocket = !pathname.startsWith("/room/")

  return (
    <PreferencesProvider initialPreferences={preferences}>
      <AppSocketProvider>
        <NotificationProvider>
          <FriendsProvider>
            {usePresenceSocket ? <UserPresenceSocket /> : null}
            <div className="min-h-screen bg-ink-black text-[#f3eadc]">
              {hideAppNav ? null : (
                <AppNav displayName={displayName} avatarUrl={avatarUrl} />
              )}
              {children}
              <NotificationToastRegion />
            </div>
          </FriendsProvider>
        </NotificationProvider>
      </AppSocketProvider>
    </PreferencesProvider>
  )
}
