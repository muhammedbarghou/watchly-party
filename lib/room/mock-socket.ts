import {
  buildInitialRoomState,
  getRoomSeed,
  registerDynamicRoom,
} from "@/lib/room/fixtures"
import type {
  ChatMessage,
  ClientEventName,
  ClientToServerEvents,
  CurrentUser,
  RoomParticipant,
  RoomState,
  ServerEventName,
  ServerToClientEvents,
} from "@/lib/room/types"

type Handler<T> = (payload: T) => void

type ListenerMap = {
  [K in ServerEventName]?: Set<Handler<ServerToClientEvents[K]>>
}

/**
 * In-memory Socket.io-shaped bus for the room page.
 * RTC signaling (`rtc_*`) is intentionally omitted until the real server ships.
 */
export class MockRoomSocket {
  private listeners: ListenerMap = {}
  private room: RoomState | null = null
  private self: CurrentUser
  private heartbeat: ReturnType<typeof setInterval> | null = null
  private closed = false

  constructor(self: CurrentUser) {
    this.self = self
  }

  on = <K extends ServerEventName>(
    event: K,
    handler: Handler<ServerToClientEvents[K]>
  ) => {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set() as ListenerMap[K]
    }
    ;(this.listeners[event] as Set<Handler<ServerToClientEvents[K]>>).add(
      handler
    )
    return () => {
      ;(this.listeners[event] as Set<Handler<ServerToClientEvents[K]>>).delete(
        handler
      )
    }
  }

  private emitServer = <K extends ServerEventName>(
    event: K,
    payload: ServerToClientEvents[K]
  ) => {
    if (this.closed) return
    const set = this.listeners[event] as
      | Set<Handler<ServerToClientEvents[K]>>
      | undefined
    set?.forEach((handler) => handler(payload))
  }

  emit = <K extends ClientEventName>(
    event: K,
    payload: ClientToServerEvents[K]
  ) => {
    if (this.closed) return

    switch (event) {
      case "join_room":
        this.handleJoin(payload as ClientToServerEvents["join_room"])
        break
      case "leave_room":
        this.handleLeave()
        break
      case "chat_message":
        this.handleChat(payload as ClientToServerEvents["chat_message"])
        break
      case "playback_control":
        this.handlePlayback(
          payload as ClientToServerEvents["playback_control"]
        )
        break
      case "grant_playback_control":
        this.handleGrant(
          payload as ClientToServerEvents["grant_playback_control"]
        )
        break
      case "kick_user":
        this.handleKick(payload as ClientToServerEvents["kick_user"])
        break
      case "mute_user":
        this.handleMute(payload as ClientToServerEvents["mute_user"])
        break
      case "ban_user":
        this.handleBan(payload as ClientToServerEvents["ban_user"])
        break
      case "transfer_admin":
        this.handleTransfer(payload as ClientToServerEvents["transfer_admin"])
        break
      case "self_mute":
        this.handleSelfMute(payload as ClientToServerEvents["self_mute"])
        break
      case "sync_ping":
        break
      default:
        break
    }
  }

  disconnect = () => {
    this.closed = true
    this.stopHeartbeat()
    this.listeners = {}
    this.room = null
  }

  private assertAdmin = (): boolean => {
    if (!this.room) return false
    return this.room.adminId === this.self.id
  }

  private canControlPlayback = (): boolean => {
    if (!this.room) return false
    if (this.room.adminId === this.self.id) return true
    const self = this.room.participants.find((p) => p.id === this.self.id)
    return Boolean(self?.hasPlaybackControl)
  }

  private handleJoin = (payload: ClientToServerEvents["join_room"]) => {
    window.setTimeout(() => {
      if (this.closed) return

      const seed = getRoomSeed(payload.roomUid)
      if (seed?.requiresPassword) {
        if (!payload.password || payload.password !== seed.password) {
          this.emitServer("error", {
            code: "BAD_PASSWORD",
            message: payload.password
              ? "Incorrect password."
              : "This room requires a password.",
          })
          return
        }
      }

      if (
        payload.roomUid.trim().toLowerCase() === "missing" ||
        payload.roomUid.trim().toLowerCase() === "gone"
      ) {
        this.emitServer("error", {
          code: "NOT_FOUND",
          message: "Room not found.",
        })
        return
      }

      const state = buildInitialRoomState(payload.roomUid, this.self)
      if (!state) {
        this.emitServer("error", {
          code: "NOT_FOUND",
          message: "Room not found.",
        })
        return
      }

      this.room = state
      registerDynamicRoom(state)
      this.emitServer("room_state", {
        ...state,
        participants: state.participants.map((p) => ({ ...p })),
        playbackState: { ...state.playbackState, serverTime: Date.now() },
      })
      this.startHeartbeat()
    }, 350)
  }

  private handleLeave = () => {
    this.stopHeartbeat()
    if (this.room && this.room.adminId === this.self.id) {
      this.promoteFallbackAdmin(this.self.id)
    }
    this.room = null
  }

  private handleChat = (payload: ClientToServerEvents["chat_message"]) => {
    if (!this.room) return
    const text = payload.text.trim()
    if (!text) return
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: this.self.id,
      username: this.self.username,
      text,
      timestamp: Date.now(),
    }
    this.emitServer("chat_message", message)
  }

  private handlePlayback = (
    payload: ClientToServerEvents["playback_control"]
  ) => {
    if (!this.room || !this.canControlPlayback()) {
      this.emitServer("error", {
        code: "FORBIDDEN",
        message: "You do not have playback control.",
      })
      return
    }

    const nextStatus =
      payload.action === "play"
        ? "playing"
        : payload.action === "pause"
          ? "paused"
          : this.room.playbackState.status

    this.room.playbackState = {
      status: nextStatus,
      positionMs: Math.max(0, payload.positionMs),
      serverTime: Date.now(),
    }

    this.emitServer("playback_sync", { ...this.room.playbackState })
  }

  private handleGrant = (
    payload: ClientToServerEvents["grant_playback_control"]
  ) => {
    if (!this.room || !this.assertAdmin()) {
      this.emitServer("error", {
        code: "FORBIDDEN",
        message: "Only the admin can grant playback control.",
      })
      return
    }

    this.room.participants = this.room.participants.map((p) =>
      p.id === payload.targetUserId
        ? { ...p, hasPlaybackControl: payload.granted }
        : p
    )
    this.emitServer("playback_control_granted", {
      userId: payload.targetUserId,
      granted: payload.granted,
    })
  }

  private handleKick = (payload: ClientToServerEvents["kick_user"]) => {
    if (!this.room || !this.assertAdmin()) {
      this.emitServer("error", {
        code: "FORBIDDEN",
        message: "Only the admin can kick participants.",
      })
      return
    }
    if (payload.targetUserId === this.self.id) return

    this.emitServer("user_kicked", { userId: payload.targetUserId })
    this.room.participants = this.room.participants.filter(
      (p) => p.id !== payload.targetUserId
    )
    this.emitServer("user_left", { userId: payload.targetUserId })
  }

  private handleBan = (payload: ClientToServerEvents["ban_user"]) => {
    if (!this.room || !this.assertAdmin()) {
      this.emitServer("error", {
        code: "FORBIDDEN",
        message: "Only the admin can ban participants.",
      })
      return
    }
    if (payload.targetUserId === this.self.id) return

    this.emitServer("user_banned", { userId: payload.targetUserId })
    this.room.participants = this.room.participants.filter(
      (p) => p.id !== payload.targetUserId
    )
    this.emitServer("user_left", { userId: payload.targetUserId })
  }

  private handleTransfer = (
    payload: ClientToServerEvents["transfer_admin"]
  ) => {
    if (!this.room || !this.assertAdmin()) {
      this.emitServer("error", {
        code: "FORBIDDEN",
        message: "Only the admin can transfer admin.",
      })
      return
    }

    const target = this.room.participants.find(
      (p) => p.id === payload.targetUserId
    )
    if (!target) return

    this.room.adminId = target.id
    this.room.participants = this.room.participants.map((p) => {
      if (p.id === target.id) {
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
    })
    this.emitServer("admin_changed", { newAdminId: target.id })
  }

  private handleSelfMute = (payload: ClientToServerEvents["self_mute"]) => {
    if (!this.room) return
    const self = this.room.participants.find((p) => p.id === this.self.id)
    if (!self) return

    if (self.mutedByAdmin && !payload.muted) {
      this.emitServer("error", {
        code: "FORBIDDEN",
        message: "The admin muted your mic. You cannot unmute yourself.",
      })
      return
    }

    this.room.participants = this.room.participants.map((p) =>
      p.id === this.self.id
        ? { ...p, muted: payload.muted, mutedByAdmin: false }
        : p
    )
    this.emitServer("user_muted", {
      userId: this.self.id,
      muted: payload.muted,
      byAdmin: false,
    })
  }

  private handleMute = (payload: ClientToServerEvents["mute_user"]) => {
    if (!this.room || !this.assertAdmin()) {
      this.emitServer("error", {
        code: "FORBIDDEN",
        message: "Only the admin can mute participants.",
      })
      return
    }

    this.room.participants = this.room.participants.map((p) =>
      p.id === payload.targetUserId
        ? {
            ...p,
            muted: payload.muted,
            mutedByAdmin: payload.muted,
          }
        : p
    )
    this.emitServer("user_muted", {
      userId: payload.targetUserId,
      muted: payload.muted,
      byAdmin: true,
    })
  }

  private promoteFallbackAdmin = (leavingAdminId: string) => {
    if (!this.room) return
    const next = this.room.participants.find((p) => p.id !== leavingAdminId)
    if (!next) return
    this.room.adminId = next.id
    this.room.participants = this.room.participants
      .filter((p) => p.id !== leavingAdminId)
      .map((p) =>
        p.id === next.id
          ? { ...p, role: "admin" as const, hasPlaybackControl: true }
          : p
      )
    this.emitServer("admin_changed", { newAdminId: next.id })
  }

  private startHeartbeat = () => {
    this.stopHeartbeat()
    this.heartbeat = setInterval(() => {
      if (!this.room || this.room.playbackState.status !== "playing") return
      const elapsed = Date.now() - this.room.playbackState.serverTime
      this.emitServer("playback_sync", {
        status: "playing",
        positionMs: this.room.playbackState.positionMs + elapsed,
        serverTime: Date.now(),
      })
      this.room.playbackState = {
        status: "playing",
        positionMs: this.room.playbackState.positionMs + elapsed,
        serverTime: Date.now(),
      }
    }, 5000)
  }

  private stopHeartbeat = () => {
    if (this.heartbeat) {
      clearInterval(this.heartbeat)
      this.heartbeat = null
    }
  }
}

export const createMockRoomSocket = (self: CurrentUser) =>
  new MockRoomSocket(self)

/** Helpers used by UI when applying events locally for kicked simulation on fixtures */
export const findParticipant = (
  room: RoomState,
  userId: string
): RoomParticipant | undefined =>
  room.participants.find((p) => p.id === userId)
