"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { useAppSocket } from "@/components/notifications/app-socket-provider"
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
  RoomReaction,
  RoomSocketStatus,
  RoomState,
} from "@/lib/room/types"
import { REACTION_OVERLAY_MS } from "@/lib/room/reactions"
import { createRoomSocket, type RoomSocket } from "@/lib/socket"

export type PendingAccessRequest = {
  userId: string
  username: string
  avatarUrl?: string | null
}

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
  reactions: RoomReaction[]
  playback: PlaybackState | null
  removalReason: RemovalReason
  pendingAccessRequests: PendingAccessRequest[]
  inRoomNotice: { id: number; message: string } | null
  socket: RoomSocket | null
  emit: <K extends ClientEventName>(
    event: K,
    payload: ClientToServerEvents[K]
  ) => void
  leave: () => void
  clearPendingAccess: (userId: string) => void
}

export const useRoomSocket = ({
  roomUid,
  currentUser,
}: UseRoomSocketOptions): UseRoomSocketResult => {
  const { registerSocket } = useAppSocket()
  const [status, setStatus] = useState<RoomSocketStatus>("connecting")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [reactions, setReactions] = useState<RoomReaction[]>([])
  const [pendingAccessRequests, setPendingAccessRequests] = useState<
    PendingAccessRequest[]
  >([])
  const [removalReason, setRemovalReason] = useState<RemovalReason>(null)
  const [inRoomNotice, setInRoomNotice] = useState<{
    id: number
    message: string
  } | null>(null)
  const [socket, setSocket] = useState<RoomSocket | null>(null)
  const socketRef = useRef<RoomSocket | null>(null)
  const joinedRef = useRef(false)
  const noticeIdRef = useRef(0)

  const userId = currentUser.id

  const clearPendingAccess = useCallback((targetUserId: string) => {
    setPendingAccessRequests((prev) =>
      prev.filter((item) => item.userId !== targetUserId)
    )
  }, [])

  useEffect(() => {
    let cancelled = false

    const connect = async () => {
      setStatus("connecting")
      setErrorMessage(null)
      setErrorCode(null)
      setRoomState(null)
      setMessages([])
      setReactions([])
      setPendingAccessRequests([])
      setRemovalReason(null)
      setInRoomNotice(null)
      setSocket(null)
      joinedRef.current = false

      let nextSocket: RoomSocket
      try {
        nextSocket = await createRoomSocket()
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
        nextSocket.disconnect()
        return
      }

      socketRef.current = nextSocket
      setSocket(nextSocket)
      registerSocket(nextSocket)

      const handleConnect = () => {
        const password = readRoomPassword(roomUid)
        nextSocket.emit("join_room", {
          roomUid,
          ...(password ? { password } : {}),
        })
      }

      nextSocket.on("connect", handleConnect)
      if (nextSocket.connected) {
        handleConnect()
      }

      nextSocket.on("connect_error", (err) => {
        setErrorCode("AUTH_FAILED")
        setErrorMessage(
          err.message || "Could not authenticate with the room server."
        )
        setStatus("error")
      })

      nextSocket.on("room_state", (state) => {
        joinedRef.current = true
        setRoomState({
          ...state,
          queue: state.queue ?? [],
        })
        setStatus("joined")
        setErrorMessage(null)
        setErrorCode(null)
      })

      nextSocket.on("error", (err) => {
        if (
          joinedRef.current &&
          (err.code === "RATE_LIMITED" || err.code === "FORBIDDEN")
        ) {
          noticeIdRef.current += 1
          setInRoomNotice({
            id: noticeIdRef.current,
            message: err.message || messageForRoomError(err.code, err.message),
          })
          return
        }
        setErrorCode(err.code)
        setErrorMessage(messageForRoomError(err.code, err.message))
        setStatus("error")
        nextSocket.disconnect()
      })

      nextSocket.on("user_joined", ({ user: joined }) => {
        setRoomState((prev) => {
          if (!prev) return prev
          if (prev.participants.some((p) => p.id === joined.id)) return prev
          return {
            ...prev,
            participants: [...prev.participants, joined],
          }
        })
        setPendingAccessRequests((prev) =>
          prev.filter((item) => item.userId !== joined.id)
        )
      })

      nextSocket.on("user_left", ({ userId: leftId }) => {
        setRoomState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            participants: prev.participants.filter((p) => p.id !== leftId),
          }
        })
      })

      nextSocket.on("chat_message", (message) => {
        setMessages((prev) => [...prev, message])
      })

      nextSocket.on("reaction_received", (reaction) => {
        const id = `${reaction.userId}-${reaction.timestamp}-${reaction.emoji}-${Math.random().toString(36).slice(2, 8)}`
        const item: RoomReaction = {
          id,
          userId: reaction.userId,
          emoji: reaction.emoji,
          timestamp: reaction.timestamp,
          offsetPercent: 12 + Math.random() * 76,
        }
        setReactions((prev) => [...prev, item])
        window.setTimeout(() => {
          setReactions((prev) => prev.filter((entry) => entry.id !== id))
        }, REACTION_OVERLAY_MS)
      })

      nextSocket.on("playback_sync", (sync) => {
        setRoomState((prev) => {
          if (!prev) return prev
          const { videoUrl: nextUrl, ...playback } = sync
          return {
            ...prev,
            ...(nextUrl ? { videoUrl: nextUrl } : {}),
            playbackState: playback,
          }
        })
      })

      nextSocket.on("queue_state", ({ videoUrl, queue }) => {
        setRoomState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            videoUrl,
            queue,
          }
        })
      })

      nextSocket.on(
        "playback_control_granted",
        ({ userId: targetId, granted }) => {
          setRoomState((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              participants: prev.participants.map((p) =>
                p.id === targetId ? { ...p, hasPlaybackControl: granted } : p
              ),
            }
          })
        }
      )

      nextSocket.on(
        "queue_control_granted",
        ({ userId: targetId, granted }) => {
          setRoomState((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              participants: prev.participants.map((p) =>
                p.id === targetId ? { ...p, hasQueueControl: granted } : p
              ),
            }
          })
        }
      )

      nextSocket.on("user_muted", ({ userId: targetId, muted, byAdmin }) => {
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

      nextSocket.on("admin_changed", ({ newAdminId }) => {
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
                  hasQueueControl: true,
                }
              }
              if (p.role === "admin") {
                return {
                  ...p,
                  role: "viewer",
                  hasPlaybackControl: false,
                  hasQueueControl: false,
                }
              }
              return p
            }),
          }
        })
      })

      nextSocket.on("user_kicked", ({ userId: targetId }) => {
        if (targetId === userId) {
          setRemovalReason("kicked")
          setStatus("removed")
          nextSocket.disconnect()
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

      nextSocket.on("user_banned", ({ userId: targetId }) => {
        if (targetId === userId) {
          setRemovalReason("banned")
          setStatus("removed")
          nextSocket.disconnect()
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

      nextSocket.on("access_requested", (payload) => {
        if (payload.roomUid !== roomUid) return
        setPendingAccessRequests((prev) => {
          if (prev.some((item) => item.userId === payload.userId)) return prev
          return [
            ...prev,
            {
              userId: payload.userId,
              username: payload.username || "Someone",
              avatarUrl: payload.avatarUrl ?? null,
            },
          ]
        })
      })

      nextSocket.on("disconnect", () => {
        setStatus((prev) =>
          prev === "joined" || prev === "connecting" ? "connecting" : prev
        )
      })
    }

    void connect()

    return () => {
      cancelled = true
      registerSocket(null)
      socketRef.current?.disconnect()
      socketRef.current = null
      setSocket(null)
    }
  }, [roomUid, userId, registerSocket])

  const emit = useCallback(
    <K extends ClientEventName>(
      event: K,
      payload: ClientToServerEvents[K]
    ) => {
      if (!socketRef.current) return
      ;(
        socketRef.current.emit as (
          event: K,
          payload: ClientToServerEvents[K]
        ) => void
      )(event, payload)
    },
    []
  )

  const leave = useCallback(() => {
    socketRef.current?.emit("leave_room", {})
    socketRef.current?.disconnect()
    setStatus("left")
  }, [])

  return {
    status,
    errorMessage,
    errorCode,
    roomState,
    participants: roomState?.participants ?? [],
    messages,
    reactions,
    playback: roomState?.playbackState ?? null,
    removalReason,
    pendingAccessRequests,
    inRoomNotice,
    socket,
    emit,
    leave,
    clearPendingAccess,
  }
}
