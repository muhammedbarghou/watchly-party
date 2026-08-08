"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getAuthCallbackUrl, getSafeNextPath } from "@/lib/auth/urls"
import { createClient } from "@/lib/supabase/client"

type SignInFormState = {
  email: string
  password: string
  remember: boolean
}

export const SignInForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    if (searchParams.get("error") === "auth") {
      return "Authentication failed. Please try again."
    }

    if (searchParams.get("reset") === "success") {
      return null
    }

    return null
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(() => {
    if (searchParams.get("reset") === "success") {
      return "Password updated. Sign in with your new credentials."
    }

    return null
  })
  const [formState, setFormState] = useState<SignInFormState>({
    email: "",
    password: "",
    remember: false,
  })

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, email: event.target.value }))
  }

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, password: event.target.value }))
  }

  const handleRememberChange = (checked: boolean) => {
    setFormState((prev) => ({ ...prev, remember: checked }))
  }

  const handleTogglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: formState.email,
      password: formState.password,
    })
    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    const next = getSafeNextPath(searchParams.get("next"))
    router.push(next)
    router.refresh()
  }

  const handleGoogleSignIn = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsLoading(true)

    const next = getSafeNextPath(searchParams.get("next"))
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl(next),
      },
    })

    if (error) {
      setIsLoading(false)
      setErrorMessage(error.message)
    }
  }

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
        Entry access
      </p>
      <h1 className="font-serif mb-7 text-3xl text-[#f3eadc]">Sign In</h1>

      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup className="gap-5">
          <FieldSet className="gap-4">
            <FieldLegend className="sr-only">Sign in details</FieldLegend>

            <Field>
              <FieldLabel
                htmlFor="sign-in-email"
                className="mb-2 text-xs tracking-wide text-[#f3eadc]/55"
              >
                Email Address
              </FieldLabel>
              <Input
                id="sign-in-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={formState.email}
                onChange={handleEmailChange}
                required
                aria-required="true"
                disabled={isLoading}
                className="field-glass h-auto rounded-xl border-transparent px-4 py-3.5 text-sm text-[#f3eadc] placeholder:text-[#f3eadc]/20 focus-visible:border-amber-flame focus-visible:ring-0 md:text-sm dark:bg-transparent"
              />
            </Field>

            <Field>
              <div className="mb-2 flex items-center justify-between">
                <FieldLabel
                  htmlFor="sign-in-password"
                  className="text-xs tracking-wide text-[#f3eadc]/55"
                >
                  Password
                </FieldLabel>
                <Link
                  href="/auth/forgot-password"
                  className="text-[10px] tracking-widest text-amber-flame uppercase transition hover:text-[#e5a500]"
                >
                  Reset Password
                </Link>
              </div>
              <div className="field-glass flex items-center rounded-xl px-4 py-3.5">
                <Input
                  id="sign-in-password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  value={formState.password}
                  onChange={handlePasswordChange}
                  required
                  aria-required="true"
                  disabled={isLoading}
                  className="h-auto border-0 bg-transparent px-0 py-0 text-sm text-[#f3eadc] shadow-none placeholder:text-[#f3eadc]/20 focus-visible:border-transparent focus-visible:ring-0 md:text-sm dark:bg-transparent"
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

          <Field orientation="horizontal" className="items-center gap-2 py-1">
            <Checkbox
              id="sign-in-remember"
              name="remember"
              checked={formState.remember}
              onCheckedChange={handleRememberChange}
              aria-label="Stay signed in for 30 days"
              disabled={isLoading}
              className="border-night-bordeaux/60 bg-night-bordeaux/30 data-checked:border-amber-flame data-checked:bg-amber-flame data-checked:text-ink-black"
            />
            <FieldLabel
              htmlFor="sign-in-remember"
              className="cursor-pointer text-xs font-normal text-[#f3eadc]/60 select-none"
            >
              Stay signed in for 30 days
            </FieldLabel>
          </Field>

          {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
          {successMessage ? (
            <p role="status" className="text-sm text-amber-flame">
              {successMessage}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isLoading}
            className="group h-auto w-full gap-2 rounded-xl bg-amber-flame py-4 text-sm font-semibold tracking-wide text-ink-black shadow-[0_12px_30px_-12px_rgba(255,186,8,0.6)] hover:bg-[#e5a500]"
            aria-label="Enter the Theater"
          >
            {isLoading ? "Entering..." : "Enter the Theater"}
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Button>

          <FieldSeparator className="my-2 h-auto text-[11px] tracking-wide text-[#f3eadc]/40 [&_[data-slot=separator]]:bg-gradient-to-r [&_[data-slot=separator]]:from-transparent [&_[data-slot=separator]]:via-night-bordeaux [&_[data-slot=separator]]:to-transparent [&_[data-slot=field-separator-content]]:bg-transparent [&_[data-slot=field-separator-content]]:px-0 [&_[data-slot=field-separator-content]]:text-[#f3eadc]/40">
            or enter with
          </FieldSeparator>

          <div className="grid grid-cols-1 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              aria-label="Sign in with Google"
              className="field-glass h-auto rounded-xl border-transparent py-3.5 text-sm text-[#f3eadc]/85 hover:border-[#f3eadc]/20 hover:bg-transparent hover:text-[#f3eadc]"
            >
              <GoogleIcon />
              Google
            </Button>
          </div>
        </FieldGroup>
      </form>

      <p className="mt-8 text-center text-xs leading-relaxed text-[#f3eadc]/45">
        New to the theater?
        <br />
        <Link
          href="/auth/sign-up"
          className="text-amber-flame underline decoration-amber-300/30 underline-offset-4 transition hover:text-[#e5a500]"
        >
          Get your premiere pass
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
