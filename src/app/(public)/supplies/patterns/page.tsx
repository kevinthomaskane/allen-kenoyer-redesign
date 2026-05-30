import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/container";
import { Reveal } from "@/components/motion/reveal";
import { siteContact } from "@/lib/site-config";
import {
  PATTERN_CATEGORIES,
  getPatternsByCategory,
  patternAlt,
  patternImageUrl,
} from "@/lib/patterns";

export const metadata: Metadata = {
  title: "Stained Glass Patterns",
};

export default function PatternsLandingPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <Reveal>
          <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
            Supplies · Patterns
          </p>
          <h1 className="text-primary font-serif text-4xl sm:text-5xl">
            Stained Glass Patterns
          </h1>
          <p className="text-text-mid mt-6 max-w-prose text-lg">
            Allen Kenoyer&rsquo;s catalog of stained glass patterns spans four
            collections, organized by difficulty. Browse by skill level or by
            project type, then call or email to order any pattern by its number.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PATTERN_CATEGORIES.map((cat) => {
              const inCategory = getPatternsByCategory(cat.slug);
              const cover = inCategory[0];
              return (
                <li key={cat.slug}>
                  <Link
                    href={`/supplies/patterns/${cat.slug}/`}
                    className="group bg-card border-border ring-offset-background focus-visible:ring-ring block overflow-hidden rounded-lg border transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <div className="bg-primary-pale relative aspect-[4/3] w-full overflow-hidden">
                      {cover && (
                        <Image
                          src={patternImageUrl(cover)}
                          alt={patternAlt(cover)}
                          fill
                          sizes="(min-width: 640px) 50vw, 100vw"
                          className="object-contain p-8 transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-6">
                      <h2 className="text-primary font-serif text-2xl">
                        {cat.label}
                      </h2>
                      <p className="text-text-mid mt-2 text-sm">
                        {inCategory.length} pattern
                        {inCategory.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="bg-primary-pale mt-16 rounded-lg p-6 sm:p-8">
            <h2 className="text-primary font-serif text-2xl">How to order</h2>
            <p className="text-text mt-3">
              Make a list of the pattern numbers you&rsquo;d like to order, then
              reach out by email or phone — we&rsquo;ll confirm availability and
              arrange payment.
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-text-mid text-xs font-semibold tracking-widest uppercase">
                  By email
                </dt>
                <dd className="text-primary mt-1">
                  <a
                    href="mailto:akglass@allenkenoyerglass.com"
                    className="hover:text-primary-light font-medium underline-offset-2 hover:underline"
                  >
                    akglass@allenkenoyerglass.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-text-mid text-xs font-semibold tracking-widest uppercase">
                  By phone
                </dt>
                <dd className="text-primary mt-1">
                  <a
                    href={siteContact.phoneHref}
                    className="hover:text-primary-light font-medium underline-offset-2 hover:underline"
                  >
                    {siteContact.phone}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="text-text-mid mt-10 max-w-prose text-sm italic">
            These patterns are copyrighted and offered for sale. Copying,
            downloading, or otherwise duplicating any pattern from this catalog
            is expressly forbidden.
          </p>
        </Reveal>
      </Container>
    </div>
  );
}
