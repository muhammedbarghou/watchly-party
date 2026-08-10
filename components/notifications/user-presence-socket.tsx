"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

import { useAppSocket } from "@/components/notifications/app-socket-provider"
import { useNotifications } from "@/components/notifications/notification-provider"
import { createRoomSocket, type RoomSocket } from "@/lib/socket"

/**
 * Keeps an authenticated socket alive outside /room/* so invites and access
 * responses can reach the user on home/friends/settings.
 */
export const UserPresenceSocket = () => {
  const router = useRouter()
  const { registerSocket } = useAppSocket()
  const { pushInboxNotification, notify } = useNotifications()
  const socketRef = useRef<RoomSocket | null>(null)

  useEffect(() => {
    let cancelled = false

    const connect = async () => {
      let socket: RoomSocket
      try {
        socket = await createRoomSocket()
      } catch {
        return
      }

      if (cancelled) {
        socket.disconnect()
        return
      }

      socketRef.current = socket
      registerSocket(socket)

      socket.on("room_invited", (payload) => {
        const fromName = payload.fromUsername || "A friend"
        pushInboxNotification({
          id: `invite-${payload.roomUid}-${payload.fromUserId}`,
          type: "room_invite",
          title: "Room invite",
          body: `${fromName} invited you to ${
            payload.roomName?.trim() || "a watch room"
          }`,
          actorUsername: payload.fromUsername,
          actorAvatarUrl: payload.fromAvatarUrl,
          roomUid: payload.roomUid,
          fromUserId: payload.fromUserId,
        })
        notify(`${fromName} invited you to a room`)
      })

      socket.on("access_requested", (payload) => {
        const username = payload.username || "Someone"
        pushInboxNotification({
          id: `access-${payload.roomUid}-${payload.userId}`,
          type: "access_request",
          title: "Access request",
          body: `${username} wants to join room ${payload.roomUid}`,
          actorUsername: payload.username,
          actorAvatarUrl: payload.avatarUrl,
          roomUid: payload.roomUid,
          fromUserId: payload.userId,
        })
        notify(`${username} requested room access`)
      })

      socket.on("access_approved", (payload) => {
        notify("Access approved — joining room")
        router.push(`/room/${payload.roomUid}`)
      })

      socket.on("access_denied", () => {
        notify("Access request was denied")
      })
    }

    void connect()

    return () => {
      cancelled = true
      registerSocket(null)
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [notify, pushInboxNotification, registerSocket, router])

  return null
}
