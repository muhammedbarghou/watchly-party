"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react"

import type {
  ClientEventName,
  ClientToServerEvents,
} from "@/lib/room/types"
import type { RoomSocket } from "@/lib/socket"

type AppSocketContextValue = {
  registerSocket: (socket: RoomSocket | null) => void
  emit: <K extends ClientEventName>(
    event: K,
    payload: ClientToServerEvents[K]
  ) => boolean
  getSocket: () => RoomSocket | null
}

const AppSocketContext = createContext<AppSocketContextValue | null>(null)

type AppSocketProviderProps = {
  children: ReactNode
}

export const AppSocketProvider = ({ children }: AppSocketProviderProps) => {
  const socketRef = useRef<RoomSocket | null>(null)

  const registerSocket = useCallback((socket: RoomSocket | null) => {
    socketRef.current = socket
  }, [])

  const getSocket = useCallback(() => socketRef.current, [])

  const emit = useCallback(
    <K extends ClientEventName>(
      event: K,
      payload: ClientToServerEvents[K]
    ): boolean => {
      const socket = socketRef.current
      if (!socket?.connected) return false
      ;(socket.emit as (event: K, payload: ClientToServerEvents[K]) => void)(
        event,
        payload
      )
      return true
    },
    []
  )

  const value = useMemo(
    () => ({
      registerSocket,
      emit,
      getSocket,
    }),
    [registerSocket, emit, getSocket]
  )

  return (
    <AppSocketContext.Provider value={value}>
      {children}
    </AppSocketContext.Provider>
  )
}

export const useAppSocket = (): AppSocketContextValue => {
  const context = useContext(AppSocketContext)
  if (!context) {
    throw new Error("useAppSocket must be used within an AppSocketProvider")
  }
  return context
}
