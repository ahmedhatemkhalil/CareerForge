import { Lightbulb } from 'lucide-react'

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

export default RecommendedActionsPanel
