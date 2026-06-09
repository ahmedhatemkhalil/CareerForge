import { memo } from "react"

import { cn } from "@/lib/utils"

function RoadmapWeekTasksListComponent({ tasks, className }) {
  if (!tasks?.length) return null

  return (
    <div className={cn("space-y-2", className)}>
      <p className="font-semibold text-foreground text-sm">Tasks</p>
      <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground text-sm leading-relaxed">
        {tasks.map((t, i) => (
          <li key={`${i}-${t}`}>{t}</li>
        ))}
      </ul>
    </div>
  )
}

const RoadmapWeekTasksList = memo(RoadmapWeekTasksListComponent)
export { RoadmapWeekTasksList }
