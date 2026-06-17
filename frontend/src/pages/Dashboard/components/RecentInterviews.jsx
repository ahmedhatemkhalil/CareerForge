import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

const INTERVIEWS = [
  {
    title: 'Product Manager',
    company: 'Stripe',
    date: 'Jun 9, 2026',
    score: 8.2,
  },
  {
    title: 'Senior Frontend Engineer',
    company: 'Vercel',
    date: 'Jun 7, 2026',
    score: 9.1,
  },
  {
    title: 'Backend Engineer',
    company: 'Notion',
    date: 'Jun 5, 2026',
    score: 7.4,
  },
]

const getInterviewScoreStyles = (score) => {
  if (score >= 8.5) {
    return 'bg-emerald-50 text-emerald-600 border-emerald-100'
  }
  if (score >= 7) {
    return 'bg-amber-50 text-amber-600 border-amber-100'
  }
  return 'bg-rose-50 text-rose-600 border-rose-100'
}

const RecentInterviews = () => {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-base font-bold text-foreground">Recent Interviews</h2>
        <button
          type="button"
          className="flex items-center gap-0.5 text-sm font-medium text-primary transition hover:text-primary/80"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 divide-y divide-border">
        {INTERVIEWS.map((item) => (
          <div
            key={`${item.title}-${item.date}`}
            className="flex items-center justify-between gap-3 px-5 py-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {item.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {item.company} · {item.date}
              </p>
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold',
                getInterviewScoreStyles(item.score),
              )}
            >
              {item.score}/10
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentInterviews
