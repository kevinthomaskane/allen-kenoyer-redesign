import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/motion/reveal";
import { siteImageUrl } from "@/lib/site-images";

export const metadata: Metadata = {
  title: "Cabinet Doors",
  description:
    "How to measure your cabinet door opening for a custom stained glass insert.",
};

export default function CabinetDoorsPage() {
  return (
    <Container className="py-16 md:py-24">
      <PageHeader
        eyebrow="Services"
        title="Cabinet Doors"
        lead={
          <>
            We&rsquo;re happy to help you choose glass for cabinet doors. Stop
            into the studio anytime to see the glass firsthand. We don&rsquo;t
            ship doors or glass — order the glass alone and install it yourself,
            or bring your door in and we&rsquo;ll install the glass for you.
          </>
        }
      >
        <p className="text-text-mid mt-4 text-base leading-relaxed">
          If we&rsquo;re installing the glass into the door, please remove all
          hardware (hinges and handles) before bringing the door in. Either way,
          the notes below will help you measure the glass needed and estimate
          your cost.
        </p>
      </PageHeader>

      <Reveal className="mt-16">
        <div className="bg-card overflow-hidden rounded-lg border border-black/5 shadow-sm">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="bg-cream-alt flex items-center justify-center p-8">
              <Image
                src={siteImageUrl(
                  "cabinet-doors",
                  "how-to-determine-rough-opening-sizes-figure.jpg",
                )}
                alt="Diagram showing how to determine the rough opening size of a cabinet door for a glass insert"
                width={600}
                height={600}
                className="h-auto w-full max-w-md"
              />
            </div>
            <div className="space-y-8 p-8 md:p-12">
              <section>
                <h2 className="text-primary font-serif text-2xl">
                  1. Determine the rough opening size
                </h2>
                <p className="text-text mt-3 text-sm font-medium">
                  This is the opening the glass insert will fit into.
                </p>
                <ul className="text-text-mid mt-4 space-y-3 text-base leading-relaxed">
                  <li>
                    From the back side of your cabinet door, carefully measure
                    the width of the rough opening where the glass insert will
                    be placed.
                  </li>
                  <li>
                    Round down this measurement to the nearest sixteenth of an
                    inch. For example: change 12 11/32&Prime; to 12 5/16&Prime;.
                  </li>
                  <li>
                    Now measure the height of the rough opening in the cabinet
                    door.
                  </li>
                  <li>
                    As before, round down this measurement to the nearest
                    sixteenth of an inch.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-primary font-serif text-2xl">
                  2. Deduct 1/8&Prime; from each measurement
                </h2>
                <p className="text-text-mid mt-3 text-base leading-relaxed">
                  Deduct an additional 1/8&Prime; from both the width and the
                  height. For example, if the rough opening measures 14&Prime;
                  &times; 24&Prime;, you would order a glass insert that is 13
                  7/8&Prime; &times; 23 7/8&Prime;.
                </p>
              </section>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-12" delay={0.1}>
        <aside className="border-accent-gold bg-accent-gold-light/30 mx-auto max-w-3xl rounded-md border-l-4 p-6">
          <h3 className="text-primary font-serif text-xl">Important note</h3>
          <p className="text-text mt-3 text-base leading-relaxed">
            We supply all glass inserts with square corners unless otherwise
            instructed. Some cabinet door inserts may require rounded corners.
            Examine your cabinet door opening carefully to determine your
            requirement. Small &ldquo;dime shape&rdquo; corners cost slightly
            extra and must be specified at time of order. Larger rounded corners
            require templates and are quoted on a per-project basis.
          </p>
        </aside>
      </Reveal>
    </Container>
  );
}
