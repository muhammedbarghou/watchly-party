"use client"

import type { LucideIcon } from "lucide-react"
import {
  BellIcon,
  DoorOpenIcon,
  MicIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { SettingsSectionId } from "@/lib/settings/types"

type SettingsNavItem = {
  id: SettingsSectionId
  label: string
  description: string
  icon: LucideIcon
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Username and avatar",
    icon: UserIcon,
  },
  {
    id: "account",
    label: "Account",
    description: "Password and deletion",
    icon: ShieldIcon,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Inbox and toasts",
    icon: BellIcon,
  },
  {
    id: "room-defaults",
    label: "Room defaults",
    description: "New room privacy",
    icon: DoorOpenIcon,
  },
  {
    id: "voice",
    label: "Voice",
    description: "Mic when joining",
    icon: MicIcon,
  },
]

type SettingsNavProps = {
  activeSection: SettingsSectionId
  onSectionChange: (section: SettingsSectionId) => void
}

export const SettingsNav = ({
  activeSection,
  onSectionChange,
}: SettingsNavProps) => {
  return (
    <nav aria-label="Settings sections" className="flex flex-col gap-1">
      {SETTINGS_NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = item.id === activeSection

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSectionChange(item.id)}
            aria-current={isActive ? "page" : undefined}
            aria-label={`${item.label}: ${item.description}`}
            className={cn(
              "flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-flame/60",
              isActive
                ? "bg-white/5 text-[#f3eadc]"
                : "text-[#f3eadc]/65 hover:bg-white/[0.03] hover:text-[#f3eadc]"
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 size-4 shrink-0",
                isActive ? "text-amber-flame" : "text-[#f3eadc]/45"
              )}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="mt-0.5 block text-xs text-[#f3eadc]/45">
                {item.description}
              </span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}
