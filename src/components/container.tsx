import { cn } from "@/lib/utils";

// Shared horizontal-padding wrapper. Used by header, footer, and page content
// so the gutter is consistent across the site.
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6", className)}>
      {children}
    </div>
  );
}
