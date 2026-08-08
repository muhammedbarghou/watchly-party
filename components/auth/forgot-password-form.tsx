"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Link from "next/link"
import { Info, Mail, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type ForgotPasswordFormState = {
  email: string
}

export const ForgotPasswordForm = () => {
  const [formState, setFormState] = useState<ForgotPasswordFormState>({
    email: "",
  })

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, email: event.target.value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <div className="auth-glass-panel rounded-3xl border border-night-bordeaux/60 p-8 shadow-[0_40px_80px_-40px_rgba(0,0,0,1)] sm:p-9">
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup className="gap-6">
          <FieldSet>
            <FieldLegend className="sr-only">Password recovery</FieldLegend>

            <Field>
              <FieldLabel
                htmlFor="forgot-password-email"
                className="mb-2.5 text-xs tracking-wide text-[#f3eadc]/55"
              >
                Registered Email
              </FieldLabel>
              <div className="field-glass flex items-center rounded-xl px-4 py-4">
                <Mail
                  className="mr-3 size-5 shrink-0 text-[#f3eadc]/30"
                  aria-hidden="true"
                />
                <Input
                  id="forgot-password-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. viewer@cinema.com"
                  value={formState.email}
                  onChange={handleEmailChange}
                  required
                  aria-required="true"
                  className="h-auto border-0 bg-transparent px-0 py-0 text-sm text-[#f3eadc] shadow-none placeholder:text-[#f3eadc]/20 focus-visible:border-transparent focus-visible:ring-0 md:text-sm dark:bg-transparent"
                />
              </div>
            </Field>
          </FieldSet>

          <Button
            type="submit"
            className="group h-auto w-full gap-3 rounded-xl bg-amber-flame py-4 text-sm font-bold tracking-widest text-ink-black uppercase shadow-[0_12px_40px_-12px_rgba(255,186,8,0.4)] hover:bg-[#e5a500]"
            aria-label="Send reset link"
          >
            Send Reset Link
            <Send className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Button>
        </FieldGroup>
      </form>

      <div className="mt-8 flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-flame/10 text-amber-flame">
          <Info className="size-3.5" aria-hidden="true" />
        </div>
        <p className="text-[11px] leading-relaxed text-[#f3eadc]/50 italic">
          Be sure to check your spam or promotions folder if the link
          doesn&apos;t arrive in the next 5 minutes.
        </p>
      </div>
    </div>
  )
}
