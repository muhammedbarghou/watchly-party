"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export const SignOutButton = () => {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/sign-in")
    router.refresh()
  }

  return (
    <Button
      type="button"
      onClick={handleSignOut}
      className="h-auto rounded-xl bg-amber-flame px-6 py-3 text-sm font-semibold text-ink-black hover:bg-[#e5a500]"
      aria-label="Sign out"
    >
      Sign out
    </Button>
  )
}
