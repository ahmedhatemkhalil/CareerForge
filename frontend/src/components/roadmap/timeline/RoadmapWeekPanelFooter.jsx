import { memo } from "react"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function RoadmapWeekPanelFooterComponent({
  status,
  onMarkComplete,
  className,
}) {
  if (status === "completed") {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border border-status-success/30 bg-status-success/10 py-2.5 font-medium text-status-success text-sm",
          className
        )}>
        <Check className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
        Completed
      </div>
    )
  }

  if (status === "current") {
    return (
      <Button
        type="button"
        className={cn(
          "h-10 w-full border-0 font-medium text-white hover:opacity-90",
          className
        )}
        style={{ backgroundImage: "var(--gradient-brand)" }}
        onClick={onMarkComplete}>
        Mark as Complete
      </Button>
    )
  }

  return null
}

const RoadmapWeekPanelFooter = memo(RoadmapWeekPanelFooterComponent)
export { RoadmapWeekPanelFooter }
