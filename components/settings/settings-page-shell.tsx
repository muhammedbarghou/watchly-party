"use client"

import { useState } from "react"

import { AccountSettings } from "@/components/settings/account-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { usePreferences } from "@/components/settings/preferences-provider"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { RoomDefaultsSettings } from "@/components/settings/room-defaults-settings"
import {
  SETTINGS_NAV_ITEMS,
  SettingsNav,
} from "@/components/settings/settings-nav"
import { VoiceSettings } from "@/components/settings/voice-settings"
import type {
  SettingsProfile,
  SettingsSectionId,
  UserPreferences,
} from "@/lib/settings/types"

type SettingsPageShellProps = {
  profile: SettingsProfile
  preferences: UserPreferences
  initialSection?: SettingsSectionId
}

export const SettingsPageShell = ({
  profile: initialProfile,
  preferences: initialPreferences,
  initialSection = "profile",
}: SettingsPageShellProps) => {
  const { preferences: contextPreferences, setPreferences } = usePreferences()
  const [section, setSection] = useState<SettingsSectionId>(initialSection)
  const [profile, setProfile] = useState(initialProfile)

  const preferences =
    contextPreferences.userId === initialPreferences.userId
      ? contextPreferences
      : initialPreferences

  const handlePreferencesChange = (next: UserPreferences) => {
    setPreferences(next)
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <p className="mb-1 text-xs tracking-[0.2em] text-amber-flame uppercase">
          Settings
        </p>
        <h1 className="font-serif text-3xl text-[#f3eadc] sm:text-4xl">
          Your Watchly
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#f3eadc]/60">
          Profile, security, notifications, and how new rooms and voice behave.
        </p>
      </div>

      <div className="mb-6 md:hidden">
        <label htmlFor="settings-section-select" className="sr-only">
          Settings section
        </label>
        <select
          id="settings-section-select"
          value={section}
          onChange={(event) =>
            setSection(event.target.value as SettingsSectionId)
          }
          className="h-10 w-full rounded-md border border-night-bordeaux/60 bg-white/5 px-3 text-sm text-[#f3eadc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-flame/60"
          aria-label="Settings section"
        >
          {SETTINGS_NAV_ITEMS.map((item) => (
            <option key={item.id} value={item.id} className="bg-ink-black">
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden border-r border-night-bordeaux/40 pr-4 md:block">
          <SettingsNav activeSection={section} onSectionChange={setSection} />
        </aside>

        <div className="min-w-0">
          {section === "profile" ? (
            <ProfileSettings
              profile={profile}
              onProfileChange={setProfile}
            />
          ) : null}
          {section === "account" ? (
            <AccountSettings profile={profile} />
          ) : null}
          {section === "notifications" ? (
            <NotificationSettings
              preferences={preferences}
              onPreferencesChange={handlePreferencesChange}
            />
          ) : null}
          {section === "room-defaults" ? (
            <RoomDefaultsSettings
              preferences={preferences}
              onPreferencesChange={handlePreferencesChange}
            />
          ) : null}
          {section === "voice" ? (
            <VoiceSettings
              preferences={preferences}
              onPreferencesChange={handlePreferencesChange}
            />
          ) : null}
        </div>
      </div>
    </main>
  )
}
