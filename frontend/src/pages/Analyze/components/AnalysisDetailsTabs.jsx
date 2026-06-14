import { useState } from 'react'
import {
  ArrowRight,
  Briefcase,
  Check,
  Lightbulb,
  Sparkles,
  X,
} from 'lucide-react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'strengths', label: 'Strengths & Weaknesses' },
  { id: 'jobs', label: 'Job Matches' },
  { id: 'gaps', label: 'Skill Gaps' },
  { id: 'actions', label: 'Recommended Actions' },
  { id: 'suggestions', label: 'CV Improvements' },
]

const StrengthsWeaknessesPanel = ({ strengths = [], weaknesses = [] }) => (
  <div className="grid gap-8 sm:grid-cols-2">
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-[var(--status-success)]/15">
          <Check className="size-3.5 text-[var(--status-success)]" strokeWidth={2.5} />
        </span>
        <h3 className="text-base font-semibold text-foreground">Strengths</h3>
      </div>
      <ul className="space-y-3">
        {strengths.map((item, index) => (
          <li key={index} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
            <Check
              className="mt-0.5 size-4 shrink-0 text-[var(--status-success)]"
              strokeWidth={2.5}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-[var(--status-error)]/15">
          <X className="size-3.5 text-[var(--status-error)]" strokeWidth={2.5} />
        </span>
        <h3 className="text-base font-semibold text-foreground">Areas to Improve</h3>
      </div>
      <ul className="space-y-3">
        {weaknesses.map((item, index) => (
          <li key={index} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--status-error)]/15">
              <X className="size-2.5 text-[var(--status-error)]" strokeWidth={2.5} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
)

const getMatchScoreColor = (score) => {
  if (score >= 80) return 'var(--status-success)'
  return 'var(--status-warning)'
}

const JobMatchCard = ({ job }) => {
  const score = job.matchScore ?? 0
  const subtitle = [job.company, job.location].filter(Boolean).join(' · ')

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold leading-snug text-foreground">
            {job.title}
          </p>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {job.matchScore != null && (
          <div className="size-14 shrink-0">
            <div className="relative size-full">
              <CircularProgressbar
                value={score}
                strokeWidth={10}
                styles={buildStyles({
                  pathColor: getMatchScoreColor(score),
                  trailColor: 'var(--muted)',
                  pathTransitionDuration: 0.6,
                })}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">{score}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        className="mt-4 w-full gap-2 text-muted-foreground"
        asChild
      >
        <a href={job.url} target="_blank" rel="noopener noreferrer">
          <Briefcase className="size-4" />
          View Job
        </a>
      </Button>
    </div>
  )
}

const JobMatchesPanel = ({ matchedJobs = [] }) => (
  <div className="grid gap-4 sm:grid-cols-2">
    {matchedJobs.map((job) => (
      <JobMatchCard key={job._id ?? job.url} job={job} />
    ))}
  </div>
)

const skillGapBadgeColors = [
  'border-transparent bg-[var(--status-error)]/10 text-[var(--status-error)]',
  'border-transparent bg-[var(--status-warning)]/15 text-[#B45309] dark:text-[var(--status-warning)]',
  'border-transparent bg-muted text-muted-foreground',
]

const SkillGapsPanel = ({ skillGaps = [] }) => (
  <div className="space-y-4">
    <h3 className="text-base font-semibold text-foreground">Missing Skills</h3>
    <ul className="flex flex-wrap gap-2">
      {skillGaps.map((item, index) => (
        <li key={index}>
          <span
            className={cn(
              'inline-flex rounded-full border px-3 py-1.5 text-sm font-medium',
              skillGapBadgeColors[index % skillGapBadgeColors.length],
            )}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  </div>
)

const RecommendedActionsPanel = ({ recommendedActions = [] }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <span className="flex size-6 items-center justify-center rounded-full bg-brand-primary/15">
        <Lightbulb className="size-3.5 text-brand-primary" />
      </span>
      <h3 className="text-base font-semibold text-foreground">Next Steps</h3>
    </div>

    <ul className="space-y-3">
      {recommendedActions.map((item, index) => (
        <li
          key={index}
          className="flex gap-4 rounded-xl border border-border bg-muted/30 p-4"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-primary-foreground">
            {index + 1}
          </span>
          <p className="pt-1 text-sm leading-relaxed text-foreground">{item}</p>
        </li>
      ))}
    </ul>
  </div>
)

const ImprovedSuggestionsPanel = ({ improvedSuggestions = [] }) => (
  <ul className="space-y-4">
    {improvedSuggestions.map((item) => (
      <li
        key={item._id ?? item.original}
        className="rounded-lg border border-border bg-muted/30 p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-4 text-[var(--ai-accent)]" />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Suggested rewrite
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Original</p>
            <p className="text-sm leading-relaxed text-muted-foreground line-through decoration-muted-foreground/50">
              {item.original}
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowRight className="size-4 shrink-0" />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-[var(--status-success)]">Improved</p>
            <p className="text-sm leading-relaxed text-foreground">{item.improved}</p>
          </div>
        </div>
      </li>
    ))}
  </ul>
)

const AnalysisDetailsTabs = ({
  strengths = [],
  weaknesses = [],
  skillGaps = [],
  matchedJobs = [],
  recommendedActions = [],
  improvedSuggestions = [],
}) => {
  const [activeTab, setActiveTab] = useState('strengths')

  return (
    <Card className="overflow-hidden py-0 shadow-none">
      <CardContent className="p-0">
        <div className="flex overflow-x-auto border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'shrink-0 px-4 py-4 text-center text-sm font-medium whitespace-nowrap transition-colors sm:flex-1 sm:px-4',
                activeTab === tab.id
                  ? 'border-b-2 border-brand-primary text-brand-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6">
          {activeTab === 'strengths' && (
            <StrengthsWeaknessesPanel
              strengths={strengths}
              weaknesses={weaknesses}
            />
          )}
          {activeTab === 'jobs' && (
            <JobMatchesPanel matchedJobs={matchedJobs} />
          )}
          {activeTab === 'gaps' && (
            <SkillGapsPanel skillGaps={skillGaps} />
          )}
          {activeTab === 'actions' && (
            <RecommendedActionsPanel recommendedActions={recommendedActions} />
          )}
          {activeTab === 'suggestions' && (
            <ImprovedSuggestionsPanel improvedSuggestions={improvedSuggestions} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AnalysisDetailsTabs
