"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2Icon } from "lucide-react"

import { SettingsSection } from "@/components/settings/settings-section"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { changePassword } from "@/lib/settings/change-password"
import { deleteAccountAction } from "@/lib/settings/delete-account"
import { createClient } from "@/lib/supabase/client"
import type { SettingsProfile } from "@/lib/settings/types"

type AccountSettingsProps = {
  profile: SettingsProfile
}

export const AccountSettings = ({ profile }: AccountSettingsProps) => {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const isPasswordTooShort = password.length > 0 && password.length < 8
  const doPasswordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasAttemptedSubmit(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    if (password.length < 8 || password !== confirmPassword) {
      return
    }

    setIsSavingPassword(true)
    const supabase = createClient()
    const result = await changePassword(supabase, password, confirmPassword)

    if (!result.ok) {
      setPasswordError(result.error)
      setIsSavingPassword(false)
      return
    }

    setPassword("")
    setConfirmPassword("")
    setHasAttemptedSubmit(false)
    setPasswordSuccess("Password updated.")
    setIsSavingPassword(false)
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setDeleteError(null)

    const result = await deleteAccountAction(deleteConfirmation)

    if (!result.ok) {
      setDeleteError(result.error)
      setIsDeleting(false)
      return
    }

    router.push("/auth/sign-in")
    router.refresh()
  }

  const providerSummary = [
    profile.hasPasswordProvider ? "Email & password" : null,
    profile.hasGoogleProvider ? "Google" : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <SettingsSection
      title="Account & security"
      description="Manage sign-in details and permanently delete your Watchly account."
    >
      <div className="border-b border-night-bordeaux/40 pb-5">
        <p className="text-xs tracking-[0.16em] text-[#f3eadc]/45 uppercase">
          Signed in as
        </p>
        <p className="mt-1 text-sm text-[#f3eadc]">
          {profile.email || "No email on file"}
        </p>
        {providerSummary ? (
          <p className="mt-1 text-xs text-[#f3eadc]/45">
            Providers: {providerSummary}
          </p>
        ) : null}
      </div>

      <form onSubmit={(event) => void handlePasswordSubmit(event)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="settings-password">New password</FieldLabel>
            <div className="relative">
              <Input
                id="settings-password"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
                className="border-night-bordeaux/60 bg-white/5 pr-10 text-[#f3eadc]"
                disabled={isSavingPassword}
                aria-invalid={
                  hasAttemptedSubmit && (isPasswordTooShort || !password)
                }
              />
              <button
                type="button"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-[#f3eadc]/50 hover:text-[#f3eadc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-flame/60"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
                aria-label={
                  isPasswordVisible ? "Hide password" : "Show password"
                }
              >
                {isPasswordVisible ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
            <FieldDescription className="text-[#f3eadc]/45">
              At least 8 characters.
            </FieldDescription>
            {hasAttemptedSubmit && (isPasswordTooShort || !password) ? (
              <FieldError>
                {password.length === 0
                  ? "Password is required."
                  : "Password must be at least 8 characters."}
              </FieldError>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="settings-confirm-password">
              Confirm password
            </FieldLabel>
            <div className="relative">
              <Input
                id="settings-confirm-password"
                type={isConfirmVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                className="border-night-bordeaux/60 bg-white/5 pr-10 text-[#f3eadc]"
                disabled={isSavingPassword}
                aria-invalid={
                  hasAttemptedSubmit &&
                  (doPasswordsMismatch || !confirmPassword)
                }
              />
              <button
                type="button"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-[#f3eadc]/50 hover:text-[#f3eadc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-flame/60"
                onClick={() => setIsConfirmVisible((prev) => !prev)}
                aria-label={
                  isConfirmVisible
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {isConfirmVisible ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
            {hasAttemptedSubmit &&
            (doPasswordsMismatch || !confirmPassword) ? (
              <FieldError>
                {confirmPassword.length === 0
                  ? "Confirm your password."
                  : "Passwords do not match."}
              </FieldError>
            ) : null}
          </Field>
        </FieldGroup>

        {passwordError ? (
          <Alert
            variant="destructive"
            className="mt-4 border-destructive/40"
          >
            <AlertTitle>Couldn&apos;t update password</AlertTitle>
            <AlertDescription>{passwordError}</AlertDescription>
          </Alert>
        ) : null}

        {passwordSuccess ? (
          <Alert className="mt-4 border-night-bordeaux/40 bg-white/[0.03] text-[#f3eadc]">
            <AlertTitle>Saved</AlertTitle>
            <AlertDescription>{passwordSuccess}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-5">
          <Button
            type="submit"
            disabled={isSavingPassword}
            className="bg-amber-flame text-ink-black hover:bg-[#e5a500]"
            aria-label="Update password"
          >
            {isSavingPassword ? (
              <>
                <Loader2Icon className="animate-spin" aria-hidden />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </div>
      </form>

      <div className="border-t border-night-bordeaux/40 pt-6">
        <h3 className="text-sm font-medium text-brick-ember">Danger zone</h3>
        <p className="mt-1 max-w-xl text-sm text-[#f3eadc]/55">
          Permanently delete your account, rooms you created, and friendships.
          This cannot be undone.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 border-brick-ember/50 text-brick-ember hover:bg-brick-ember/10"
          onClick={() => {
            setDeleteOpen(true)
            setDeleteConfirmation("")
            setDeleteError(null)
          }}
          aria-label="Delete account"
        >
          Delete account
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border-night-bordeaux/50 bg-ink-black text-[#f3eadc]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#f3eadc]/55">
              Type <span className="text-[#f3eadc]">{profile.username}</span>{" "}
              to confirm. Your profile, rooms, and friendships will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Field>
            <FieldLabel htmlFor="delete-confirm">Username</FieldLabel>
            <Input
              id="delete-confirm"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              autoComplete="off"
              className="border-night-bordeaux/60 bg-white/5 text-[#f3eadc]"
              disabled={isDeleting}
              aria-label="Type username to confirm account deletion"
            />
          </Field>
          {deleteError ? (
            <Alert variant="destructive" className="border-destructive/40">
              <AlertTitle>Couldn&apos;t delete account</AlertTitle>
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-night-bordeaux/50 text-[#f3eadc]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={
                isDeleting ||
                deleteConfirmation.trim().toLowerCase() !==
                  profile.username.toLowerCase()
              }
              className="bg-brick-ember text-[#f3eadc] hover:bg-brick-ember/90"
              onClick={(event) => {
                event.preventDefault()
                void handleDeleteAccount()
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2Icon className="animate-spin" aria-hidden />
                  Deleting…
                </>
              ) : (
                "Delete forever"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsSection>
  )
}
