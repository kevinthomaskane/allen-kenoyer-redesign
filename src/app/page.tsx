export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-8 py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[3.5px] text-accent-gold">
          Phase 0 · Foundation
        </p>
        <h1 className="font-serif text-5xl text-primary">Allen Kenoyer Glass</h1>
        <p className="mt-6 text-text-mid">
          Rebuild in progress. Tokens, typography, and styling primitives are wired in.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-3 rounded-md bg-card p-6 text-sm">
          <span className="rounded-sm bg-primary px-3 py-2 text-primary-foreground">primary</span>
          <span className="rounded-sm bg-accent px-3 py-2 text-accent-foreground">accent</span>
          <span className="rounded-sm bg-secondary px-3 py-2 text-secondary-foreground">secondary</span>
          <span className="rounded-sm bg-muted px-3 py-2 text-muted-foreground">muted</span>
          <span className="rounded-sm bg-cream-alt px-3 py-2 text-text">cream-alt</span>
          <span className="rounded-sm bg-plum-dark px-3 py-2 text-cream">plum-dark</span>
        </div>
      </div>
    </main>
  );
}
