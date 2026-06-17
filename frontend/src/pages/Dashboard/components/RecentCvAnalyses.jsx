import { ChevronRight, Loader2 } from 'lucide-react'

import ScoreRing from './ScoreRing'

const RecentCvAnalyses = ({ analyses, loading, onOpenAnalysis, onViewAll }) => {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-base font-bold text-foreground">Recent CV Analyses</h2>
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
        ) : analyses.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No analyses yet.
          </p>
        ) : (
          analyses.map((item) => (
            <div
              key={item._id}
              onDoubleClick={() => onOpenAnalysis(item._id)}
              className="flex cursor-pointer items-center gap-3 px-5 py-4 transition hover:bg-muted/40"
            >
              <ScoreRing score={item.matchScore} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {item.jobTitle}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {item.fileName} · {item.analysisDate}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RecentCvAnalyses
