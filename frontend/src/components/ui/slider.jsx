import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  disabled,
  ...props
}) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      min={min}
      max={max}
      step={step}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      className={cn(
        "relative flex w-full touch-none select-none items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}>
      <SliderPrimitive.Track
        className={cn(
          "relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}>
        <SliderPrimitive.Range
          className={cn(
            "absolute h-full rounded-full bg-[linear-gradient(90deg,var(--gradient-brand-from),var(--gradient-brand-to))] data-[orientation=vertical]:w-full"
          )} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "block size-4 shrink-0 rounded-full border border-border bg-background shadow-sm transition-[color,box-shadow] outline-none hover:ring-4 hover:ring-[var(--gradient-brand-from)]/15 focus-visible:ring-4 focus-visible:ring-[var(--gradient-brand-from)]/25 disabled:pointer-events-none disabled:opacity-50"
        )} />
    </SliderPrimitive.Root>
  )
}

export { Slider }
