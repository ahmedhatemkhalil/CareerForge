import { BarChart3, Map, Mic, Sparkles, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURE_CONTENT = {
  analysis: {
    label: "CV Analyses",
    icon: BarChart3,
    badge: "CV analysis limit reached",
    title: "You've used all your analyses",
    description:
      "Your Free plan includes a limited number of CV analyses each month. Upgrade to Pro to keep matching your resume against more job descriptions with AI.",
    proPerk: "Up to 50 AI-powered analyses every month",
  },
  interview: {
    label: "Mock Interviews",
    icon: Mic,
    badge: "Mock interview limit reached",
    title: "No mock interviews left",
    description:
      "You've used your mock interview for this month on the Free plan. Upgrade to Pro to keep practicing with AI-tailored questions based on your CV.",
    proPerk: "Practice with up to 99 tailored interviews every month",
  },
  roadmap: {
    label: "Career Roadmaps",
    icon: Map,
    badge: "Career roadmap limit reached",
    title: "Roadmap limit reached",
    description:
      "You've used your career roadmap for this month on the Free plan. Upgrade to Pro to generate more personalized learning paths toward your target role.",
    proPerk: "Generate up to 20 personalized learning roadmaps every month",
  },
};

const PRO_HIGHLIGHTS = [
  "Higher monthly limits across all AI tools",
  "Advanced insights and tailored feedback",
  "Priority support and early feature access",
];

const UpgradeModal = ({
  open,
  onClose,
  onUpgrade,
  feature = "analysis",
  limit = null,
}) => {
  if (!open) return null;

  const content = FEATURE_CONTENT[feature] || FEATURE_CONTENT.analysis;
  const FeatureIcon = content.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-tertiary" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-full bg-brand-primary/20 blur-xl" />
              <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg">
                <FeatureIcon className="size-8" />
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
              {content.badge}
            </p>

            <h2
              id="upgrade-modal-title"
              className="mt-2 text-2xl font-bold tracking-tight text-foreground"
            >
              {content.title}
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {content.description}
            </p>

            {limit != null && (
              <div className="mt-5 w-full max-w-md rounded-xl border border-border bg-muted/50 px-4 py-3">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>{content.label} used</span>
                  <span className="text-foreground">
                    {limit} / {limit}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-status-warning to-status-error" />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Resets at the start of next month, or upgrade now for more.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-brand-primary/15 bg-secondary/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-brand-secondary" />
              Pro unlocks more for you
            </div>

            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-0.5 text-brand-primary">✓</span>
                <span>{content.proPerk}</span>
              </li>
              {PRO_HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-0.5 text-brand-primary">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 w-full sm:w-auto"
            >
              Maybe later
            </Button>

            <Button
              type="button"
              onClick={onUpgrade}
              className={cn(
                "h-11 w-full gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white sm:w-auto",
                "hover:opacity-90"
              )}
            >
              <Zap className="size-4 fill-current" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
