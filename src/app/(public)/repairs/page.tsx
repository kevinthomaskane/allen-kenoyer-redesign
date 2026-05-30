import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/motion/reveal";
import { siteImageUrl } from "@/lib/site-images";
import { siteContact } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Stained Glass Repairs",
  description:
    "Expert stained glass repair: windows, doors, sidelights, lampshades, table tops, and stemware. Allen Kenoyer Glass in Lawndale, CA.",
};

const REPAIR_ITEMS = [
  "Windows",
  "Doors",
  "Sidelights",
  "Lampshades",
  "Table tops",
  "Stemware",
];

const BEFORE_IMAGES = [
  {
    file: "CityBroke3.jpg",
    alt: "Damaged stained glass cityscape with broken pieces marked in blue tape",
  },
  {
    file: "CityBroke1.jpg",
    alt: "Closer view of broken stained glass pieces marked in blue tape",
  },
  {
    file: "CityBroke2.jpg",
    alt: "Detail of broken stained glass cityscape awaiting repair",
  },
];

export default function RepairsPage() {
  return (
    <Container className="py-16 md:py-24">
      <PageHeader
        eyebrow="Services"
        title="Stained Glass Repair Services"
        lead={
          <>
            Allen Kenoyer Glass does many types of repairs — from small items to
            full panel restorations. Give us a call at{" "}
            <a
              href={siteContact.phoneHref}
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {siteContact.phone}
            </a>
            .
          </>
        }
      />

      <Reveal className="mt-16">
        <section className="bg-card mx-auto max-w-3xl rounded-lg border border-black/5 p-8 shadow-sm md:p-12">
          <h2 className="text-primary font-serif text-2xl">Items we repair</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {REPAIR_ITEMS.map((item) => (
              <li
                key={item}
                className="text-text flex items-center gap-3 text-base"
              >
                <span
                  aria-hidden
                  className="bg-accent-gold inline-block size-1.5 shrink-0 rounded-full"
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-text-mid mt-8 text-sm leading-relaxed">
            Feel free to email pictures to{" "}
            <a
              href="mailto:akglass@allenkenoyerglass.com"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              akglass@allenkenoyerglass.com
            </a>{" "}
            and we&rsquo;ll be in touch.
          </p>
        </section>
      </Reveal>

      <Reveal className="mt-20" delay={0.1}>
        <section className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
              Before
            </p>
            <h2 className="text-primary font-serif text-3xl">
              A cityscape brought in for repair
            </h2>
            <p className="text-text-mid mx-auto mt-4 max-w-2xl text-base leading-relaxed">
              This stained glass cityscape was badly damaged. The blue pieces of
              tape mark every broken section.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {BEFORE_IMAGES.map((img) => (
              <div
                key={img.file}
                className="bg-cream-alt overflow-hidden rounded-md"
              >
                <Image
                  src={siteImageUrl("repairs", img.file)}
                  alt={img.alt}
                  width={800}
                  height={600}
                  className="h-auto w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal className="mt-16" delay={0.15}>
        <section className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
              After
            </p>
            <h2 className="text-primary font-serif text-3xl">Fully restored</h2>
            <p className="text-text-mid mx-auto mt-4 max-w-2xl text-base leading-relaxed">
              Every broken piece replaced, every tape strip gone.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl">
            <div className="bg-cream-alt overflow-hidden rounded-md">
              <Image
                src={siteImageUrl("repairs", "CityFix1.jpg")}
                alt="Fully restored stained glass cityscape — all broken pieces replaced"
                width={1200}
                height={900}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </section>
      </Reveal>
    </Container>
  );
}
