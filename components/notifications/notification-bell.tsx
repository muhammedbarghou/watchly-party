"use client"

import { useEffect, useState, type ComponentProps } from "react"
import { BellIcon } from "lucide-react"

import { useNotifications } from "@/components/notifications/notification-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const formatRelativeTime = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(1, Math.floor(diffMs / 60_000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const NotificationList = ({ className }: { className?: string }) => {
  const { inbox } = useNotifications()

  if (inbox.length === 0) {
    return (
      <p className={cn("px-1 py-6 text-center text-sm text-[#f3eadc]/55", className)}>
        No notifications yet.
      </p>
    )
  }

  return (
    <ul className={cn("flex max-h-80 flex-col gap-1 overflow-y-auto", className)}>
      {inbox.map((item) => (
        <li
          key={item.id}
          className={cn(
            "rounded-lg px-3 py-2.5",
            item.read ? "bg-transparent" : "bg-amber-flame/10"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-[#f3eadc]">{item.title}</p>
            <span className="shrink-0 text-[11px] text-[#f3eadc]/45">
              {formatRelativeTime(item.createdAt)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#f3eadc]/65">{item.body}</p>
        </li>
      ))}
    </ul>
  )
}

const BellButton = ({
  unreadCount,
  className,
  ...props
}: ComponentProps<typeof Button> & { unreadCount: number }) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className={cn(
      "relative text-[#f3eadc]/80 hover:bg-white/5 hover:text-[#f3eadc]",
      className
    )}
    aria-label={
      unreadCount > 0
        ? `Notifications, ${unreadCount} unread`
        : "Notifications"
    }
    {...props}
  >
    <BellIcon className="size-5" />
    {unreadCount > 0 ? (
      <Badge
        variant="default"
        className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-amber-flame px-1 text-[10px] text-ink-black"
      >
        {unreadCount > 9 ? "9+" : unreadCount}
      </Badge>
    ) : null}
  </Button>
)

export const NotificationBell = () => {
  const { unreadCount, markAllRead } = useNotifications()
  const [isDesktopOpen, setIsDesktopOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)")
    const handleChange = () => setIsNarrow(media.matches)
    handleChange()
    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [])

  const handleDesktopOpenChange = (open: boolean) => {
    setIsDesktopOpen(open)
    if (open) markAllRead()
  }

  const handleMobileOpenChange = (open: boolean) => {
    setIsMobileOpen(open)
    if (open) markAllRead()
  }

  if (isNarrow) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={handleMobileOpenChange}>
        <SheetTrigger
          render={<BellButton unreadCount={unreadCount} />}
        />
        <SheetContent
          side="right"
          className="border-night-bordeaux/50 bg-ink-black text-[#f3eadc]"
        >
          <SheetHeader>
            <SheetTitle className="text-[#f3eadc]">Notifications</SheetTitle>
            <SheetDescription className="text-[#f3eadc]/55">
              Friend requests, invites, and access requests.
            </SheetDescription>
          </SheetHeader>
          <NotificationList className="mt-4 px-4" />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={isDesktopOpen} onOpenChange={handleDesktopOpenChange}>
      <PopoverTrigger render={<BellButton unreadCount={unreadCount} />} />
      <PopoverContent
        align="end"
        className="w-80 border-night-bordeaux/50 bg-ink-black p-3 text-[#f3eadc] shadow-xl ring-night-bordeaux/40"
      >
        <PopoverHeader className="mb-2 px-1">
          <PopoverTitle className="text-[#f3eadc]">Notifications</PopoverTitle>
          <PopoverDescription className="text-[#f3eadc]/55">
            Friend requests, invites, and access requests.
          </PopoverDescription>
        </PopoverHeader>
        <NotificationList />
      </PopoverContent>
    </Popover>
  )
}
