"use client";

import {
  MediaControlBar,
  MediaController,
  MediaMuteButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";
import ReactPlayer from "react-player";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ComponentProps,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";

export type VideoPlayerProps = ComponentProps<typeof MediaController>;

const variables = {
  "--media-primary-color": "var(--primary)",
  "--media-secondary-color": "var(--background)",
  "--media-text-color": "var(--foreground)",
  "--media-background-color": "var(--background)",
  "--media-control-hover-background": "var(--accent)",
  "--media-font-family": "var(--font-sans)",
  "--media-live-button-icon-color": "var(--muted-foreground)",
  "--media-live-button-indicator-color": "var(--destructive)",
  "--media-range-track-background": "var(--border)",
} as CSSProperties;

export const VideoPlayer = ({ style, ...props }: VideoPlayerProps) => (
  <MediaController
    style={{
      ...variables,
      ...style,
    }}
    {...props}
  />
);

export type VideoPlayerControlBarProps = ComponentProps<typeof MediaControlBar>;

export const VideoPlayerControlBar = (props: VideoPlayerControlBarProps) => (
  <MediaControlBar {...props} />
);

export type VideoPlayerTimeRangeProps = ComponentProps<typeof MediaTimeRange>;

export const VideoPlayerTimeRange = ({
  className,
  ...props
}: VideoPlayerTimeRangeProps) => (
  <MediaTimeRange className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerTimeDisplayProps = ComponentProps<
  typeof MediaTimeDisplay
>;

export const VideoPlayerTimeDisplay = ({
  className,
  ...props
}: VideoPlayerTimeDisplayProps) => (
  <MediaTimeDisplay className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerVolumeRangeProps = ComponentProps<
  typeof MediaVolumeRange
>;

export const VideoPlayerVolumeRange = ({
  className,
  ...props
}: VideoPlayerVolumeRangeProps) => (
  <MediaVolumeRange className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerPlayButtonProps = ComponentProps<typeof MediaPlayButton>;

export const VideoPlayerPlayButton = ({
  className,
  ...props
}: VideoPlayerPlayButtonProps) => (
  <MediaPlayButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerSeekBackwardButtonProps = ComponentProps<
  typeof MediaSeekBackwardButton
>;

export const VideoPlayerSeekBackwardButton = ({
  className,
  ...props
}: VideoPlayerSeekBackwardButtonProps) => (
  <MediaSeekBackwardButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerSeekForwardButtonProps = ComponentProps<
  typeof MediaSeekForwardButton
>;

export const VideoPlayerSeekForwardButton = ({
  className,
  ...props
}: VideoPlayerSeekForwardButtonProps) => (
  <MediaSeekForwardButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerMuteButtonProps = ComponentProps<typeof MediaMuteButton>;

export const VideoPlayerMuteButton = ({
  className,
  ...props
}: VideoPlayerMuteButtonProps) => (
  <MediaMuteButton className={cn("p-2.5", className)} {...props} />
);

export type VideoPlayerContentProps = ComponentProps<"video">;

export const VideoPlayerContent = ({
  className,
  ...props
}: VideoPlayerContentProps) => (
  <video className={cn("mt-0 mb-0", className)} {...props} />
);

export type VideoPlayerPreviewProps = {
  poster?: string
  className?: string
  alt?: string
}

/** Lightweight poster surface for room cards — no controls, no playback. */
export const VideoPlayerPreview = ({
  poster,
  className,
  alt = "Room video preview",
}: VideoPlayerPreviewProps) => (
  <VideoPlayer
    className={cn(
      "pointer-events-none relative aspect-video w-full overflow-hidden bg-ink-black",
      className
    )}
  >
    {poster ? (
      // eslint-disable-next-line @next/next/no-img-element -- static poster for list cards
      <img
        src={poster}
        alt={alt}
        className="absolute inset-0 size-full object-cover"
      />
    ) : (
      <div
        className="absolute inset-0 bg-gradient-to-br from-night-bordeaux/80 to-ink-black"
        aria-hidden
      />
    )}
    <VideoPlayerContent
      poster={poster}
      muted
      playsInline
      preload="none"
      tabIndex={-1}
      className="invisible absolute inset-0 size-full object-cover"
      aria-hidden
    />
  </VideoPlayer>
);

export type VideoPlayerSyncedHandle = {
  getCurrentTimeMs: () => number
  seekToMs: (positionMs: number) => void
}

export type VideoPlayerSyncedProps = {
  src: string
  playing: boolean
  controlsEnabled: boolean
  className?: string
  onPlay?: () => void
  onPause?: () => void
  onSeeked?: (positionMs: number) => void
  onTimeUpdate?: (positionMs: number) => void
  onBuffer?: () => void
  onReady?: () => void
}

/** Full playback surface for the room — react-player + media-chrome controls. */
export const VideoPlayerSynced = forwardRef<
  VideoPlayerSyncedHandle,
  VideoPlayerSyncedProps
>(function VideoPlayerSynced(
  {
    src,
    playing,
    controlsEnabled,
    className,
    onPlay,
    onPause,
    onSeeked,
    onTimeUpdate,
    onBuffer,
    onReady,
  },
  ref
) {
  const mediaRef = useRef<HTMLVideoElement | null>(null)
  const seekingFromUser = useRef(false)

  useImperativeHandle(ref, () => ({
    getCurrentTimeMs: () =>
      Math.round((mediaRef.current?.currentTime ?? 0) * 1000),
    seekToMs: (positionMs: number) => {
      const el = mediaRef.current
      if (!el) return
      const seconds = Math.max(0, positionMs / 1000)
      try {
        el.currentTime = seconds
      } catch {
        // Some embeds reject seeks until ready
      }
    },
  }))

  useEffect(() => {
    const el = mediaRef.current
    if (!el) return

    const handleSeeked = () => {
      if (!controlsEnabled) return
      if (!seekingFromUser.current) return
      seekingFromUser.current = false
      onSeeked?.(Math.round(el.currentTime * 1000))
    }

    const handleSeeking = () => {
      if (controlsEnabled) {
        seekingFromUser.current = true
      }
    }

    const handleTimeUpdate = () => {
      onTimeUpdate?.(Math.round(el.currentTime * 1000))
    }

    el.addEventListener("seeked", handleSeeked)
    el.addEventListener("seeking", handleSeeking)
    el.addEventListener("timeupdate", handleTimeUpdate)
    return () => {
      el.removeEventListener("seeked", handleSeeked)
      el.removeEventListener("seeking", handleSeeking)
      el.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [controlsEnabled, onSeeked, onTimeUpdate])

  return (
    <VideoPlayer
      className={cn(
        "relative aspect-video w-full overflow-hidden bg-ink-black",
        className
      )}
    >
      <ReactPlayer
        ref={mediaRef}
        slot="media"
        src={src}
        playing={playing}
        controls={false}
        playsInline
        width="100%"
        height="100%"
        style={
          {
            width: "100%",
            height: "100%",
            "--controls": "none",
          } as CSSProperties
        }
        onReady={onReady}
        onPlay={onPlay}
        onPause={onPause}
        onWaiting={onBuffer}
      />

      {controlsEnabled ? (
        <VideoPlayerControlBar className="w-full">
          <VideoPlayerPlayButton />
          <VideoPlayerSeekBackwardButton />
          <VideoPlayerSeekForwardButton />
          <VideoPlayerTimeRange />
          <VideoPlayerTimeDisplay showDuration />
          <VideoPlayerMuteButton />
          <VideoPlayerVolumeRange />
        </VideoPlayerControlBar>
      ) : (
        <div
          className="absolute inset-0 z-10 cursor-default"
          aria-hidden
          onClick={(event) => event.preventDefault()}
          onPointerDown={(event) => event.preventDefault()}
        />
      )}
    </VideoPlayer>
  )
})
