"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Info, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

type UpdatePasswordFormState = {
  password: string
  confirmPassword: string
}

export const UpdatePasswordForm = () => {
  const router = useRouter()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formState, setFormState] = useState<UpdatePasswordFormState>({
    password: "",
    confirmPassword: "",
  })

  const isPasswordTooShort =
    formState.password.length > 0 && formState.password.length < 8
  const doPasswordsMismatch =
    formState.confirmPassword.length > 0 &&
    formState.password !== formState.confirmPassword

  const showPasswordLengthError = hasAttemptedSubmit && isPasswordTooShort
  const showMismatchError = hasAttemptedSubmit && doPasswordsMismatch
  const showEmptyPasswordError =
    hasAttemptedSubmit && formState.password.length === 0
  const showEmptyConfirmError =
    hasAttemptedSubmit && formState.confirmPassword.length === 0

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, password: event.target.value }))
  }

  const handleConfirmPasswordChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setFormState((prev) => ({ ...prev, confirmPassword: event.target.value }))
  }

  const handleTogglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev)
  }

  const handleToggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible((prev) => !prev)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasAttemptedSubmit(true)
    setErrorMessage(null)

    if (
      formState.password.length < 8 ||
      formState.password !== formState.confirmPassword
    ) {
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: formState.password,
    })

    if (error) {
      setIsLoading(false)
      setErrorMessage(error.message)
      return
    }

    await supabase.auth.signOut()
    setIsLoading(false)
    router.push("/auth/sign-in?reset=success")
    router.refresh()
  }

  return (
    <div className="auth-glass-panel rounded-3xl border border-night-bordeaux/60 p-8 shadow-[0_40px_80px_-40px_rgba(0,0,0,1)] sm:p-9">
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup className="gap-5">
          <FieldSet className="gap-4">
            <FieldLegend className="sr-only">Set a new password</FieldLegend>

            <Field
              data-invalid={
                showPasswordLengthError || showEmptyPasswordError || undefined
              }
            >
              <FieldLabel
                htmlFor="update-password"
                className="mb-2.5 text-xs tracking-wide text-[#f3eadc]/55"
              >
                New Password
              </FieldLabel>
              <div className="field-glass flex items-center rounded-xl px-4 py-4">
                <Lock
                  className="mr-3 size-5 shrink-0 text-[#f3eadc]/30"
                  aria-hidden="true"
                />
                <Input
                  id="update-password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••••"
                  value={formState.password}
                  onChange={handlePasswordChange}
                  required
                  aria-required="true"
                  disabled={isLoading}
                  aria-invalid={
                    showPasswordLengthError || showEmptyPasswordError
                  }
                  aria-describedby={
                    showPasswordLengthError || showEmptyPasswordError
                      ? "update-password-error"
                      : "update-password-hint"
                  }
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
              {showEmptyPasswordError ? (
                <FieldError id="update-password-error">
                  Please enter a new password.
                </FieldError>
              ) : null}
              {showPasswordLengthError ? (
                <FieldError id="update-password-error">
                  Password must be at least 8 characters.
                </FieldError>
              ) : null}
              {!showEmptyPasswordError && !showPasswordLengthError ? (
                <p
                  id="update-password-hint"
                  className="mt-2 text-[11px] text-[#f3eadc]/40"
                >
                  Use at least 8 characters.
                </p>
              ) : null}
            </Field>

            <Field
              data-invalid={
                showMismatchError || showEmptyConfirmError || undefined
              }
            >
              <FieldLabel
                htmlFor="update-password-confirm"
                className="mb-2.5 text-xs tracking-wide text-[#f3eadc]/55"
              >
                Confirm Password
              </FieldLabel>
              <div className="field-glass flex items-center rounded-xl px-4 py-4">
                <Lock
                  className="mr-3 size-5 shrink-0 text-[#f3eadc]/30"
                  aria-hidden="true"
                />
                <Input
                  id="update-password-confirm"
                  name="confirmPassword"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••••"
                  value={formState.confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                  aria-required="true"
                  disabled={isLoading}
                  aria-invalid={showMismatchError || showEmptyConfirmError}
                  aria-describedby={
                    showMismatchError || showEmptyConfirmError
                      ? "update-password-confirm-error"
                      : undefined
                  }
                  className="h-auto border-0 bg-transparent px-0 py-0 text-sm text-[#f3eadc] shadow-none placeholder:text-[#f3eadc]/20 focus-visible:border-transparent focus-visible:ring-0 md:text-sm dark:bg-transparent"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleToggleConfirmPasswordVisibility}
                  aria-label={
                    isConfirmPasswordVisible
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="ml-2 shrink-0 text-[#f3eadc]/40 hover:bg-transparent hover:text-[#f3eadc]"
                >
                  {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              {showEmptyConfirmError ? (
                <FieldError id="update-password-confirm-error">
                  Please confirm your password.
                </FieldError>
              ) : null}
              {showMismatchError ? (
                <FieldError id="update-password-confirm-error">
                  Passwords do not match.
                </FieldError>
              ) : null}
            </Field>
          </FieldSet>

          {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}

          <Button
            type="submit"
            disabled={isLoading}
            className="group h-auto w-full gap-3 rounded-xl bg-amber-flame py-4 text-sm font-bold tracking-widest text-ink-black uppercase shadow-[0_12px_40px_-12px_rgba(255,186,8,0.4)] hover:bg-[#e5a500]"
            aria-label="Update password"
          >
            {isLoading ? "Updating..." : "Update Password"}
            <Lock className="size-4 transition-transform group-hover:scale-110" />
          </Button>
        </FieldGroup>
      </form>

      <div className="mt-8 flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-flame/10 text-amber-flame">
          <Info className="size-3.5" aria-hidden="true" />
        </div>
        <p className="text-[11px] leading-relaxed text-[#f3eadc]/50 italic">
          Choose a unique password you haven&apos;t used elsewhere. After
          updating, you&apos;ll sign in with your new credentials.
        </p>
      </div>
    </div>
  )
}
