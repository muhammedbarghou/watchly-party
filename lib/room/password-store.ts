const passwordKey = (roomUid: string) =>
  `watchly:room-password:${roomUid.trim().toLowerCase()}`

const createMetaKey = (roomUid: string) =>
  `watchly:room-create:${roomUid.trim().toLowerCase()}`

export type CreatedRoomMeta = {
  name: string | null
  videoUrl: string
  password?: string
  isPrivate: boolean
}

export const stashRoomPassword = (roomUid: string, password: string) => {
  if (typeof window === "undefined") return
  if (!password) return
  sessionStorage.setItem(passwordKey(roomUid), password)
}

export const readRoomPassword = (roomUid: string): string | undefined => {
  if (typeof window === "undefined") return undefined
  return sessionStorage.getItem(passwordKey(roomUid)) ?? undefined
}

export const clearRoomPassword = (roomUid: string) => {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(passwordKey(roomUid))
}

export const stashCreatedRoomMeta = (
  roomUid: string,
  meta: CreatedRoomMeta
) => {
  if (typeof window === "undefined") return
  sessionStorage.setItem(createMetaKey(roomUid), JSON.stringify(meta))
  if (meta.password) {
    stashRoomPassword(roomUid, meta.password)
  }
}

export const readCreatedRoomMeta = (
  roomUid: string
): CreatedRoomMeta | null => {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(createMetaKey(roomUid))
  if (!raw) return null
  try {
    return JSON.parse(raw) as CreatedRoomMeta
  } catch {
    return null
  }
}

export const clearCreatedRoomMeta = (roomUid: string) => {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(createMetaKey(roomUid))
}
