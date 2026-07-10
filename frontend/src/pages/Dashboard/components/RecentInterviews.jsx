import { ChevronRight, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  formatAnalysisDate,
  formatInterviewScore,
  getInterviewScoreStyles,
} from '@/utils/helpers'

const RecentInterviews = ({
  interviews,
  loading,
  onOpenInterview,
  onViewAll,
}) => {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-base font-bold text-foreground">Recent Interviews</h2>
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
        ) : interviews.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No interviews yet.
          </p>
        ) : (
          interviews.map((item, index) => {
            const interviewId = item._id ?? item.id ?? `interview-${index}`
            const interviewDate = formatAnalysisDate(
              item.interviewDate || item.completed_at,
            )

            return (
              <div
                key={interviewId}
                onDoubleClick={() => onOpenInterview?.(interviewId)}
                className={cn(
                  'flex items-center justify-between gap-3 px-5 py-4 transition',
                  onOpenInterview && 'cursor-pointer hover:bg-muted/40',
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.jobTitle}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                   {interviewDate}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold',
                    getInterviewScoreStyles(item.score),
                  )}
                >
                  {formatInterviewScore(item.score)}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default RecentInterviews
