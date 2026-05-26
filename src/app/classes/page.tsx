import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/motion/reveal";
import { siteImageUrl } from "@/lib/site-images";
import { siteContact } from "@/lib/site-config";
import {
  CATEGORIES,
  CLASSES,
  WORKSHOP_POLICIES,
  type ClassEntry,
} from "@/lib/classes-content";

export const metadata: Metadata = {
  title: "Stained Glass Classes & Workshops",
  description:
    "Beginner-to-advanced stained glass, mosaic, and fused glass classes at Allen Kenoyer Glass in Lawndale, CA. See upcoming sessions on the class calendar.",
};

export default function ClassesPage() {
  return (
    <Container className="py-16 md:py-24">
      <PageHeader
        eyebrow="Learn With Us"
        title="Stained Glass Classes & Workshops"
        lead={
          <>
            From copper foil basics to advanced fused glass techniques — we
            offer a wide range of classes in a warm, supportive studio.
          </>
        }
      >
        <div className="mt-8 flex justify-center">
          <Link
            href="/classes/calendar"
            className="bg-primary text-primary-foreground hover:bg-primary-light inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-medium transition-colors"
          >
            <CalendarDays className="size-5" aria-hidden />
            See upcoming sessions
          </Link>
        </div>
      </PageHeader>

      <Reveal className="mt-12" delay={0.05}>
        <aside className="border-accent-gold bg-accent-gold-light/30 mx-auto max-w-3xl rounded-md border-l-4 p-5">
          <p className="text-text text-sm leading-relaxed">
            <strong className="font-semibold">
              All classes must be scheduled or changed in person or on the phone
              during store hours.
            </strong>{" "}
            For the most up-to-date session dates, check the{" "}
            <Link
              href="/classes/calendar"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              class calendar
            </Link>{" "}
            — Kristin updates it as classes fill up. Prices are subject to
            change without notice. Email questions to{" "}
            <a
              href={siteContact.classesEmailHref}
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {siteContact.classesEmail}
            </a>
            .
          </p>
        </aside>
      </Reveal>

      {CATEGORIES.map((cat, catIndex) => (
        <section key={cat.id} className="mt-20">
          <Reveal>
            <div className="border-primary/15 mb-10 flex items-end justify-between gap-4 border-b pb-4">
              <h2 className="text-primary font-serif text-3xl sm:text-4xl">
                {cat.label}
              </h2>
              <span className="text-text-mid text-sm">
                {CLASSES[cat.id].length}{" "}
                {CLASSES[cat.id].length === 1 ? "class" : "classes"}
              </span>
            </div>
          </Reveal>
          <div className="grid gap-8">
            {CLASSES[cat.id].map((cls, i) => (
              <Reveal key={cls.name} delay={Math.min(i * 0.03, 0.15)}>
                <ClassCard entry={cls} priority={catIndex === 0 && i < 2} />
              </Reveal>
            ))}
          </div>
        </section>
      ))}

      <Reveal className="mt-24" delay={0.1}>
        <section className="bg-card rounded-lg border border-black/5 p-8 shadow-sm md:p-12">
          <div className="mx-auto max-w-3xl">
            <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
              Studio Use
            </p>
            <h2 className="text-primary font-serif text-3xl">
              Workshop policies
            </h2>
            <p className="text-text-mid mt-4 text-base leading-relaxed">
              {WORKSHOP_POLICIES.intro}
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {WORKSHOP_POLICIES.tiers.map((tier) => (
                <li key={tier.label} className="bg-cream-alt rounded-md p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-primary font-serif text-lg">
                      {tier.label}
                    </p>
                    <p className="text-text text-sm font-medium">
                      {tier.price}
                    </p>
                  </div>
                  <p className="text-text-mid mt-2 text-sm leading-relaxed">
                    {tier.description}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-10 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-primary font-serif text-xl">
                  Workshop hours
                </h3>
                <ul className="text-text-mid mt-3 space-y-2 text-sm leading-relaxed">
                  {WORKSHOP_POLICIES.hours.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-primary font-serif text-xl">Add-ons</h3>
                <ul className="text-text-mid mt-3 space-y-2 text-sm leading-relaxed">
                  {WORKSHOP_POLICIES.fees.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="border-primary mt-10 border-l-4 pl-5">
              <p className="text-primary text-sm font-semibold tracking-wide uppercase">
                For your safety
              </p>
              <p className="text-text mt-2 text-base leading-relaxed">
                {WORKSHOP_POLICIES.safety}
              </p>
            </aside>
          </div>
        </section>
      </Reveal>

      <Reveal className="mt-16" delay={0.1}>
        <section className="bg-plum-dark text-cream rounded-lg p-8 text-center md:p-12">
          <p className="text-accent-gold-light mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
            Ready to register?
          </p>
          <h2 className="font-serif text-3xl">
            Call or come into the shop to sign up
          </h2>
          <p className="text-cream/85 mx-auto mt-4 max-w-2xl text-base leading-relaxed">
            All registration happens in person or by phone during store hours.
            Email questions to {siteContact.classesEmail}.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={siteContact.phoneHref}
              className="bg-accent-gold text-plum-dark hover:bg-accent-gold-light inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-semibold transition-colors"
            >
              Call {siteContact.phone}
            </a>
            <Link
              href="/classes/calendar"
              className="border-cream/40 text-cream hover:bg-cream/10 inline-flex items-center gap-2 rounded-md border px-6 py-3 text-base font-medium transition-colors"
            >
              See the class calendar
            </Link>
          </div>
        </section>
      </Reveal>
    </Container>
  );
}

function ClassCard({
  entry,
  priority,
}: {
  entry: ClassEntry;
  priority?: boolean;
}) {
  const hasImage = Boolean(entry.image);
  return (
    <article
      className={`bg-card grid overflow-hidden rounded-lg border border-black/5 shadow-sm ${
        hasImage ? "md:grid-cols-[280px_1fr]" : ""
      }`}
    >
      {hasImage && entry.image ? (
        <div className="bg-cream-alt relative aspect-[4/3] md:aspect-auto md:min-h-full">
          <Image
            src={siteImageUrl("classes", entry.image)}
            alt={entry.imageAlt ?? entry.name}
            fill
            sizes="(min-width: 768px) 280px, 100vw"
            className="object-cover"
            priority={priority}
          />
        </div>
      ) : null}
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-primary font-serif text-2xl">{entry.name}</h3>
          <p className="text-accent-gold text-sm font-semibold">{entry.fee}</p>
        </div>
        <p className="text-text-mid mt-3 text-base leading-relaxed">
          {entry.description}
        </p>
        {(entry.prerequisite || entry.classSize || entry.note) && (
          <dl className="mt-5 grid gap-2 text-sm">
            {entry.prerequisite && (
              <div className="flex gap-2">
                <dt className="text-text shrink-0 font-medium">
                  Prerequisite:
                </dt>
                <dd className="text-text-mid">{entry.prerequisite}</dd>
              </div>
            )}
            {entry.classSize && (
              <div className="flex gap-2">
                <dt className="text-text shrink-0 font-medium">Class size:</dt>
                <dd className="text-text-mid">{entry.classSize}</dd>
              </div>
            )}
            {entry.note && (
              <div className="flex gap-2">
                <dt className="text-text shrink-0 font-medium">Notes:</dt>
                <dd className="text-text-mid">{entry.note}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </article>
  );
}
