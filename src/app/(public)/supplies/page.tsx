import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/motion/reveal";
import { siteImageUrl } from "@/lib/site-images";

export const metadata: Metadata = {
  title: "Art Glass Supplies",
  description:
    "Art glass, tools, mosaic supplies, fusing glass, and special order items. Allen Kenoyer Glass carries Oceanside, Wissmach, Bullseye, and more.",
};

// Source: content/supplies/content.md, with Kristin's website-outline.md
// updates applied: Fusing list updated to "Fusible Glass 96 COE & Bullseye
// Glass" (replacing the legacy System 96 / System 90 wording).
const CATEGORIES: { heading: string; items: string[] }[] = [
  {
    heading: "Glass",
    items: [
      "Oceanside",
      "Wissmach",
      "Youghiogheny",
      "Bullseye",
      "Pilkington",
      "Glue Chip",
      "GNA",
      "VanGogh",
      "Mirror",
      "Single & double strength clear",
    ],
  },
  {
    heading: "Stained Glass Supplies",
    items: [
      "Lead, zinc, brass & copper came",
      "Solder & irons",
      "Patinas & fluxes",
      "Foil",
      "Glass cutters",
      "Pliers",
      "Circle cutters",
      "Cuttersmate",
      "Creator's Tools",
      "Grinders",
      "Grinder bits & drill bits",
      "Bevels & clusters",
      "Jewels & nuggets",
      "Books",
      "Lamp vase caps",
      "Safety glasses",
    ],
  },
  {
    heading: "Mosaics",
    items: [
      "Mosaic nippers",
      "Tweezers",
      "Weldbond",
      "No Days adhesive products",
      "Mosaic scrap",
      "Safety glasses",
    ],
  },
  {
    heading: "Fusing Glass & Supplies",
    items: [
      "Fusible Glass 96 COE",
      "Bullseye Glass",
      "Glues",
      "Kiln wash",
      "Thin fire paper",
      "Bales, etc.",
      "Stringers & noodles",
      "Frit",
      "Scrap dichroic glass",
    ],
  },
  {
    heading: "Special Order Items",
    items: [
      "Glass molds",
      "Paints",
      "Flexiglass",
      "Pre-cut shapes",
      "Dichroic glass",
    ],
  },
];

const STORE_IMAGES = [
  {
    file: "Supplies2mr.jpg",
    alt: "Wall of art glass supplies displayed in the Allen Kenoyer Glass studio",
  },
  {
    file: "GlassWall2mr.jpg",
    alt: "Glass wall display showing colored stained glass sheets at the studio",
  },
  {
    file: "DisplayWall1_mr.jpg",
    alt: "Studio display wall featuring tools, frits, and finished glass pieces",
  },
];

export default function SuppliesPage() {
  return (
    <Container className="py-16 md:py-24">
      <PageHeader
        eyebrow="Retail Shop"
        title="Art Glass Supplies"
        lead={
          <>
            Allen Kenoyer Glass offers a wide array of supplies for all of your
            art glass needs. Below is a partial list of what we carry in store —
            call us if you don&rsquo;t see what you need. We&rsquo;re also happy
            to special-order at no extra charge.
          </>
        }
      >
        <div className="mt-8 flex justify-center">
          <Link
            href="/supplies/patterns"
            className="bg-primary text-primary-foreground hover:bg-primary-light inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-medium transition-colors"
          >
            Browse Patterns
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </PageHeader>

      <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat, i) => (
          <Reveal key={cat.heading} delay={i * 0.05}>
            <section className="bg-card h-full rounded-lg border border-black/5 p-6 shadow-sm md:p-8">
              <h2 className="text-primary font-serif text-2xl">
                {cat.heading}
              </h2>
              <ul className="mt-5 space-y-2.5">
                {cat.items.map((item) => (
                  <li
                    key={item}
                    className="text-text flex items-start gap-2.5 text-base leading-snug"
                  >
                    <span
                      aria-hidden
                      className="bg-accent-gold mt-2 inline-block size-1.5 shrink-0 rounded-full"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-24" delay={0.1}>
        <section>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
              Visit the studio
            </p>
            <h2 className="text-primary font-serif text-3xl">
              Inside the shop
            </h2>
            <p className="text-text-mid mt-4 text-base leading-relaxed">
              Stop in to browse the glass wall and see materials firsthand.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {STORE_IMAGES.map((img) => (
              <div
                key={img.file}
                className="bg-cream-alt overflow-hidden rounded-md"
              >
                <Image
                  src={siteImageUrl("supplies", img.file)}
                  alt={img.alt}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      </Reveal>
    </Container>
  );
}
