import { cn } from "@/lib/utils";

// Shared header block for content routes: eyebrow label + h1 + optional lead.
// The home page does not use this — it has its own hero shape.

export function PageHeader({
  eyebrow,
  title,
  lead,
  align = "center",
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  children?: React.ReactNode;
}) {
  const isCenter = align === "center";
  return (
    <header
      className={cn("mx-auto max-w-3xl", isCenter && "text-center", className)}
    >
      {eyebrow ? (
        <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-primary font-serif text-4xl sm:text-5xl">{title}</h1>
      {lead ? (
        <p className="text-text-mid mt-6 text-lg leading-relaxed">{lead}</p>
      ) : null}
      {children}
    </header>
  );
}
