import type { ReactNode } from "react"

import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"

type LegalDocumentProps = {
  title: string
  lastUpdated: string
  children: ReactNode
}

export const LegalDocument = ({
  title,
  lastUpdated,
  children,
}: LegalDocumentProps) => {
  return (
    <div className="overflow-x-hidden bg-surface-base text-white">
      <LandingHeader />
      <main className="hero-gradient relative min-h-screen px-6 pt-32 pb-20">
        <article className="mx-auto max-w-3xl">
          <header className="mb-12 border-b border-white/10 pb-8">
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-sm text-text-muted">
              Last updated: {lastUpdated}
            </p>
          </header>
          <div className="space-y-10 text-base leading-relaxed text-text-muted [&_a]:text-white [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-amber-flame [&_h2]:mb-4 [&_h2]:font-[family-name:var(--font-playfair)] [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_li]:pl-1 [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-white [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
            {children}
          </div>
        </article>
      </main>
      <LandingFooter />
    </div>
  )
}
