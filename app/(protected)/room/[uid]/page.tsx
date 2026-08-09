import Link from "next/link"

import { Button } from "@/components/ui/button"

type RoomStubPageProps = {
  params: Promise<{ uid: string }>
}

const RoomStubPage = async ({ params }: RoomStubPageProps) => {
  const { uid } = await params

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="mb-2 text-xs tracking-[0.2em] text-amber-flame uppercase">
        Room
      </p>
      <h1 className="font-serif mb-3 text-3xl text-[#f3eadc] sm:text-4xl">
        {uid}
      </h1>
      <p className="mb-8 max-w-md text-sm text-[#f3eadc]/60">
        Player, chat, and sync come next. This stub exists so create/join can
        land somewhere while the room experience is built.
      </p>
      <Button
        className="rounded-xl bg-amber-flame text-ink-black hover:bg-[#e5a500]"
        render={<Link href="/home-page" />}
      >
        Back to home
      </Button>
    </main>
  )
}

export default RoomStubPage
