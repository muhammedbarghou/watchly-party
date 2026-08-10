"use client"

import type { ReactNode } from "react"

type SettingsSectionProps = {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export const SettingsSection = ({
  title,
  description,
  children,
  footer,
}: SettingsSectionProps) => {
  return (
    <section className="flex flex-col gap-6">
      <header>
        <h2 className="font-serif text-2xl text-[#f3eadc]">{title}</h2>
        <p className="mt-1.5 max-w-xl text-sm text-[#f3eadc]/55">
          {description}
        </p>
      </header>
      <div className="flex flex-col gap-5">{children}</div>
      {footer ? <div className="pt-1">{footer}</div> : null}
    </section>
  )
}
