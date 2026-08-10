import { io, type Socket } from "socket.io-client"

import { createClient } from "@/lib/supabase/client"
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/lib/room/types"

type ServerEvents = {
  [K in keyof ServerToClientEvents]: (
    payload: ServerToClientEvents[K]
  ) => void
}

type ClientEvents = {
  [K in keyof ClientToServerEvents]: (
    payload: ClientToServerEvents[K]
  ) => void
}

export type RoomSocket = Socket<ServerEvents, ClientEvents>

export const createRoomSocket = async (): Promise<RoomSocket> => {
  const url = process.env.NEXT_PUBLIC_SOCKET_URL
  if (!url) {
    throw new Error("NEXT_PUBLIC_SOCKET_URL is not configured")
  }

  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error("No active session — cannot connect to room server")
  }

  return io(url, {
    auth: { token: session.access_token },
    autoConnect: true,
    transports: ["websocket", "polling"],
  })
}
