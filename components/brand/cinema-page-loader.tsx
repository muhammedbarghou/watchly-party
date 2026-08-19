import Image from "next/image"

import { cn } from "@/lib/utils"

type CinemaPageLoaderProps = {
  caption?: string
  className?: string
  eyebrow?: string
}

export const CinemaPageLoader = ({
  caption = "Dimming the lights…",
  className,
  eyebrow = "Taking your seat",
}: CinemaPageLoaderProps) => {
  return (
    <div
      aria-live="polite"
      className={cn(
        "page-loader-in relative flex w-full flex-col items-center justify-center overflow-hidden bg-ink-black px-6",
        className,
      )}
      role="status"
    >
      <div
        aria-hidden
        className="cinema-glow pointer-events-none absolute top-[-20%] left-[-10%] h-[140%] w-full rotate-12 bg-amber-flame/5 blur-[120px]"
      />

      <Image
        alt="Watchly"
        className="relative h-20 w-auto"
        height={100}
        src="/Logo/Logo.png"
        width={100}
      />

      <p className="relative mt-6 text-xs font-bold tracking-[0.25em] text-amber-flame uppercase">
        {eyebrow}
      </p>
      <p className="relative mt-3 font-serif text-xl text-[#f3eadc] sm:text-2xl">
        {caption}
      </p>

      <div aria-hidden className="relative mt-6 flex items-center gap-2">
        <span className="ember-pulse size-1.5 rounded-full bg-amber-flame" />
        <span className="ember-pulse ember-pulse-delay-1 size-1.5 rounded-full bg-amber-flame" />
        <span className="ember-pulse ember-pulse-delay-2 size-1.5 rounded-full bg-amber-flame" />
      </div>

      <span className="sr-only">Loading</span>
    </div>
  )
}
