import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import type { ClassStatusState } from "@/lib/class-status";

// Targeted banner shown only in the two `Hidden — *` states (ADR-0021 decision
// I). It names the specific missing piece and links to the action that fixes
// it. The fix lives in the cohort section (task 04); the link points at the
// `#cohorts` anchor on the detail page, which that task populates.
const BANNER: Partial<
  Record<ClassStatusState, { message: string; cta: string }>
> = {
  hidden_no_cohort: {
    message:
      "This class is published but not visible on the site — it has no published cohort yet.",
    cta: "Add a cohort",
  },
  hidden_no_sessions: {
    message:
      "This class is published but not visible on the site — its published cohort has no upcoming sessions.",
    cta: "Add upcoming sessions",
  },
};

export function StatusBanner({ state }: { state: ClassStatusState }) {
  const content = BANNER[state];
  if (!content) return null;

  return (
    <div
      role="status"
      className="border-accent-gold bg-accent-gold-light flex items-start gap-3 rounded-lg border p-4"
    >
      <TriangleAlert className="text-accent-gold mt-0.5 size-5 shrink-0" />
      <div className="space-y-1 text-sm">
        <p className="text-foreground">{content.message}</p>
        <Link
          href="#cohorts"
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          {content.cta}
        </Link>
      </div>
    </div>
  );
}
