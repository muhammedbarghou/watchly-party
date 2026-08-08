import { SignOutButton } from "@/components/auth/sign-out-button"
import { createClient } from "@/lib/supabase/server"

const HomePage = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "viewer"

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink-black px-6 text-[#f3eadc]">
      <div className="auth-glass-panel w-full max-w-lg rounded-3xl border border-night-bordeaux/60 p-8 text-center sm:p-10">
        <p className="mb-2 text-xs tracking-[0.2em] text-amber-flame uppercase">
          Private access
        </p>
        <h1 className="font-serif mb-3 text-3xl">Welcome back</h1>
        <p className="mb-8 text-sm text-[#f3eadc]/60">
          Signed in as{" "}
          <span className="text-[#f3eadc]">{displayName}</span>. Your seat is
          reserved — rooms come next.
        </p>
        <SignOutButton />
      </div>
    </main>
  )
}

export default HomePage
