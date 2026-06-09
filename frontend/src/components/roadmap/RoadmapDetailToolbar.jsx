import { ArrowLeft, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"


function RoadmapDetailToolbar({
  className,
  onBack,
  onNewRoadmap,
  backLabel = "Back",
  newRoadmapLabel = "New Roadmap",
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className
      )}>
      <Button
        type="button"
        variant="outline"
        size="default"
        className="gap-1.5"
        onClick={onBack}>
        <ArrowLeft className="size-4" aria-hidden />
        {backLabel}
      </Button>
      <Button
        type="button"
        size="default"
        className="gap-1.5 border-0 text-white hover:opacity-90"
        style={{ backgroundImage: "var(--gradient-brand)" }}
        onClick={onNewRoadmap}>
        <Plus className="size-4" aria-hidden />
        {newRoadmapLabel}
      </Button>
    </div>
  )
}

export { RoadmapDetailToolbar }
