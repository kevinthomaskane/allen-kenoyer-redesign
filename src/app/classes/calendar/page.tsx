import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/motion/reveal";
import { siteContact } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Class Calendar",
  description:
    "Upcoming stained glass, mosaic, and fused glass classes at Allen Kenoyer Glass in Lawndale, CA.",
};

// Embeds Kristin's public Google Calendar per ADR-0020. The admin dashboard
// (Phase 2) keeps this calendar current — the embed here is the permanent
// public-facing calendar surface, not a placeholder.
const GCAL_EMBED_SRC =
  "https://calendar.google.com/calendar/embed?src=ak4glass%40gmail.com&ctz=America%2FLos_Angeles";

export default function ClassesCalendarPage() {
  return (
    <Container className="py-16 md:py-24">
      <PageHeader
        eyebrow="Schedule"
        title="Class Calendar"
        lead={
          <>
            Our upcoming classes and workshops. Registration happens in person
            or by phone during store hours — call{" "}
            <a
              href={siteContact.phoneHref}
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {siteContact.phone}
            </a>{" "}
            or email{" "}
            <a
              href={siteContact.classesEmailHref}
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {siteContact.classesEmail}
            </a>
            .
          </>
        }
      />

      <Reveal className="mt-12">
        <div className="bg-card overflow-hidden rounded-lg border border-black/5 shadow-sm">
          <iframe
            src={GCAL_EMBED_SRC}
            title="Allen Kenoyer Glass class calendar"
            className="h-[700px] w-full border-0"
            loading="lazy"
          />
        </div>
        <p className="text-text-mid mt-4 text-center text-sm">
          Tip: use the controls at the top right of the calendar to switch
          between month, week, and agenda views.
        </p>
      </Reveal>

      <Reveal className="mt-16" delay={0.1}>
        <section className="mx-auto max-w-3xl text-center">
          <h2 className="text-primary font-serif text-2xl">
            Looking for a specific class?
          </h2>
          <p className="text-text-mid mt-4 text-base leading-relaxed">
            See all our class offerings, descriptions, prerequisites, and class
            sizes on the{" "}
            <Link
              href="/classes"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              classes page
            </Link>
            .
          </p>
        </section>
      </Reveal>
    </Container>
  );
}
