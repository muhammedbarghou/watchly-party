"use client"

import { useEffect, useRef } from "react"
import type {
  ClientEventName,
  ClientToServerEvents,
  PlaybackState,
  RoomReaction,
} from "@/lib/room/types"
import {
  VideoPlayerSynced,
  type VideoPlayerSyncedHandle,
} from "@/components/kibo-ui/video-player"

const DRIFT_THRESHOLD_MS = 1400
const PING_DRIFT_THRESHOLD_MS = 1500
const PING_COOLDOWN_MS = 1000
const CONTROL_GRACE_MS = 2000

type RoomVideoPlayerProps = {
  videoUrl: string
  playback: PlaybackState
  canControl: boolean
  reactions: RoomReaction[]
  emit: <K extends ClientEventName>(
    event: K,
    payload: ClientToServerEvents[K]
  ) => void
}

const expectedPositionMs = (playback: PlaybackState): number => {
  if (playback.status !== "playing") return playback.positionMs
  return playback.positionMs + (Date.now() - playback.serverTime)
}

export const RoomVideoPlayer = ({
  videoUrl,
  playback,
  canControl,
  reactions,
  emit,
}: RoomVideoPlayerProps) => {
  const playerRef = useRef<VideoPlayerSyncedHandle>(null)
  const applyingSync = useRef(false)
  const lastEmittedAction = useRef(0)
  const lastPingAt = useRef(0)
  const lastControlAt = useRef(0)
  const endedForUrl = useRef<string | null>(null)
  const playbackRef = useRef(playback)
  playbackRef.current = playback

  useEffect(() => {
    endedForUrl.current = null
  }, [videoUrl])

  useEffect(() => {
    if (Date.now() - lastControlAt.current < CONTROL_GRACE_MS) return

    const player = playerRef.current
    if (!player) return

    const expected = expectedPositionMs(playback)
    const actual = player.getCurrentTimeMs()
    const drift = Math.abs(expected - actual)

    if (drift > DRIFT_THRESHOLD_MS) {
      applyingSync.current = true
      player.seekToMs(expected)
      window.setTimeout(() => {
        applyingSync.current = false
      }, 250)
    }
  }, [playback])

  const handleMaybePing = () => {
    if (applyingSync.current) return
    const now = Date.now()
    if (now - lastControlAt.current < CONTROL_GRACE_MS) return
    if (now - lastPingAt.current < PING_COOLDOWN_MS) return
    lastPingAt.current = now
    const clientPositionMs =
      playerRef.current?.getCurrentTimeMs() ??
      playbackRef.current.positionMs
    emit("sync_ping", { clientPositionMs })
  }

  const handleBuffer = () => {
    handleMaybePing()
  }

  const handleTimeUpdate = (positionMs: number) => {
    if (canControl) return
    const expected = expectedPositionMs(playbackRef.current)
    if (Math.abs(expected - positionMs) > PING_DRIFT_THRESHOLD_MS) {
      handleMaybePing()
    }
  }

  const handleEnded = () => {
    if (endedForUrl.current === videoUrl) return
    endedForUrl.current = videoUrl
    emit("video_ended", {})
  }

  const markLocalControl = () => {
    lastControlAt.current = Date.now()
  }

  const handlePlay = () => {
    if (!canControl || applyingSync.current) return
    const now = Date.now()
    if (now - lastEmittedAction.current < 200) return
    lastEmittedAction.current = now
    markLocalControl()
    const positionMs =
      playerRef.current?.getCurrentTimeMs() ?? playback.positionMs
    emit("playback_control", { action: "play", positionMs })
  }

  const handlePause = () => {
    if (!canControl || applyingSync.current) return
    const now = Date.now()
    if (now - lastEmittedAction.current < 200) return
    lastEmittedAction.current = now
    markLocalControl()
    const positionMs =
      playerRef.current?.getCurrentTimeMs() ?? playback.positionMs
    emit("playback_control", { action: "pause", positionMs })
  }

  const handleSeeked = (positionMs: number) => {
    if (!canControl || applyingSync.current) return
    markLocalControl()
    emit("playback_control", { action: "seek", positionMs })
  }

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden rounded-none bg-black sm:rounded-md">
      <VideoPlayerSynced
        key={videoUrl}
        ref={playerRef}
        src={videoUrl}
        playing={playback.status === "playing"}
        controlsEnabled={canControl}
        className="h-full max-h-full w-full aspect-auto"
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeeked}
        onBuffer={handleBuffer}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 bottom-14 z-[1] overflow-hidden"
        aria-hidden
      >
        {reactions.map((reaction) => (
          <span
            key={reaction.id}
            className="animate-reaction-float absolute bottom-4 text-2xl drop-shadow-md sm:text-3xl"
            style={{ left: `${reaction.offsetPercent}%` }}
          >
            {reaction.emoji}
          </span>
        ))}
      </div>
    </div>
  )
}
