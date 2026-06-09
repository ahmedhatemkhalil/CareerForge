import { Square, TrendingUp } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function RoadmapSkillGapsSection({
  className,
  title = "Skill Gaps",
  items = [],
}) {
  return (
    <Card
      className={cn(
        "gap-0 border-violet-200/60 bg-violet-50/90 py-0 shadow-none dark:border-violet-900/50 dark:bg-violet-950/35",
        className
      )}>
      <CardContent className="flex flex-col gap-3 py-5 sm:py-6">
        <p className="flex items-center gap-2 font-semibold text-base text-foreground">
          <TrendingUp className="size-4 shrink-0 text-violet-700 dark:text-violet-300" aria-hidden />
          {title}
        </p>
        <div className="flex flex-col gap-2.5">
        {items.map((text, i) => (
          <div
            key={`${i}-${text}`}
            className="flex items-start gap-2.5 rounded-lg border border-orange-200/80 bg-orange-50/90 px-3 py-2.5 text-sm text-foreground dark:border-orange-900/50 dark:bg-orange-950/40">
            <Square className="mt-0.5 size-3.5 shrink-0 text-orange-700/80 dark:text-orange-300/90" aria-hidden />
            <span>{text}</span>
          </div>
        ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { RoadmapSkillGapsSection }
