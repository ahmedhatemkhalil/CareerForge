import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"


function RoadmapOverallProgressSection({
  className,
  label = "Overall Progress",
  value,
  max = 100,
}) {
  const pct = Math.round((value / max) * 100)

  return (
    <Card
      className={cn(
        "gap-0 border-violet-200/60 bg-violet-50/90 py-0 shadow-none dark:border-violet-900/50 dark:bg-violet-950/35",
        className
      )}>
      <CardContent className="space-y-3 py-5 sm:py-6">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-base text-foreground">{label}</p>
          <span
            className="font-semibold text-lg tabular-nums tracking-tight bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-brand)" }}>
            {pct}%
          </span>
        </div>
        <Progress value={value} max={max} className="h-2.5" />
      </CardContent>
    </Card>
  )
}

export { RoadmapOverallProgressSection }
