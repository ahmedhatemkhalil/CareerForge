import { memo } from "react"
import { CheckCircle2, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

function RoadmapWeekStatusIconComponent({ status, className }) {
  if (status === "completed") {
    return (
      <CheckCircle2
        className={cn("size-5 shrink-0 text-status-success", className)}
        aria-hidden
      />
    )
  }

  return (
    <Circle
      className={cn(
        "size-5 shrink-0 text-brand-primary",
        status === "upcoming" && "text-muted-foreground",
        className
      )}
      strokeWidth={2}
      aria-hidden
    />
  )
}

const RoadmapWeekStatusIcon = memo(RoadmapWeekStatusIconComponent)
export { RoadmapWeekStatusIcon }
