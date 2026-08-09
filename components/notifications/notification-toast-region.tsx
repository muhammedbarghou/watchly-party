"use client"

import { XIcon } from "lucide-react"

import { useNotifications } from "@/components/notifications/notification-provider"
import { Button } from "@/components/ui/button"

export const NotificationToastRegion = () => {
  const { toasts, dismissToast } = useNotifications()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(100%-2rem,22rem)] flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto glass-panel flex items-start gap-3 rounded-xl border border-night-bordeaux/50 px-4 py-3 text-sm text-[#f3eadc] shadow-lg"
          role="status"
        >
          <p className="flex-1 leading-snug">{toast.message}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-[#f3eadc]/70 hover:bg-white/5 hover:text-[#f3eadc]"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <XIcon />
          </Button>
        </div>
      ))}
    </div>
  )
}
