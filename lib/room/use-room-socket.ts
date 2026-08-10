"use client"

import { useEffect, useRef, useState } from "react"

import { messageForRoomError } from "@/lib/room/error-messages"
import { readRoomPassword } from "@/lib/room/password-store"
import type {
  ChatMessage,
  ClientEventName,
  ClientToServerEvents,
  CurrentUser,
  PlaybackState,
  RemovalReason,
  RoomParticipant,
  RoomSocketStatus,
  RoomState,
} from "@/lib/room/types"
import { createRoomSocket, type RoomSocket } from "@/lib/socket"

type UseRoomSocketOptions = {
  roomUid: string
  currentUser: CurrentUser
}

type UseRoomSocketResult = {
  status: RoomSocketStatus
  errorMessage: string | null
  errorCode: string | null
  roomState: RoomState | null
  participants: RoomParticipant[]
  messages: ChatMessage[]
  playback: PlaybackState | null
  removalReason: RemovalReason
  emit: <K extends ClientEventName>(
    event: K,
    payload: ClientToServerEvents[K]
  ) => void
  leave: () => void
}

export const useRoomSocket = ({
  roomUid,
  currentUser,
}: UseRoomSocketOptions): UseRoomSocketResult => {
  const [status, setStatus] = useState<RoomSocketStatus>("connecting")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [removalReason, setRemovalReason] = useState<RemovalReason>(null)
  const socketRef = useRef<RoomSocket | null>(null)

  const userId = currentUser.id

  useEffect(() => {
    let cancelled = false

    const connect = async () => {
      setStatus("connecting")
      setErrorMessage(null)
      setErrorCode(null)
      setRoomState(null)
      setMessages([])
      setRemovalReason(null)

      let socket: RoomSocket
      try {
        socket = await createRoomSocket()
      } catch (error) {
        if (cancelled) return
        setErrorCode("CONNECT_FAILED")
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not connect to the room server."
        )
        setStatus("error")
        return
      }

      if (cancelled) {
        socket.disconnect()
        return
      }

      socketRef.current = socket

      const handleConnect = () => {
        const password = readRoomPassword(roomUid)
        socket.emit("join_room", {
          roomUid,
          ...(password ? { password } : {}),
        })
      }

      socket.on("connect", handleConnect)
      if (socket.connected) {
        handleConnect()
      }

      socket.on("connect_error", (err) => {
        setErrorCode("AUTH_FAILED")
        setErrorMessage(
          err.message || "Could not authenticate with the room server."
        )
        setStatus("error")
      })

      socket.on("room_state", (state) => {
        setRoomState(state)
        setStatus("joined")
        setErrorMessage(null)
        setErrorCode(null)
      })

      socket.on("error", (err) => {
        setErrorCode(err.code)
        setErrorMessage(messageForRoomError(err.code, err.message))
        setStatus("error")
        socket.disconnect()
      })

      socket.on("user_joined", ({ user: joined }) => {
        setRoomState((prev) => {
          if (!prev) return prev
          if (prev.participants.some((p) => p.id === joined.id)) return prev
          return {
            ...prev,
            participants: [...prev.participants, joined],
          }
        })
      })

      socket.on("user_left", ({ userId: leftId }) => {
        setRoomState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            participants: prev.participants.filter((p) => p.id !== leftId),
          }
        })
      })

      socket.on("chat_message", (message) => {
        setMessages((prev) => [...prev, message])
      })

      socket.on("playback_sync", (sync) => {
        setRoomState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            playbackState: { ...sync },
          }
        })
      })

      socket.on("playback_control_granted", ({ userId: targetId, granted }) => {
        setRoomState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            participants: prev.participants.map((p) =>
              p.id === targetId ? { ...p, hasPlaybackControl: granted } : p
            ),
          }
        })
      })

      socket.on("user_muted", ({ userId: targetId, muted, byAdmin }) => {
        setRoomState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            participants: prev.participants.map((p) =>
              p.id === targetId
                ? {
                    ...p,
                    muted,
                    mutedByAdmin: byAdmin
                      ? muted
                      : muted
                        ? p.mutedByAdmin
                        : false,
                  }
                : p
            ),
          }
        })
      })

      socket.on("admin_changed", ({ newAdminId }) => {
        setRoomState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            adminId: newAdminId,
            participants: prev.participants.map((p) => {
              if (p.id === newAdminId) {
                return {
                  ...p,
                  role: "admin",
                  hasPlaybackControl: true,
                }
              }
              if (p.role === "admin") {
                return { ...p, role: "viewer" }
              }
              return p
            }),
          }
        })
      })

      socket.on("user_kicked", ({ userId: targetId }) => {
        if (targetId === userId) {
          setRemovalReason("kicked")
          setStatus("removed")
          socket.disconnect()
          return
        }
        setRoomState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            participants: prev.participants.filter((p) => p.id !== targetId),
          }
        })
      })

      socket.on("user_banned", ({ userId: targetId }) => {
        if (targetId === userId) {
          setRemovalReason("banned")
          setStatus("removed")
          socket.disconnect()
          return
        }
        setRoomState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            participants: prev.participants.filter((p) => p.id !== targetId),
          }
        })
      })

      socket.on("disconnect", () => {
        setStatus((prev) =>
          prev === "joined" || prev === "connecting" ? "connecting" : prev
        )
      })
    }

    void connect()

    return () => {
      cancelled = true
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [roomUid, userId])

  const emit = <K extends ClientEventName>(
    event: K,
    payload: ClientToServerEvents[K]
  ) => {
    if (!socketRef.current) return
    // Payload-map types ↔ Socket.io callback-map Parameters
    ;(socketRef.current.emit as (event: K, payload: ClientToServerEvents[K]) => void)(
      event,
      payload
    )
  }

  const leave = () => {
    socketRef.current?.emit("leave_room", {})
    socketRef.current?.disconnect()
    setStatus("left")
  }

  return {
    status,
    errorMessage,
    errorCode,
    roomState,
    participants: roomState?.participants ?? [],
    messages,
    playback: roomState?.playbackState ?? null,
    removalReason,
    emit,
    leave,
  }
}
