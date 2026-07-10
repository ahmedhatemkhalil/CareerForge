import { ChevronRight, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatAnalysisDate, getScoreStyles } from '@/utils/helpers'
import ScoreRing from './ScoreRing'

const getRoadmapTitle = (roadmap) => {
  if (roadmap?.currentRole && roadmap?.targetRole) {
    return `${roadmap.currentRole} → ${roadmap.targetRole}`
  }
  return roadmap?.targetRole || 'Career Roadmap'
}

const getRoadmapMeta = (roadmap) => {
  const date = formatAnalysisDate(roadmap.updatedAt || roadmap.createdAt)
  const { completedWeeks = 0, totalWeeks = 0 } = roadmap

  if (totalWeeks === 0) {
    return date
  }

  return `${date} · Week ${completedWeeks} of ${totalWeeks}`
}

const RecentRoadmaps = ({ roadmaps, loading, onOpenRoadmap, onViewAll }) => {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-base font-bold text-foreground">Recent Roadmaps</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-0.5 text-sm font-medium text-primary transition hover:text-primary/80"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 divide-y divide-border">
        {loading ? (
          <div className="flex h-48 items-center justify-center text-primary">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : roadmaps.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No roadmaps yet.
          </p>
        ) : (
          roadmaps.map((item, index) => {
            const roadmapId = item._id ?? `roadmap-${index}`
            const progress = item.progress ?? 0
            const scoreStyles = getScoreStyles(progress)

            return (
              <div
                key={roadmapId}
                onDoubleClick={() => onOpenRoadmap?.(roadmapId)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 px-5 py-4 transition hover:bg-muted/40',
                )}
              >
                <ScoreRing score={progress} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {getRoadmapTitle(item)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {getRoadmapMeta(item)}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold capitalize',
                    scoreStyles.badge,
                  )}
                >
                  {item.status === 'completed' ? 'Done' : `${progress}%`}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default RecentRoadmaps
