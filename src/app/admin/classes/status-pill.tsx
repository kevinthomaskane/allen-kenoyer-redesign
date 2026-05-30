import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { classStatusInfo, type ClassStatusState } from "@/lib/class-status";

// One pill, four states (ADR-0021 decision I). Label text comes from
// `classStatusInfo` — the same source the resolver uses — so the pill and the
// detail banner can never disagree. Colors are design tokens only
// (dev-guide § Design tokens): plum = live, cream = draft, gold = hidden.
const STATE_STYLES: Record<ClassStatusState, string> = {
  live: "bg-primary text-primary-foreground",
  draft: "bg-secondary text-secondary-foreground",
  hidden_no_cohort: "bg-accent text-accent-foreground",
  hidden_no_sessions: "bg-accent text-accent-foreground",
};

export function StatusPill({
  state,
  className,
}: {
  state: ClassStatusState;
  className?: string;
}) {
  const { label } = classStatusInfo(state);
  return <Badge className={cn(STATE_STYLES[state], className)}>{label}</Badge>;
}
