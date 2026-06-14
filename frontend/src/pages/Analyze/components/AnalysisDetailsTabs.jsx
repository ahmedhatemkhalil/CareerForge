import { useState } from 'react'
import { Check, X } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import ImprovedSuggestionsPanel from './ImprovedSuggestionsPanel/ImprovedSuggestionsPanel'
import JobMatchesPanel from './JobMatchesPanel/JobMatchesPanel'
import RecommendedActionsPanel from './RecommendedActionsPanel/RecommendedActionsPanel'
import SkillGapsPanel from './SkillGapsPanel/SkillGapsPanel'

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
