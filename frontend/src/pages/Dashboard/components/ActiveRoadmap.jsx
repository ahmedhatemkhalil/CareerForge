import { Check, ChevronRight, Circle } from 'lucide-react'

import { cn } from '@/lib/utils'

const ROADMAP_ITEMS = [
  { label: 'System Design Fundamentals', completed: true },
  { label: 'Advanced React Patterns', completed: true },
  { label: 'Leadership & Communication', completed: false },
]

const PROGRESS = 67
const radius = 52
const circumference = 2 * Math.PI * radius
const strokeDashoffset = circumference - (PROGRESS / 100) * circumference

const ActiveRoadmap = () => {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-base font-bold text-foreground">Active Roadmap</h2>
        <button
          type="button"
          className="flex items-center gap-0.5 text-sm font-medium text-primary transition hover:text-primary/80"
        >
          View
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-5 py-5">
        <div className="flex justify-center">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg className="h-full w-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-muted"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="#4F46A0"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-2xl font-bold text-foreground">{PROGRESS}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm font-bold text-foreground">
            Junior → Senior Engineer
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Week 8 of 12 · 2 weeks remaining
          </p>
        </div>

        <ul className="mt-5 space-y-3">
          {ROADMAP_ITEMS.map((item) => (
            <li key={item.label} className="flex items-center gap-2.5">
              {item.completed ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2.5} />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
              )}
              <span
                className={cn(
                  'text-sm',
                  item.completed
                    ? 'text-muted-foreground line-through'
                    : 'font-medium text-foreground',
                )}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ActiveRoadmap
