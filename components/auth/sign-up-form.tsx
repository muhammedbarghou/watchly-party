"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { Apple, ArrowRight, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type SignUpFormState = {
  fullName: string
  email: string
  password: string
}

export const SignUpForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [formState, setFormState] = useState<SignUpFormState>({
    fullName: "",
    email: "",
    password: "",
  })

  const handleFullNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, fullName: event.target.value }))
  }

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, email: event.target.value }))
  }

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, password: event.target.value }))
  }

  const handleTogglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  const handleGoogleSignUp = () => {}

  const handleAppleSignUp = () => {}

  return (
    <div className="auth-glass-panel w-full max-w-md rounded-3xl border border-night-bordeaux/60 p-8 shadow-[0_40px_80px_-40px_rgba(0,0,0,1)] sm:p-9">
      <div className="mb-9 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
          aria-label="Watchly home"
        >
          <Image
            src="/Logo/Logo.png"
            alt="logo"
            width={125}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>
      </div>

      <p className="mb-1 text-xs tracking-[0.2em] text-amber-flame uppercase">
        Create your account
      </p>
      <h1 className="font-serif mb-7 text-3xl text-[#f3eadc]">
        The Premiere Awaits
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup className="gap-4">
          <FieldSet className="gap-4">
            <FieldLegend className="sr-only">Account details</FieldLegend>

            <Field>
              <FieldLabel
                htmlFor="sign-up-full-name"
                className="mb-2 text-xs tracking-wide text-[#f3eadc]/55"
              >
                Full Name
              </FieldLabel>
              <Input
                id="sign-up-full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Eleanor Vance"
                value={formState.fullName}
                onChange={handleFullNameChange}
                required
                aria-required="true"
                className="field-glass h-auto rounded-xl border-transparent px-4 py-3.5 text-sm text-[#f3eadc] placeholder:text-[#f3eadc]/30 focus-visible:border-amber-flame focus-visible:ring-0 md:text-sm dark:bg-transparent"
              />
            </Field>

            <Field>
              <FieldLabel
                htmlFor="sign-up-email"
                className="mb-2 text-xs tracking-wide text-[#f3eadc]/55"
              >
                Email Address
              </FieldLabel>
              <Input
                id="sign-up-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="eleanor.vance@gmail.com"
                value={formState.email}
                onChange={handleEmailChange}
                required
                aria-required="true"
                className="field-glass h-auto rounded-xl border-transparent px-4 py-3.5 text-sm text-[#f3eadc] placeholder:text-[#f3eadc]/30 focus-visible:border-amber-flame focus-visible:ring-0 md:text-sm dark:bg-transparent"
              />
            </Field>

            <Field>
              <FieldLabel
                htmlFor="sign-up-password"
                className="mb-2 text-xs tracking-wide text-[#f3eadc]/55"
              >
                Password
              </FieldLabel>
              <div className="field-glass flex items-center rounded-xl px-4 py-3.5">
                <Input
                  id="sign-up-password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••••"
                  value={formState.password}
                  onChange={handlePasswordChange}
                  required
                  aria-required="true"
                  className="h-auto border-0 bg-transparent px-0 py-0 text-sm text-[#f3eadc] shadow-none placeholder:text-[#f3eadc]/30 focus-visible:border-transparent focus-visible:ring-0 md:text-sm dark:bg-transparent"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleTogglePasswordVisibility}
                  aria-label={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                  className="ml-2 shrink-0 text-[#f3eadc]/40 hover:bg-transparent hover:text-[#f3eadc]"
                >
                  {isPasswordVisible ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </Field>
          </FieldSet>

          <Button
            type="submit"
            className="group mt-3 h-auto w-full gap-2 rounded-xl bg-amber-flame py-4 text-sm font-semibold tracking-wide text-ink-black shadow-[0_12px_30px_-12px_rgba(255,186,8,0.6)] hover:bg-[#e5a500]"
            aria-label="Join the Premiere"
          >
            Join the Premiere
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Button>

          <FieldSeparator className="my-1 h-auto text-[11px] tracking-wide text-[#f3eadc]/40 [&_[data-slot=separator]]:bg-gradient-to-r [&_[data-slot=separator]]:from-transparent [&_[data-slot=separator]]:via-night-bordeaux [&_[data-slot=separator]]:to-transparent [&_[data-slot=field-separator-content]]:bg-transparent [&_[data-slot=field-separator-content]]:px-0 [&_[data-slot=field-separator-content]]:text-[#f3eadc]/40">
            or register with
          </FieldSeparator>

          <div className="grid grid-cols-1 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignUp}
              aria-label="Register with Google"
              className="field-glass h-auto rounded-xl border-transparent py-3.5 text-sm text-[#f3eadc]/85 hover:border-[#f3eadc]/20 hover:bg-transparent hover:text-[#f3eadc]"
            >
              <GoogleIcon />
              Google
            </Button>
          </div>
        </FieldGroup>
      </form>

      <p className="mt-7 text-center text-xs leading-relaxed text-[#f3eadc]/45">
        Already have an account?
        <br />
        <Link
          href="/auth/sign-in"
          className="text-amber-flame underline decoration-amber-300/30 underline-offset-4 transition hover:text-[#e5a500]"
        >
          Sign in to your account
        </Link>
      </p>

      <div className="mt-8 flex items-center justify-center gap-3 border-t border-night-bordeaux/50 pt-6 text-[11px] text-[#f3eadc]/40">
        <Link href="/privacy" className="transition hover:text-[#f3eadc]/70">
          Privacy Policy
        </Link>
        <span
          className="ember-pulse size-1 rounded-full bg-amber-flame/60"
          aria-hidden="true"
        />
        <Link href="/terms" className="transition hover:text-[#f3eadc]/70">
          Terms of Service
        </Link>
      </div>
    </div>
  )
}

const GoogleIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

const AppleIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12.15 5.43a2.58 2.58 0 1 0-.03 3.66 2.58 2.58 0 0 0 .03-3.66"
      fill="#000"
    />
  </svg>
)