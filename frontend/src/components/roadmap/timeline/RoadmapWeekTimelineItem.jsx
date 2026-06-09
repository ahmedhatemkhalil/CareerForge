import { memo } from "react"

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { RoadmapWeekPanelFooter } from "./RoadmapWeekPanelFooter"
import { RoadmapWeekResourceCard } from "./RoadmapWeekResourceCard"
import { RoadmapWeekStatusIcon } from "./RoadmapWeekStatusIcon"
import { RoadmapWeekTasksList } from "./RoadmapWeekTasksList"

function itemSurface(status) {
  switch (status) {
    case "completed":
      return "border-status-success/40 bg-status-success/[0.06] dark:border-status-success/35 dark:bg-status-success/10"
    case "current":
      return "border-brand-primary/40 bg-brand-primary/[0.07] dark:border-brand-primary/45 dark:bg-brand-primary/15"
    default:
      return "border-border bg-muted/20 dark:bg-muted/10"
  }
}

function weekNumberBadgeClass(status) {
  switch (status) {
    case "completed":
      return "border-status-success/45 bg-status-success/15 font-semibold text-status-success dark:bg-status-success/20"
    case "current":
      return "border-brand-primary/40 bg-brand-primary/12 font-semibold text-brand-primary dark:bg-brand-primary/20"
    default:
      return "border-border bg-muted font-medium text-muted-foreground"
  }
}

function RoadmapWeekTimelineItemComponent({ week, onMarkComplete }) {
  return (
    <AccordionItem
      value={week.id}
      className={cn(
        "overflow-hidden rounded-xl border shadow-sm transition-shadow data-[state=open]:shadow-md not-last:border-b-0",
        itemSurface(week.status)
      )}>
      <AccordionTrigger className="items-center gap-0 px-4 py-3.5 hover:no-underline sm:px-5 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 pr-2">
          <Badge
            variant="outline"
            className={cn("shrink-0 tabular-nums", weekNumberBadgeClass(week.status))}>
            Week {week.weekNumber}
          </Badge>
          <RoadmapWeekStatusIcon status={week.status} />
          <span className="min-w-0 flex-1 text-left font-semibold text-foreground text-sm leading-snug sm:text-base">
            {week.title}
          </span>
          {week.status === "current" ? (
            <span
              className="hidden shrink-0 rounded-md px-2 py-0.5 font-semibold text-white text-xs uppercase tracking-wide sm:inline-block"
              style={{ backgroundImage: "var(--gradient-brand)" }}>
              Current
            </span>
          ) : null}
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-4 pt-0 pb-4 sm:px-5 sm:pb-5">
        <RoadmapWeekTasksList tasks={week.tasks} />
        <div className="space-y-2">
          <p className="font-semibold text-foreground text-sm">Learning Resources</p>
          <div className="flex flex-col gap-2">
            {week.resources.map((r) => (
              <RoadmapWeekResourceCard
                key={r.href}
                title={r.title}
                href={r.href}
              />
            ))}
          </div>
        </div>
        <RoadmapWeekPanelFooter
          status={week.status}
          onMarkComplete={() => onMarkComplete?.(week.id)}
        />
      </AccordionContent>
    </AccordionItem>
  )
}

const RoadmapWeekTimelineItem = memo(RoadmapWeekTimelineItemComponent)
export { RoadmapWeekTimelineItem }
