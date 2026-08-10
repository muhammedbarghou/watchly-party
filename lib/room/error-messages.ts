const ROOM_ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: "This room doesn't exist.",
  BAD_PASSWORD: "Incorrect password, or this room requires a password.",
  BANNED: "You've been banned from this room.",
  FORBIDDEN: "You don't have permission to do that.",
  ROOM_FULL: "This room is full.",
  ROOM_CLOSED: "This room is closed.",
  RATE_LIMITED: "Too many join attempts. Wait a moment and try again.",
}

export const messageForRoomError = (
  code: string,
  fallbackMessage?: string
): string => {
  return (
    ROOM_ERROR_MESSAGES[code] ??
    fallbackMessage ??
    "Something went wrong joining the room."
  )
}
