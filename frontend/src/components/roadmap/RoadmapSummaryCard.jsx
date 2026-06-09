import { Clock, Map } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const RoadmapSummaryCard = ({
  className,
  fromRole,
  toRole,
  timelineLabel = "3–5 months",
  dateLabel,
  hoursPerWeek,
}) => {
  const title = `${fromRole} → ${toRole}`

  return (
    <Card
      className={cn(
        "gap-0 border-sky-200/70 bg-sky-50 py-0 shadow-none dark:border-sky-900/60 dark:bg-sky-950/40",
        className
      )}>
      <CardContent className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
          <Map className="size-4 shrink-0 text-sky-700 dark:text-sky-300" aria-hidden />
          <Badge
            variant="outline"
            className="border-sky-200 bg-sky-100 font-medium text-sky-900 dark:border-sky-800 dark:bg-sky-900/80 dark:text-sky-100">
            {timelineLabel}
          </Badge>
          {dateLabel ? (
            <span className="text-muted-foreground">{dateLabel}</span>
          ) : null}
        </div>
        <h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
          {title}
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock className="size-4 shrink-0" aria-hidden />
          <span>{hoursPerWeek} hours/week</span>
        </div>
      </CardContent>
    </Card>
  )
}
