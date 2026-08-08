import Image from "next/image"

import { SignUpForm } from "@/components/auth/sign-up-form"

const SignUpPage = () => {
  return (
    <div className="relative flex min-h-screen w-full items-stretch overflow-hidden bg-ink-black text-[#f3eadc]">
      <div className="relative hidden items-center justify-center p-10 lg:flex lg:w-[58%] xl:w-[60%]">
        <Image
          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1400&q=80"
          alt="Private luxury screening room"
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
            Season Two · Now Screening
          </span>
          <h2 className="font-serif mb-6 text-5xl leading-[1.05] drop-shadow-lg xl:text-6xl">
            The Premiere
            <br />
            <span className="italic text-amber-200/90">Awaits You</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed font-light text-[#f3eadc]/75">
            Step behind the velvet rope. Watchly curates the world&apos;s most
            exclusive premieres, director&apos;s cuts, and private screenings —
            reserved for those who watch with intention.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-3">
              <Image
                src="https://i.pravatar.cc/64?img=12"
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full border-2 border-ink-black object-cover"
              />
              <Image
                src="https://i.pravatar.cc/64?img=32"
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full border-2 border-ink-black object-cover"
              />
              <Image
                src="https://i.pravatar.cc/64?img=45"
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full border-2 border-ink-black object-cover"
              />
              <div className="flex size-10 items-center justify-center rounded-full border-2 border-ink-black bg-night-bordeaux text-[10px] text-[#f3eadc]/80">
                +2k
              </div>
            </div>
            <span className="text-xs text-[#f3eadc]/60">
              Joined this season&apos;s premiere
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center p-6 sm:p-10 lg:w-[42%] xl:w-[40%]">
        <SignUpForm />
      </div>
    </div>
  )
}

export default SignUpPage
