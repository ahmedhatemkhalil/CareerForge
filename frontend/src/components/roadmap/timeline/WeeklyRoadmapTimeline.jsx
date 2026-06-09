import { useCallback, useMemo, useState, memo } from "react"

import { Accordion } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

import { RoadmapWeekTimelineItem } from "./RoadmapWeekTimelineItem"
import { SAMPLE_WEEKLY_ROADMAP_WEEKS } from "./roadmapWeekTypes"

function WeeklyRoadmapTimelineComponent({
  className,
  title = "Weekly Roadmap Timeline",
  weeks: weeksProp,
  defaultExpandedIds,
}) {
  const initialWeeks = weeksProp ?? SAMPLE_WEEKLY_ROADMAP_WEEKS
  const [weeks, setWeeks] = useState(initialWeeks)

  const expandedDefault = useMemo(
    () => defaultExpandedIds ?? ["week-5", "week-6"],
    [defaultExpandedIds]
  )

  const handleMarkComplete = useCallback((weekId) => {
    setWeeks((prev) =>
      prev.map((w) => (w.id === weekId ? { ...w, status: "completed" } : w))
    )
  }, [])

  return (
    <section className={cn("space-y-4", className)}>
      <h2 className="font-bold text-xl text-foreground tracking-tight sm:text-2xl">
        {title}
      </h2>
      <Accordion
        type="multiple"
        defaultValue={expandedDefault}
        className="flex w-full flex-col gap-3">
        {weeks.map((week) => (
          <RoadmapWeekTimelineItem
            key={week.id}
            week={week}
            onMarkComplete={handleMarkComplete}
          />
        ))}
      </Accordion>
    </section>
  )
}

const WeeklyRoadmapTimeline = memo(WeeklyRoadmapTimelineComponent)
export { WeeklyRoadmapTimeline }
