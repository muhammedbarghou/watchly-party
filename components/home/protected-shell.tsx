"use client"

import type { ReactNode } from "react"

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
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-ink-black text-[#f3eadc]">
        <AppNav displayName={displayName} avatarUrl={avatarUrl} />
        {children}
        <NotificationToastRegion />
      </div>
    </NotificationProvider>
  )
}
