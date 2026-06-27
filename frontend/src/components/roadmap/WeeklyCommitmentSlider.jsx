import { Slider } from '@/components/ui/slider'

export const DEFAULT_WEEKLY_HOURS = 10

const MIN_HOURS = 1
const MAX_HOURS = 40

export default function WeeklyCommitmentSlider({ value = DEFAULT_WEEKLY_HOURS, onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 ml-1">
        <label className="text-sm font-medium text-foreground">
          Weekly Study Hours
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        </label>
        <span className="shrink-0 text-sm font-semibold text-brand-primary">
          {value} hrs/week
        </span>
      </div>

      <Slider
        min={MIN_HOURS}
        max={MAX_HOURS}
        step={1}
        value={[value]}
        onValueChange={([hours]) => onChange(hours)}
      />

      <p className="text-xs text-muted-foreground ml-1">
        Set how many hours per week you can dedicate to learning.
      </p>
    </div>
  )
}
