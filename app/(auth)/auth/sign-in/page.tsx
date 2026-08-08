import Image from "next/image"

import { SignInForm } from "@/components/auth/sign-in-form"

const SignInPage = () => {
  return (
    <div className="relative flex min-h-screen w-full items-stretch overflow-hidden bg-ink-black text-[#f3eadc]">
      <div className="relative hidden items-center justify-center p-10 lg:flex lg:w-[58%] xl:w-[60%]">
        <Image
          src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=80"
          alt="Vintage cinema projector glow"
          fill
          priority
          className="object-cover"
          sizes="60vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-black/40 via-ink-black/70 to-ink-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-black via-transparent to-ink-black/50" />
        <div className="absolute right-0 bottom-0 left-0 h-1/2 bg-gradient-to-t from-ink-black to-transparent" />

        <div className="relative z-10 max-w-lg">
          <span className="mb-6 inline-flex items-center gap-2 text-xs tracking-[0.3em] text-amber-flame uppercase">
            <span className="h-px w-8 bg-amber-flame" aria-hidden="true" />
            Members Only · Private Access
          </span>
          <h2 className="font-serif mb-6 text-5xl leading-[1.05] drop-shadow-lg xl:text-6xl">
            Welcome Back to
            <br />
            <span className="italic text-amber-200/90">The Theater</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed font-light text-[#f3eadc]/75">
            Your seat is reserved. Log in to access your private rooms, continue
            your watch history, and join live premieres with your circle.
          </p>

          <div className="auth-glass-panel mt-10 max-w-sm rounded-2xl border border-white/5 p-6">
            <p className="text-pretty text-xs italic text-[#f3eadc]/60">
              &ldquo;The best way to experience cinema is together, even when
              we&apos;re apart.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Image
                src="https://i.pravatar.cc/64?img=8"
                alt=""
                width={32}
                height={32}
                className="size-8 rounded-full object-cover grayscale"
              />
              <span className="text-[10px] font-semibold tracking-widest text-amber-flame uppercase">
                Julian Ross · Lead Architect
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center p-6 sm:p-10 lg:w-[42%] xl:w-[40%]">
        <SignInForm />
      </div>
    </div>
  )
}

export default SignInPage
