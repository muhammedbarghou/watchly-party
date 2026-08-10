export type SettingsProfile = {
  id: string
  username: string
  avatarUrl: string | null
  email: string | null
  hasPasswordProvider: boolean
  hasGoogleProvider: boolean
}

export type UserPreferences = {
  userId: string
  notifyFriendRequest: boolean
  notifyRoomInvite: boolean
  notifyAccessRequest: boolean
  notifyToastsEnabled: boolean
  defaultRoomPrivate: boolean
  defaultVisibleToFriends: boolean
  joinVoiceMuted: boolean
  updatedAt: string
}

export type UserPreferencesUpdate = Partial<
  Omit<UserPreferences, "userId" | "updatedAt">
>

export const DEFAULT_USER_PREFERENCES: Omit<
  UserPreferences,
  "userId" | "updatedAt"
> = {
  notifyFriendRequest: true,
  notifyRoomInvite: true,
  notifyAccessRequest: true,
  notifyToastsEnabled: true,
  defaultRoomPrivate: false,
  defaultVisibleToFriends: true,
  joinVoiceMuted: false,
}

export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 24
export const USERNAME_PATTERN = /^[a-z0-9._-]+$/

export type SettingsSectionId =
  | "profile"
  | "account"
  | "notifications"
  | "room-defaults"
  | "voice"
