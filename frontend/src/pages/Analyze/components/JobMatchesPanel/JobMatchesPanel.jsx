import { Briefcase } from 'lucide-react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'

import { Button } from '@/components/ui/button'

const getMatchScoreColor = (score) => {
  if (score >= 80) return 'var(--status-success)'
  return 'var(--status-warning)'
}



const JobMatchCard = ({ job }) => {
  const score = job.matchScore ?? 0
  const subtitle = [job.company, job.location].filter(Boolean).join(' · ')

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
      <div className="flex min-h-0 flex-1 gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
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
        className="mt-4 w-full shrink-0 gap-2 text-muted-foreground"
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

const JobMatchesPanel = ({ matchedJobs = [] }) => { 
  if (!matchedJobs || matchedJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center bg-card/50">
        <Briefcase className="size-8 text-muted-foreground/60 mb-2" />
        <p className="text-sm font-medium text-foreground">No matching jobs found</p>
        <p className="text-xs text-muted-foreground max-w-[280px] mt-1">
          We couldn't find any positions matching your profile at the moment. Try adjusting your preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
      {matchedJobs.map((job) => (
        <JobMatchCard key={job._id ?? job.url} job={job} />
      ))}
    </div>
  );
}; 
export default JobMatchesPanel
