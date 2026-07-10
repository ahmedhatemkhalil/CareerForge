import { useState } from 'react'
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

const ImprovedSuggestionCard = ({ item }) => {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <li className="rounded-lg border border-border bg-muted/30">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50"
          >
            <Sparkles className="mt-0.5 size-4 shrink-0 text-[var(--ai-accent)]" />
            <div className="min-w-0 flex-1 space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Suggested rewrite
              </span>
              <p className="line-clamp-2 text-sm leading-relaxed text-foreground">
                {item.original}
              </p>
            </div>
            <ChevronDown
              className={cn(
                'mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                open && 'rotate-180',
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2">
          <div className="space-y-3 border-t border-border px-4 py-4">
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
        </CollapsibleContent>
      </li>
    </Collapsible>
  )
}

const ImprovedSuggestionsPanel = ({ improvedSuggestions = [] }) => (
  <ul className="space-y-4">
    {improvedSuggestions.map((item) => (
      <ImprovedSuggestionCard
        key={item._id ?? item.original}
        item={item}
      />
    ))}
  </ul>
)

export default ImprovedSuggestionsPanel
