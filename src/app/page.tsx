export default function Home() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-3xl px-8 py-20">
        <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
          Phase 0 · Foundation
        </p>
        <h1 className="text-primary font-serif text-5xl">
          Allen Kenoyer Glass
        </h1>
        <p className="text-text-mid mt-6">
          Rebuild in progress. Tokens, typography, and styling primitives are
          wired in.
        </p>

        <div className="bg-card mt-12 grid grid-cols-2 gap-3 rounded-md p-6 text-sm">
          <span className="bg-primary text-primary-foreground rounded-sm px-3 py-2">
            primary
          </span>
          <span className="bg-accent text-accent-foreground rounded-sm px-3 py-2">
            accent
          </span>
          <span className="bg-secondary text-secondary-foreground rounded-sm px-3 py-2">
            secondary
          </span>
          <span className="bg-muted text-muted-foreground rounded-sm px-3 py-2">
            muted
          </span>
          <span className="bg-cream-alt text-text rounded-sm px-3 py-2">
            cream-alt
          </span>
          <span className="bg-plum-dark text-cream rounded-sm px-3 py-2">
            plum-dark
          </span>
        </div>
      </div>
    </main>
  );
}
