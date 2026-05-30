import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/motion/reveal";
import { siteImageUrl } from "@/lib/site-images";
import { siteContact } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Custom Stained Glass Design",
  description:
    "Custom stained glass design and fabrication: windows, lamps, doors, tabletops, and cabinet doors. Free estimates. Over 45 years and 3,000 satisfied customers.",
};

// Source: content/custom-design/content.md.
// Caption text preserved from the legacy page; the "45 Years" figure comes
// from Kristin's website-outline.md update (replacing the legacy "39 Years").
const STEPS = [
  {
    title: "Decide what kind of design you might like",
    body: (
      <>
        <p>
          You don&rsquo;t need to know exactly what you want, but a few ideas
          help us shape the project:
        </p>
        <ul className="mt-3 space-y-2 pl-5">
          <li className="list-disc">
            Is there a theme you love? (garden, birds, abstract, religious)
          </li>
          <li className="list-disc">
            Is there an architectural style or detail in the space you want to
            complement?
          </li>
          <li className="list-disc">
            Found a pattern you like in a book or online — even one you might
            modify? Have a picture of a window or cabinet you admire?
          </li>
        </ul>
        <p className="text-text-mid mt-3 text-sm italic">
          Keep in mind: the more detail involved, the more the piece is likely
          to cost.
        </p>
      </>
    ),
  },
  {
    title: "Pick a color palette",
    body: (
      <p>
        Bring in swatches, paint chips, or photos of the room — anything that
        captures the colors you want to work into the design.
      </p>
    ),
  },
  {
    title: "Decide if you want to see through the glass",
    body: (
      <p>
        Sometimes you want a clear view through the glass; other times the whole
        point is privacy. Either is fine — let us know which.
      </p>
    ),
  },
  {
    title: "Measure the piece",
    body: (
      <>
        <p>
          We&rsquo;ll explain the exact measurements you need at the time of
          ordering, but here&rsquo;s a general guide:
        </p>
        <ul className="mt-3 space-y-2 pl-5">
          <li className="list-disc">
            For cabinet doors, measure the opening where the glass will sit, not
            the actual hole.
          </li>
          <li className="list-disc">
            For windows, measure the inside dimension where the glass will hang.
          </li>
          <li className="list-disc">
            For doors or sidelights, measure the visible glass from edge to
            edge.
          </li>
          <li className="list-disc">
            Anything rounded needs a more specific dimension.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Place the order",
    body: (
      <p>
        When you talk with us, we&rsquo;ll walk through ideas, choices, and
        installation. Once everything&rsquo;s decided, we&rsquo;ll give you an
        estimated cost and a target completion date.
      </p>
    ),
  },
];

const GALLERY = [
  {
    file: "redflowers-th.jpg",
    caption: "Bring a flower garden indoors, for all-season beauty.",
    alt: "Red flowers stained glass design",
  },
  {
    file: "akbevels2-th-1.jpg",
    caption: "Beveled cabinet doors and bathroom windows for elegant privacy.",
    alt: "Beveled stained glass cabinet door",
  },
  {
    file: "akdoors-th.jpg",
    caption: "Entry and interior doors that make a tasteful statement.",
    alt: "Stained glass entry door",
  },
  {
    file: "aklilies-th-1.jpg",
    caption: "Special occasions, hanging panels, gifts, and much more.",
    alt: "Lilies stained glass panel",
  },
  {
    file: "aksailboat-th.jpg",
    caption: "Any theme or decor can be enhanced by adding art glass.",
    alt: "Sailboat themed stained glass",
  },
  {
    file: "akstarburst-th.jpg",
    caption:
      "From traditional to contemporary — our designer can create something special for your home.",
    alt: "Starburst stained glass design",
  },
  {
    file: "akturtle.jpg",
    caption: "Surprise a loved one or indulge yourself.",
    alt: "Turtle stained glass piece",
  },
  {
    file: "aktiger6.gif",
    caption: "Whimsy and fantasy for beauty and fun.",
    alt: "Tiger-themed whimsical stained glass",
  },
];

export default function CustomDesignPage() {
  return (
    <Container className="py-16 md:py-24">
      <PageHeader
        eyebrow="Services"
        title="Custom Stained Glass Design"
        lead={
          <>
            Over 45 years and 3,000 satisfied customers. Bring out the natural
            beauty of your home with our designs and techniques — we can
            coordinate with your architect, decorator, or contractor.
          </>
        }
      >
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={siteContact.phoneHref}
            className="bg-primary text-primary-foreground hover:bg-primary-light inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-medium transition-colors"
          >
            Call for a free estimate
          </a>
          <span className="text-text-mid text-base">
            <a
              href={siteContact.phoneHref}
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {siteContact.phone}
            </a>
          </span>
        </div>
        <p className="text-text-mid mt-6 text-base leading-relaxed">
          We also do repair and restoration of stained glass windows and lamps,
          and design and fabricate windows, lamps, doors, tabletops, and kitchen
          cabinet doors.
        </p>
      </PageHeader>

      <Reveal className="mt-20">
        <section>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
              How to Order
            </p>
            <h2 className="text-primary font-serif text-3xl sm:text-4xl">
              Stained glass custom ordering
            </h2>
            <p className="text-text-mid mt-4 text-base leading-relaxed">
              Here are some helpful steps in preparing to order custom glass.
            </p>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-2">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="bg-card flex gap-5 rounded-lg border border-black/5 p-6 shadow-sm md:p-8"
              >
                <span
                  className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full font-serif text-lg"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-primary font-serif text-xl">
                    {step.title}
                  </h3>
                  <div className="text-text-mid mt-3 space-y-3 text-base leading-relaxed">
                    {step.body}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <p className="text-text-mid mx-auto mt-10 max-w-2xl text-center text-base leading-relaxed">
            This process can feel a bit overwhelming at first. Feel free to{" "}
            <a
              href={siteContact.phoneHref}
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              call {siteContact.phone}
            </a>{" "}
            or come in with questions and we&rsquo;ll help.
          </p>
        </section>
      </Reveal>

      <Reveal className="mt-24" delay={0.1}>
        <section>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
              Inspiration
            </p>
            <h2 className="text-primary font-serif text-3xl">
              What we can create together
            </h2>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY.map((item) => (
              <li
                key={item.file}
                className="bg-card overflow-hidden rounded-lg border border-black/5 shadow-sm"
              >
                <div className="bg-cream-alt aspect-[4/3] overflow-hidden">
                  <Image
                    src={siteImageUrl("custom-design", item.file)}
                    alt={item.alt}
                    width={600}
                    height={450}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-text-mid p-5 text-sm leading-relaxed">
                  {item.caption}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>
    </Container>
  );
}
