"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { MoreHorizontalIcon, SearchIcon, UsersIcon } from "lucide-react"

import {
  FriendListRow,
  FriendListRowSkeleton,
} from "@/components/friends/friend-list-row"
import { useFriends } from "@/components/friends/friends-provider"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  FriendLookupRelation,
  FriendLookupResult,
  FriendshipRow,
} from "@/lib/friends/types"

type FriendsTabValue = "friends" | "requests" | "add"

const getLookupMeta = (
  relation: FriendLookupRelation,
  username: string
): string | null => {
  if (relation === "already_friends") {
    return `You're already friends with ${username}`
  }
  if (relation === "outgoing_pending") {
    return `Request already sent — waiting on ${username}`
  }
  if (relation === "incoming_pending") {
    return `${username} already sent you a request`
  }
  return null
}

export const FriendsPageShell = () => {
  const {
    friends,
    incoming,
    outgoing,
    incomingCount,
    isLoading,
    filterFriends,
    lookupUsername,
    acceptRequest,
    declineRequest,
    cancelRequest,
    sendRequest,
    removeFriend,
  } = useFriends()

  const [tab, setTab] = useState<FriendsTabValue>("friends")
  const [friendFilter, setFriendFilter] = useState("")
  const [removeTarget, setRemoveTarget] = useState<FriendshipRow | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [lookupResult, setLookupResult] = useState<FriendLookupResult | null>(
    null
  )
  const [lookupError, setLookupError] = useState<"not_found" | "self" | null>(
    null
  )
  const [isSearching, setIsSearching] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const filteredFriends = filterFriends(friendFilter)
  const lookupUsernameKey = lookupResult?.ok
    ? lookupResult.user.username
    : null
  const lookupRelation = lookupResult?.ok ? lookupResult.relation : null

  useEffect(() => {
    if (!lookupUsernameKey) return

    let cancelled = false
    const refreshLookup = async () => {
      const refreshed = await lookupUsername(lookupUsernameKey)
      if (cancelled) return
      if (!refreshed.ok) {
        setLookupResult(null)
        return
      }
      if (refreshed.relation !== lookupRelation) {
        setLookupResult(refreshed)
      }
    }
    void refreshLookup()

    return () => {
      cancelled = true
    }
  }, [
    friends,
    incoming,
    outgoing,
    lookupUsername,
    lookupUsernameKey,
    lookupRelation,
  ])

  const handleConfirmRemove = () => {
    if (!removeTarget) return
    void removeFriend(removeTarget.id)
    setRemoveTarget(null)
  }

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSearching(true)
    try {
      const result = await lookupUsername(searchQuery)
      if (!result.ok) {
        setLookupResult(null)
        setLookupError(result.error)
        return
      }
      setLookupError(null)
      setLookupResult(result)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendRequest = async () => {
    if (
      !lookupResult?.ok ||
      (lookupResult.relation !== "none" &&
        lookupResult.relation !== "incoming_pending")
    ) {
      return
    }

    setIsSending(true)
    try {
      const mutation = await sendRequest(lookupResult.user.username)
      if (!mutation?.ok) return

      const nextRelation: FriendLookupRelation =
        mutation.status === "created" || mutation.status === "already_pending"
          ? "outgoing_pending"
          : "already_friends"

      setLookupResult({
        ok: true,
        user: lookupResult.user,
        relation: nextRelation,
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <p className="mb-1 text-xs tracking-[0.2em] text-amber-flame uppercase">
          Friends
        </p>
        <h1 className="font-serif text-3xl text-[#f3eadc] sm:text-4xl">
          Your circle
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#f3eadc]/60">
          Manage friendships, answer requests, and find people by username
          (the part of their email before @).
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as FriendsTabValue)}
        className="gap-6"
      >
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-1 border-b border-night-bordeaux/40 bg-transparent p-0 sm:w-auto"
        >
          <TabsTrigger
            value="friends"
            className="rounded-none px-3 py-2 text-[#f3eadc]/60 data-active:text-[#f3eadc]"
          >
            Friends
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="rounded-none px-3 py-2 text-[#f3eadc]/60 data-active:text-[#f3eadc]"
          >
            Requests
            {incomingCount > 0 ? (
              <Badge className="ml-1.5 bg-amber-flame text-ink-black">
                {incomingCount}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value="add"
            className="rounded-none px-3 py-2 text-[#f3eadc]/60 data-active:text-[#f3eadc]"
          >
            Add friend
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="outline-none">
          {isLoading ? (
            <ul className="overflow-hidden rounded-xl border border-night-bordeaux/50">
              <FriendListRowSkeleton />
              <FriendListRowSkeleton />
              <FriendListRowSkeleton />
            </ul>
          ) : friends.length === 0 ? (
            <div className="glass-panel rounded-2xl px-6 py-10 text-center">
              <UsersIcon className="mx-auto mb-3 size-8 text-[#f3eadc]/40" />
              <p className="text-sm text-[#f3eadc]/70">
                No friends yet. Find someone by username to get started.
              </p>
              <Button
                type="button"
                className="mt-4 bg-amber-flame text-ink-black hover:bg-[#e5a500]"
                onClick={() => setTab("add")}
                aria-label="Go to Add friend tab"
              >
                Add friend
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative max-w-sm">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#f3eadc]/40" />
                <Input
                  type="search"
                  value={friendFilter}
                  onChange={(event) => setFriendFilter(event.target.value)}
                  placeholder="Filter friends"
                  aria-label="Filter friends by username"
                  className="border-night-bordeaux/50 bg-ink-black pl-9 text-[#f3eadc] placeholder:text-[#f3eadc]/40"
                />
              </div>

              {filteredFriends.length === 0 ? (
                <p className="text-sm text-[#f3eadc]/55">
                  No friends match &ldquo;{friendFilter.trim()}&rdquo;.
                </p>
              ) : (
                <ul className="overflow-hidden rounded-xl border border-night-bordeaux/50">
                  {filteredFriends.map((row) => (
                    <FriendListRow
                      key={row.id}
                      user={row.otherUser}
                      showLive={Boolean(row.liveRoomUid)}
                      actions={
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-[#f3eadc] hover:bg-white/5"
                                aria-label={`Actions for ${row.otherUser.username}`}
                              />
                            }
                          >
                            <MoreHorizontalIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="min-w-44 border-night-bordeaux/50 bg-ink-black text-[#f3eadc]"
                          >
                            <DropdownMenuGroup>
                              {row.liveRoomUid ? (
                                <DropdownMenuItem
                                  className="gap-2"
                                  render={
                                    <Link href={`/room/${row.liveRoomUid}`} />
                                  }
                                >
                                  View live room
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem disabled>
                                  View live room
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setRemoveTarget(row)}
                              >
                                Remove friend
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      }
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="outline-none">
          {isLoading ? (
            <ul className="overflow-hidden rounded-xl border border-night-bordeaux/50">
              <FriendListRowSkeleton />
              <FriendListRowSkeleton />
            </ul>
          ) : (
            <div className="space-y-8">
              <section aria-labelledby="incoming-requests-heading">
                <h2
                  id="incoming-requests-heading"
                  className="font-serif mb-3 text-lg text-[#f3eadc]"
                >
                  Incoming
                </h2>
                {incoming.length === 0 ? (
                  <p className="text-sm text-[#f3eadc]/55">
                    No pending requests
                  </p>
                ) : (
                  <ul className="overflow-hidden rounded-xl border border-night-bordeaux/50">
                    {incoming.map((row) => (
                      <FriendListRow
                        key={row.id}
                        user={row.otherUser}
                        actions={
                          <>
                            <Button
                              type="button"
                              className="bg-amber-flame text-ink-black hover:bg-[#e5a500]"
                              onClick={() => void acceptRequest(row.id)}
                              aria-label={`Accept friend request from ${row.otherUser.username}`}
                            >
                              Accept
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-[#f3eadc] hover:bg-white/5"
                              onClick={() => void declineRequest(row.id)}
                              aria-label={`Decline friend request from ${row.otherUser.username}`}
                            >
                              Decline
                            </Button>
                          </>
                        }
                      />
                    ))}
                  </ul>
                )}
              </section>

              {outgoing.length > 0 ? (
                <section aria-labelledby="outgoing-requests-heading">
                  <h2
                    id="outgoing-requests-heading"
                    className="font-serif mb-3 text-lg text-[#f3eadc]"
                  >
                    Outgoing
                  </h2>
                  <ul className="overflow-hidden rounded-xl border border-night-bordeaux/50">
                    {outgoing.map((row) => (
                      <FriendListRow
                        key={row.id}
                        user={row.otherUser}
                        meta="Pending"
                        actions={
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-[#f3eadc] hover:bg-white/5"
                            onClick={() => void cancelRequest(row.id)}
                            aria-label={`Cancel friend request to ${row.otherUser.username}`}
                          >
                            Cancel request
                          </Button>
                        }
                      />
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="outline-none">
          <div className="max-w-lg space-y-4">
            <p className="text-sm text-[#f3eadc]/55">
              Search by username — the part of their email before the{" "}
              <span className="text-[#f3eadc]/80">@</span> symbol.
            </p>
            <form
              onSubmit={(event) => void handleSearchSubmit(event)}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setLookupError(null)
                }}
                placeholder="e.g. alex from alex@email.com"
                aria-label="Search by username (email before @)"
                autoComplete="off"
                className="border-night-bordeaux/50 bg-ink-black text-[#f3eadc] placeholder:text-[#f3eadc]/40"
              />
              <Button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="bg-amber-flame text-ink-black hover:bg-[#e5a500] sm:shrink-0"
                aria-label="Search for user"
              >
                {isSearching ? "Searching…" : "Search"}
              </Button>
            </form>

            {lookupError === "not_found" ? (
              <Alert
                variant="destructive"
                className="border-brick-ember/40 bg-brick-ember/10 text-[#f3eadc]"
              >
                <AlertTitle>User not found</AlertTitle>
                <AlertDescription className="text-[#f3eadc]/70">
                  No account matches that username. Use the part of their email
                  before @ and try again.
                </AlertDescription>
              </Alert>
            ) : null}

            {lookupError === "self" ? (
              <Alert
                variant="destructive"
                className="border-brick-ember/40 bg-brick-ember/10 text-[#f3eadc]"
              >
                <AlertTitle>That&apos;s you</AlertTitle>
                <AlertDescription className="text-[#f3eadc]/70">
                  You can&apos;t send a friend request to yourself.
                </AlertDescription>
              </Alert>
            ) : null}

            {lookupResult?.ok ? (
              <ul className="overflow-hidden rounded-xl border border-night-bordeaux/50">
                <FriendListRow
                  user={lookupResult.user}
                  meta={getLookupMeta(
                    lookupResult.relation,
                    lookupResult.user.username
                  )}
                  actions={
                    lookupResult.relation === "already_friends" ? (
                      <Button type="button" disabled>
                        Already friends
                      </Button>
                    ) : lookupResult.relation === "outgoing_pending" ? (
                      <Button type="button" disabled>
                        Request sent
                      </Button>
                    ) : lookupResult.relation === "incoming_pending" ? (
                      <Button
                        type="button"
                        disabled={isSending}
                        className="bg-amber-flame text-ink-black hover:bg-[#e5a500]"
                        onClick={() => void handleSendRequest()}
                        aria-label={`Accept friend request from ${lookupResult.user.username}`}
                      >
                        {isSending ? "Accepting…" : "Accept request"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        disabled={isSending}
                        className="bg-amber-flame text-ink-black hover:bg-[#e5a500]"
                        onClick={() => void handleSendRequest()}
                        aria-label={`Send friend request to ${lookupResult.user.username}`}
                      >
                        {isSending ? "Sending…" : "Send request"}
                      </Button>
                    )
                  }
                />
              </ul>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null)
        }}
      >
        <AlertDialogContent className="border-night-bordeaux/50 bg-ink-black text-[#f3eadc] ring-night-bordeaux/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#f3eadc]">
              Remove friend?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#f3eadc]/55">
              {removeTarget
                ? `Remove ${removeTarget.otherUser.username} from your friends? They won't be able to see your live rooms, and you won't see theirs.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-night-bordeaux/40 bg-transparent">
            <AlertDialogCancel className="border-night-bordeaux/50 text-[#f3eadc]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-brick-ember text-white hover:bg-brick-ember/90"
              onClick={handleConfirmRemove}
            >
              Remove friend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
