import { useState } from 'react'
import {
  Briefcase,
  ChevronDown,
  FileText,
  Sparkles,
} from 'lucide-react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { getScoreStyles, getScoreSummary } from '@/utils/helpers'

const AnalysisResultsCard = ({
  score = 0,
  roleTitle = '',
  cvFileName = '',
  jobDescription = '',
  summary,
}) => {
  const [isJdOpen, setIsJdOpen] = useState(false)
  const displaySummary = summary ?? getScoreSummary(score)
  const scoreStyles = getScoreStyles(score)

  return (
    <Collapsible open={isJdOpen} onOpenChange={setIsJdOpen}>
      <Card className="overflow-hidden py-0 shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
            <div className="mx-auto w-36 shrink-0 sm:mx-0 sm:w-40">
              <div className="relative aspect-square">
                <CircularProgressbar
                  value={score}
                  strokeWidth={10}
                  styles={buildStyles({
                    pathColor: scoreStyles.stroke,
                    trailColor: 'var(--muted)',
                    pathTransitionDuration: 0.6,
                  })}
                />
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={cn(
                      'text-3xl font-bold leading-none sm:text-4xl',
                      scoreStyles.text,
                    )}
                  >
                    {score}
                  </span>
                  <span className="mt-1 text-sm text-muted-foreground">
                    / 100
                  </span>
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border-transparent bg-[var(--ai-accent)] px-2.5 py-1 text-xs font-medium text-[var(--ai-accent-foreground)] hover:bg-[var(--ai-accent)]">
                  <Sparkles className="size-3.5" />
                  AI Analysis Complete
                </Badge>
                <Badge
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-semibold',
                    scoreStyles.badge,
                  )}
                >
                  {scoreStyles.label}
                </Badge>
              </div>

              <h2 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
                {score}% match for {roleTitle}
              </h2>

              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {displaySummary}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground">
                  <FileText className="size-3.5 shrink-0" />
                  <span className="truncate">CV: {cvFileName}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground">
                  <Briefcase className="size-3.5 shrink-0" />
                  <span className="truncate">Role: {roleTitle}</span>
                </span>

                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary transition-colors hover:text-brand-primary-hover"
                  >
                    View JD
                    <ChevronDown
                      className={cn(
                        'size-4 transition-transform duration-200',
                        isJdOpen && 'rotate-180',
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
              </div>
            </div>
          </div>

          <CollapsibleContent className="overflow-hidden border-t border-border data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2">
            <div className="space-y-2 px-5 py-5 sm:px-6 sm:py-6">
              <h3 className="text-sm font-semibold text-foreground">
                Job Description
              </h3>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {jobDescription || 'No job description provided.'}
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  )
}

export default AnalysisResultsCard
