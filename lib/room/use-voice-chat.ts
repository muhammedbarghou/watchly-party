"use client"

import { useEffect, useRef, useState } from "react"

import type { RoomParticipant } from "@/lib/room/types"
import type { RoomSocket } from "@/lib/socket"

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
]

type UseVoiceChatOptions = {
  socket: RoomSocket | null
  selfId: string
  participants: RoomParticipant[]
  /** When true, local mic track is disabled (server mute state). */
  selfMuted: boolean
  enabled: boolean
  onMicDenied?: () => void
}

const shouldInitiate = (selfId: string, peerId: string): boolean =>
  selfId.localeCompare(peerId) < 0

export const useVoiceChat = ({
  socket,
  selfId,
  participants,
  selfMuted,
  enabled,
  onMicDenied,
}: UseVoiceChatOptions): void => {
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const makingOfferRef = useRef<Set<string>>(new Set())
  const micDeniedNotified = useRef(false)
  const onMicDeniedRef = useRef(onMicDenied)
  onMicDeniedRef.current = onMicDenied
  const [localReady, setLocalReady] = useState(false)

  const attachRemoteAudio = (peerId: string, stream: MediaStream) => {
    let audio = audioElementsRef.current.get(peerId)
    if (!audio) {
      audio = document.createElement("audio")
      audio.autoplay = true
      audio.setAttribute("playsinline", "true")
      audio.dataset.peerId = peerId
      document.body.appendChild(audio)
      audioElementsRef.current.set(peerId, audio)
    }
    audio.srcObject = stream
  }

  const removePeer = (peerId: string) => {
    const pc = peersRef.current.get(peerId)
    if (pc) {
      pc.close()
      peersRef.current.delete(peerId)
    }
    makingOfferRef.current.delete(peerId)
    const audio = audioElementsRef.current.get(peerId)
    if (audio) {
      audio.srcObject = null
      audio.remove()
      audioElementsRef.current.delete(peerId)
    }
  }

  const teardownAll = () => {
    for (const peerId of [...peersRef.current.keys()]) {
      removePeer(peerId)
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    localStreamRef.current = null
    setLocalReady(false)
  }

  useEffect(() => {
    if (!enabled || !socket) {
      teardownAll()
      return
    }

    let cancelled = false

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        localStreamRef.current = stream
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !selfMuted
        })
        setLocalReady(true)
      } catch {
        if (!micDeniedNotified.current) {
          micDeniedNotified.current = true
          onMicDeniedRef.current?.()
        }
      }
    }

    void start()

    return () => {
      cancelled = true
      teardownAll()
    }
    // Intentionally omit selfMuted — applied in a dedicated effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, socket, selfId])

  useEffect(() => {
    const stream = localStreamRef.current
    if (!stream) return
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !selfMuted
    })
  }, [selfMuted])

  useEffect(() => {
    if (!socket || !enabled) return

    const getOrCreatePeer = (targetUserId: string): RTCPeerConnection => {
      let pc = peersRef.current.get(targetUserId)
      if (pc) return pc

      pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

      const local = localStreamRef.current
      if (local) {
        local.getTracks().forEach((track) => {
          pc!.addTrack(track, local)
        })
      }

      pc.onicecandidate = (event) => {
        if (!event.candidate) return
        socket.emit("rtc_ice_candidate", {
          targetUserId,
          payload: event.candidate.toJSON(),
        })
      }

      pc.ontrack = (event) => {
        const [stream] = event.streams
        if (stream) attachRemoteAudio(targetUserId, stream)
      }

      pc.onconnectionstatechange = () => {
        if (
          pc!.connectionState === "failed" ||
          pc!.connectionState === "closed"
        ) {
          removePeer(targetUserId)
        }
      }

      peersRef.current.set(targetUserId, pc)
      return pc
    }

    const handleOffer = async ({
      fromUserId,
      payload,
    }: {
      fromUserId: string
      payload: RTCSessionDescriptionInit
    }) => {
      if (fromUserId === selfId) return
      const pc = getOrCreatePeer(fromUserId)
      try {
        await pc.setRemoteDescription(payload)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit("rtc_answer", {
          targetUserId: fromUserId,
          payload: answer,
        })
      } catch {
        removePeer(fromUserId)
      }
    }

    const handleAnswer = async ({
      fromUserId,
      payload,
    }: {
      fromUserId: string
      payload: RTCSessionDescriptionInit
    }) => {
      const pc = peersRef.current.get(fromUserId)
      if (!pc) return
      try {
        await pc.setRemoteDescription(payload)
      } catch {
        removePeer(fromUserId)
      }
    }

    const handleIce = ({
      fromUserId,
      payload,
    }: {
      fromUserId: string
      payload: RTCIceCandidateInit
    }) => {
      const pc = peersRef.current.get(fromUserId)
      if (!pc) return
      void pc.addIceCandidate(payload).catch(() => undefined)
    }

    socket.on("rtc_offer", handleOffer)
    socket.on("rtc_answer", handleAnswer)
    socket.on("rtc_ice_candidate", handleIce)

    return () => {
      socket.off("rtc_offer", handleOffer)
      socket.off("rtc_answer", handleAnswer)
      socket.off("rtc_ice_candidate", handleIce)
    }
  }, [socket, enabled, selfId])

  useEffect(() => {
    if (!socket || !enabled || !localReady) return
    if (!localStreamRef.current) return

    const peerIds = new Set(
      participants.map((p) => p.id).filter((id) => id !== selfId)
    )

    for (const peerId of [...peersRef.current.keys()]) {
      if (!peerIds.has(peerId)) removePeer(peerId)
    }

    for (const peerId of peerIds) {
      if (peersRef.current.has(peerId)) continue
      if (!shouldInitiate(selfId, peerId)) continue
      if (makingOfferRef.current.has(peerId)) continue

      makingOfferRef.current.add(peerId)

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
      const local = localStreamRef.current
      local.getTracks().forEach((track) => {
        pc.addTrack(track, local)
      })

      pc.onicecandidate = (event) => {
        if (!event.candidate) return
        socket.emit("rtc_ice_candidate", {
          targetUserId: peerId,
          payload: event.candidate.toJSON(),
        })
      }

      pc.ontrack = (event) => {
        const [stream] = event.streams
        if (stream) attachRemoteAudio(peerId, stream)
      }

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          removePeer(peerId)
        }
      }

      peersRef.current.set(peerId, pc)

      void (async () => {
        try {
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          socket.emit("rtc_offer", {
            targetUserId: peerId,
            payload: offer,
          })
        } catch {
          removePeer(peerId)
        } finally {
          makingOfferRef.current.delete(peerId)
        }
      })()
    }
  }, [socket, enabled, localReady, participants, selfId])
}
