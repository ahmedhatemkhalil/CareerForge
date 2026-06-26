import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const ProPlanBadge = ({ className, compact = false }) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary font-bold uppercase tracking-wide text-white",
      compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
      className
    )}
  >
    <Zap className={cn("fill-current", compact ? "size-2.5" : "size-3")} />
    Pro
  </span>
);

export default ProPlanBadge;
