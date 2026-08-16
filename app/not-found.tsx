import type { Metadata } from "next"
import Link from "next/link"

import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"

export const metadata: Metadata = {
  title: "Page not found | Watchly",
  description:
    "This page doesn't exist. Head back to Watchly to start a watch party.",
}

const NotFound = () => {
  return (
    <div className="overflow-x-hidden bg-surface-base text-white">
      <LandingHeader />
      <main className="hero-gradient relative flex min-h-screen items-center justify-center px-6 pt-32 pb-20">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          aria-hidden="true"
        />

        <section
          className="mx-auto max-w-2xl text-center"
          aria-labelledby="not-found-heading"
        >
          <p className="text-xs font-bold tracking-[0.25em] text-amber-flame uppercase">
            Signal lost
          </p>
          <p
            className="text-outline mt-6 font-[family-name:var(--font-playfair)] text-[8rem] leading-none font-bold md:text-[10rem]"
            aria-hidden="true"
          >
            404
          </p>
          <h1
            id="not-found-heading"
            className="mt-4 font-[family-name:var(--font-playfair)] text-3xl font-semibold tracking-tight text-white md:text-5xl"
          >
            This screening isn&apos;t on the schedule
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-text-muted md:text-lg">
            The page you&apos;re looking for doesn&apos;t exist, or the room may
            have already closed. Let&apos;s get you back to the theater.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full bg-amber-flame px-6 text-sm font-bold text-ink-black transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-amber-flame/50 focus-visible:outline-none"
              aria-label="Back to Watchly home"
            >
              Back to home
            </Link>
            <Link
              href="/auth/sign-in"
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-medium text-text-muted transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-amber-flame/50 focus-visible:outline-none"
              aria-label="Sign in to Watchly"
            >
              Sign in
            </Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}

export default NotFound
