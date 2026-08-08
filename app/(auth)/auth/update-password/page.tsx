import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"

import { UpdatePasswordForm } from "@/components/auth/update-password-form"

const UpdatePasswordPage = () => {
  return (
    <div className="relative flex min-h-screen w-full items-stretch overflow-hidden bg-ink-black text-[#f3eadc]">
      <div className="relative hidden items-center justify-center overflow-hidden bg-black p-10 lg:flex lg:w-[45%]">
        <Image
          src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80"
          alt="Cinema seats in soft light"
          fill
          priority
          className="object-cover opacity-50 grayscale"
          sizes="45vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-night-bordeaux/40 via-ink-black/90 to-ink-black" />
        <div
          className="cinema-glow absolute top-[-20%] left-[-10%] h-[140%] w-full rotate-12 bg-amber-flame/5 blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-3xl border border-amber-flame/20 bg-amber-flame/10 text-amber-flame shadow-2xl">
            <ShieldCheck className="size-10" aria-hidden="true" />
          </div>
          <h1 className="font-serif mb-4 text-4xl leading-tight">
            Secure your seat
          </h1>
          <p className="mx-auto max-w-xs text-sm leading-relaxed font-light text-[#f3eadc]/60">
            Almost there. Set a new password to reclaim your private screening
            access and return to the theater.
          </p>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center p-6 sm:p-10 lg:w-[55%]">
        <Link
          href="/auth/sign-in"
          className="group absolute top-8 left-8 flex items-center gap-2 text-[10px] tracking-[0.2em] text-[#f3eadc]/40 uppercase transition hover:text-amber-flame sm:top-12 sm:left-12"
          aria-label="Back to login"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Login
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-2 text-amber-flame">
              <span className="h-px w-6 bg-amber-flame/50" aria-hidden="true" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase">
                Access Recovery
              </span>
            </div>
            <h2 className="font-serif mb-3 text-4xl">Update Password</h2>
            <p className="text-sm leading-relaxed text-[#f3eadc]/50">
              Create a new password for your Watchly account, then return to the
              premiere.
            </p>
          </div>

          <UpdatePasswordForm />

          <p className="mt-10 text-center text-[11px] tracking-wide text-[#f3eadc]/30 uppercase">
            Remembered it?{" "}
            <Link
              href="/auth/sign-in"
              className="text-[#f3eadc]/60 underline decoration-white/10 underline-offset-4 transition hover:text-amber-flame"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default UpdatePasswordPage
