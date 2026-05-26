import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";

import { Container } from "@/components/container";
import { Reveal } from "@/components/motion/reveal";
import { siteContact } from "@/lib/site-config";
import {
  PATTERN_CATEGORIES,
  getPatternCategoryLabel,
  getPatternsByCategory,
  type PatternCategory,
} from "@/lib/patterns";
import { PatternGrid } from "./pattern-grid";

type PageProps = {
  params: Promise<{ category: string }>;
};

const VALID_CATEGORIES: readonly PatternCategory[] = PATTERN_CATEGORIES.map(
  (c) => c.slug,
);

function isPatternCategory(slug: string): slug is PatternCategory {
  return (VALID_CATEGORIES as readonly string[]).includes(slug);
}

export function generateStaticParams() {
  return PATTERN_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isPatternCategory(category)) return {};
  return {
    title: `${getPatternCategoryLabel(category)} Patterns`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!isPatternCategory(category)) notFound();

  const label = getPatternCategoryLabel(category);
  const inCategory = getPatternsByCategory(category);

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <Reveal>
          <Link
            href="/supplies/patterns/"
            className="text-text-mid hover:text-primary inline-flex items-center gap-1 text-sm font-medium transition-colors"
          >
            <ChevronLeft className="size-4" aria-hidden />
            All patterns
          </Link>
          <p className="text-accent-gold mt-6 mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
            Patterns · {label}
          </p>
          <h1 className="text-primary font-serif text-4xl sm:text-5xl">
            {label} Patterns
          </h1>
          <p className="text-text-mid mt-6 max-w-prose text-lg">
            {inCategory.length} pattern{inCategory.length === 1 ? "" : "s"} in
            this collection. Click any thumbnail for a larger view. Order by
            phone or email — reference the pattern number.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-10">
            <PatternGrid patterns={inCategory} />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="bg-primary-pale mt-16 rounded-lg p-6 sm:p-8">
            <h2 className="text-primary font-serif text-2xl">How to order</h2>
            <p className="text-text mt-3">
              Email{" "}
              <a
                href="mailto:akglass@allenkenoyerglass.com"
                className="text-primary hover:text-primary-light font-medium underline-offset-2 hover:underline"
              >
                akglass@allenkenoyerglass.com
              </a>{" "}
              or call{" "}
              <a
                href={siteContact.phoneHref}
                className="text-primary hover:text-primary-light font-medium underline-offset-2 hover:underline"
              >
                {siteContact.phone}
              </a>{" "}
              with the pattern numbers you&rsquo;d like to order, and
              we&rsquo;ll confirm availability and arrange payment.
            </p>
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
