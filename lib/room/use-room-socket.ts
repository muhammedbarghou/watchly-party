"use client"

import { useEffect, useRef, useState } from "react"

import { createMockRoomSocket } from "@/lib/room/mock-socket"
import {
  clearCreatedRoomMeta,
  readCreatedRoomMeta,
  readRoomPassword,
} from "@/lib/room/password-store"
import { registerDynamicRoom } from "@/lib/room/fixtures"
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

type UseRoomSocketOptions = {
  roomUid: string
  currentUser: CurrentUser
}

type UseRoomSocketResult = {
  status: RoomSocketStatus
  errorMessage: string | null
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
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [removalReason, setRemovalReason] = useState<RemovalReason>(null)
  const socketRef = useRef<ReturnType<typeof createMockRoomSocket> | null>(
    null
  )

  const userId = currentUser.id
  const username = currentUser.username
  const avatarUrl = currentUser.avatarUrl

  useEffect(() => {
    const user: CurrentUser = { id: userId, username, avatarUrl }
    const created = readCreatedRoomMeta(roomUid)
    if (created) {
      registerDynamicRoom({
        roomUid,
        name: created.name,
        videoUrl: created.videoUrl,
        adminId: user.id,
        requiresPassword: created.isPrivate,
        password: created.password,
        participants: [
          {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
            role: "admin",
            muted: false,
            mutedByAdmin: false,
            hasPlaybackControl: true,
          },
        ],
        playbackState: {
          status: "paused",
          positionMs: 0,
          serverTime: Date.now(),
        },
      })
      clearCreatedRoomMeta(roomUid)
    }

    const socket = createMockRoomSocket(user)
    socketRef.current = socket

    const unsubs = [
      socket.on("room_state", (state) => {
        setRoomState(state)
        setStatus("joined")
        setErrorMessage(null)
      }),
      socket.on("error", (err) => {
        setErrorMessage(err.message)
        setStatus("error")
      }),
      socket.on("user_joined", ({ user: joined }) => {
        setRoomState((prev) => {
          if (!prev) return prev
          if (prev.participants.some((p) => p.id === joined.id)) return prev
          return {
            ...prev,
            participants: [...prev.participants, joined],
          }
        })
      }),
      socket.on("user_left", ({ userId: leftId }) => {
        setRoomState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            participants: prev.participants.filter((p) => p.id !== leftId),
          }
        })
      }),
      socket.on("chat_message", (message) => {
        setMessages((prev) => [...prev, message])
      }),
      socket.on("playback_sync", (sync) => {
        setRoomState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            playbackState: { ...sync },
          }
        })
      }),
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
      }),
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
      }),
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
      }),
      socket.on("user_kicked", ({ userId: targetId }) => {
        if (targetId === user.id) {
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
      }),
      socket.on("user_banned", ({ userId: targetId }) => {
        if (targetId === user.id) {
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
      }),
    ]

    const password = readRoomPassword(roomUid)
    socket.emit("join_room", {
      roomUid,
      ...(password ? { password } : {}),
    })

    return () => {
      unsubs.forEach((unsub) => unsub())
      socket.disconnect()
      socketRef.current = null
    }
  }, [roomUid, userId, username, avatarUrl])

  const emit = <K extends ClientEventName>(
    event: K,
    payload: ClientToServerEvents[K]
  ) => {
    socketRef.current?.emit(event, payload)
  }

  const leave = () => {
    socketRef.current?.emit("leave_room", {})
    socketRef.current?.disconnect()
    setStatus("left")
  }

  return {
    status,
    errorMessage,
    roomState,
    participants: roomState?.participants ?? [],
    messages,
    playback: roomState?.playbackState ?? null,
    removalReason,
    emit,
    leave,
  }
}
