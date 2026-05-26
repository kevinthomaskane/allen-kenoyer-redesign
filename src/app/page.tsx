import { Container } from "@/components/container";
import { Reveal } from "@/components/motion/reveal";

export default function Home() {
  return (
    <Container className="py-20">
      <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
        Phase 1 · Chunk B
      </p>
      <h1 className="text-primary font-serif text-5xl">Allen Kenoyer Glass</h1>
      <p className="text-text-mid mt-6 max-w-prose">
        Layout chrome wired up: info bar, sticky nav with dropdowns, mobile
        hamburger, footer. Hero and full home page content land in Chunk C.
      </p>

      <Reveal className="mt-12">
        <div className="bg-card rounded-md border border-black/5 p-6 text-sm">
          <p className="text-text-mid">
            This box uses the Reveal primitive — fades and slides in when it
            enters the viewport, respects{" "}
            <code className="font-mono">prefers-reduced-motion</code>.
          </p>
        </div>
      </Reveal>

      {/* Spacer so scroll behavior of the sticky header can be exercised. */}
      <div className="h-[150vh]" aria-hidden />
    </Container>
  );
}
