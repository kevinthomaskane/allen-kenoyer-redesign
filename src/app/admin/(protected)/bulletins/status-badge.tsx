import { CalendarClock, Clock, Eye, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { BulletinStatus } from "@/lib/visibility";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

// Each of the four ADR-0016 states reads unambiguously: distinct label, icon,
// and variant. "Queued" is the explicit "published but not visible yet" state.
const CONFIG: Record<
  BulletinStatus,
  { label: string; Icon: typeof Eye; variant: BadgeVariant; className?: string }
> = {
  visible: { label: "Visible", Icon: Eye, variant: "default" },
  queued: { label: "Queued", Icon: Clock, variant: "secondary" },
  draft: { label: "Draft", Icon: FileText, variant: "outline" },
  expired: {
    label: "Expired",
    Icon: CalendarClock,
    variant: "outline",
    className: "text-muted-foreground",
  },
};

export function BulletinStatusBadge({ status }: { status: BulletinStatus }) {
  const { label, Icon, variant, className } = CONFIG[status];
  return (
    <Badge variant={variant} className={className}>
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}
