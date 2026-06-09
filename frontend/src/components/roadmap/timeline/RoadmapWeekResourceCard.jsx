import { memo } from "react"
import { BookOpen, ExternalLink } from "lucide-react"

import { cn } from "@/lib/utils"

function RoadmapWeekResourceCardComponent({ title, href, className }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-foreground text-sm transition-colors hover:bg-muted/70",
        className
      )}>
      <BookOpen className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
      <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </a>
  )
}

const RoadmapWeekResourceCard = memo(RoadmapWeekResourceCardComponent)
export { RoadmapWeekResourceCard }
