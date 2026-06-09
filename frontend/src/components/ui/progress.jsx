import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  max = 100,
  ...props
}) {
  const pct =
    value != null && max > 0
      ? Math.min(100, Math.max(0, (value / max) * 100))
      : 0

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      max={max}
      value={value}
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full rounded-full transition-[width] duration-300 ease-out"
        style={{
          width: value != null ? `${pct}%` : undefined,
          backgroundImage: "var(--gradient-brand)",
        }} />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
