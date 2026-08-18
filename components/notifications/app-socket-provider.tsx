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

type SocketSubscriber = (socket: RoomSocket) => void

type AppSocketContextValue = {
  registerSocket: (socket: RoomSocket | null) => void
  emit: <K extends ClientEventName>(
    event: K,
    payload: ClientToServerEvents[K]
  ) => boolean
  getSocket: () => RoomSocket | null
  subscribe: (listener: SocketSubscriber) => () => void
}

const AppSocketContext = createContext<AppSocketContextValue | null>(null)

type AppSocketProviderProps = {
  children: ReactNode
}

export const AppSocketProvider = ({ children }: AppSocketProviderProps) => {
  const socketRef = useRef<RoomSocket | null>(null)
  const listenersRef = useRef(new Set<SocketSubscriber>())

  const registerSocket = useCallback((socket: RoomSocket | null) => {
    socketRef.current = socket
    if (!socket) return
    for (const listener of listenersRef.current) {
      listener(socket)
    }
  }, [])

  const getSocket = useCallback(() => socketRef.current, [])

  const subscribe = useCallback((listener: SocketSubscriber) => {
    listenersRef.current.add(listener)
    if (socketRef.current) {
      listener(socketRef.current)
    }
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

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
      subscribe,
    }),
    [registerSocket, emit, getSocket, subscribe]
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
