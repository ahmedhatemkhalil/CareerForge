import { cn } from '@/lib/utils'

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

export default SkillGapsPanel
