"use client"

import { useEffect, useRef } from "react"
import type {
  ClientEventName,
  ClientToServerEvents,
  PlaybackState,
} from "@/lib/room/types"
import {
  VideoPlayerSynced,
  type VideoPlayerSyncedHandle,
} from "@/components/kibo-ui/video-player"

const DRIFT_THRESHOLD_MS = 1400
const SYNC_PING_INTERVAL_MS = 1500

type RoomVideoPlayerProps = {
  videoUrl: string
  playback: PlaybackState
  canControl: boolean
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
  emit,
}: RoomVideoPlayerProps) => {
  const playerRef = useRef<VideoPlayerSyncedHandle>(null)
  const applyingSync = useRef(false)
  const lastEmittedAction = useRef(0)
  const playbackRef = useRef(playback)
  playbackRef.current = playback

  useEffect(() => {
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

  useEffect(() => {
    const id = window.setInterval(() => {
      const clientPositionMs =
        playerRef.current?.getCurrentTimeMs() ??
        playbackRef.current.positionMs
      emit("sync_ping", { clientPositionMs })
    }, SYNC_PING_INTERVAL_MS)

    return () => window.clearInterval(id)
  }, [emit])

  const handlePlay = () => {
    if (!canControl || applyingSync.current) return
    const now = Date.now()
    if (now - lastEmittedAction.current < 200) return
    lastEmittedAction.current = now
    const positionMs = playerRef.current?.getCurrentTimeMs() ?? playback.positionMs
    emit("playback_control", { action: "play", positionMs })
  }

  const handlePause = () => {
    if (!canControl || applyingSync.current) return
    const now = Date.now()
    if (now - lastEmittedAction.current < 200) return
    lastEmittedAction.current = now
    const positionMs = playerRef.current?.getCurrentTimeMs() ?? playback.positionMs
    emit("playback_control", { action: "pause", positionMs })
  }

  const handleSeeked = (positionMs: number) => {
    if (!canControl || applyingSync.current) return
    emit("playback_control", { action: "seek", positionMs })
  }

  return (
    <div className="relative w-full overflow-hidden rounded-none bg-black sm:rounded-md">
      <VideoPlayerSynced
        ref={playerRef}
        src={videoUrl}
        playing={playback.status === "playing"}
        controlsEnabled={canControl}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeeked}
      />
    </div>
  )
}
