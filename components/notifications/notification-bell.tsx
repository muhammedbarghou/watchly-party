"use client"

import { useEffect, useState, type ComponentProps } from "react"
import { BellIcon } from "lucide-react"

import { NotificationsBlock } from "@/components/notifications/notifications-block"
import { useNotifications } from "@/components/notifications/notification-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

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

type NotificationBellProps = {
  className?: string
}

export const NotificationBell = ({ className }: NotificationBellProps) => {
  const { unreadCount } = useNotifications()
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

  if (isNarrow) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger
          render={
            <BellButton unreadCount={unreadCount} className={className} />
          }
        />
        <SheetContent
          side="right"
          className="border-night-bordeaux/50 bg-ink-black text-[#f3eadc] sm:max-w-md"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <div className="mt-2 px-1">
            <NotificationsBlock />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={isDesktopOpen} onOpenChange={setIsDesktopOpen}>
      <PopoverTrigger
        render={<BellButton unreadCount={unreadCount} className={className} />}
      />
      <PopoverContent
        align="end"
        className="w-[min(100vw-2rem,24rem)] border-night-bordeaux/50 bg-ink-black p-3 text-[#f3eadc] shadow-xl ring-night-bordeaux/40"
      >
        <NotificationsBlock />
      </PopoverContent>
    </Popover>
  )
}
