import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/motion/reveal";
import { siteImageUrl } from "@/lib/site-images";
import { newsletter, siteContact } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Visit Allen Kenoyer Glass at 4571 Artesia Blvd, Lawndale, CA. Call (310) 542-6225 or email akglass@allenkenoyerglass.com.",
};

const STUDIO_IMAGES = [
  {
    file: "contact--img-3522.jpg",
    alt: "Inside the Allen Kenoyer Glass studio in Lawndale",
  },
  {
    file: "contact--img-7443.jpg",
    alt: "Studio workspace with stained glass in progress",
  },
  {
    file: "contact--img-6383.jpg",
    alt: "Stained glass displays at the Allen Kenoyer Glass studio",
  },
];

const INDUSTRY_LINKS = [
  {
    label: "RAGS retailer map",
    href: "https://tinyurl.com/4a83w3ck",
    description:
      "Retail Art Glass Supplier map — find independent stained glass retailers across the country.",
  },
  {
    label: "Stained Glass Association of America",
    href: "https://stainedglass.org",
    description:
      "The trade association for stained glass artisans, with directories, education, and resources.",
  },
];

export default function ContactPage() {
  return (
    <Container className="py-16 md:py-24">
      <PageHeader
        eyebrow="Visit the Studio"
        title="Come See Us"
        lead={
          <>
            We can help with all your stained glass needs — custom design,
            supplies, classes, repairs, gifts, and custom beveling. Stop by the
            studio or get in touch.
          </>
        }
      />

      <Reveal className="mt-16">
        <div className="grid gap-6 md:grid-cols-5">
          <section className="bg-card rounded-lg border border-black/5 p-8 shadow-sm md:col-span-3 md:p-10">
            <h2 className="text-primary font-serif text-2xl">
              Contact details
            </h2>

            <ul className="mt-6 space-y-5">
              <li className="flex items-start gap-3">
                <MapPin
                  className="text-accent-gold mt-1 size-5 shrink-0"
                  aria-hidden
                />
                <a
                  href={siteContact.address.mapHref}
                  target="_blank"
                  rel="noopener"
                  className="text-text hover:text-primary text-base transition-colors"
                >
                  {siteContact.address.line1}
                  <br />
                  {siteContact.address.line2}
                  <span className="text-text-mid mt-1 block text-sm italic">
                    Enter from rear parking lot
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone
                  className="text-accent-gold mt-1 size-5 shrink-0"
                  aria-hidden
                />
                <a
                  href={siteContact.phoneHref}
                  className="text-text hover:text-primary text-base font-medium transition-colors"
                >
                  {siteContact.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail
                  className="text-accent-gold mt-1 size-5 shrink-0"
                  aria-hidden
                />
                <div>
                  <a
                    href={siteContact.emailHref}
                    className="text-text hover:text-primary block text-base font-medium transition-colors"
                  >
                    {siteContact.email}
                  </a>
                  <a
                    href={siteContact.classesEmailHref}
                    className="text-text-mid hover:text-primary mt-1 block text-sm transition-colors"
                  >
                    {siteContact.classesEmail} (classes)
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock
                  className="text-accent-gold mt-1 size-5 shrink-0"
                  aria-hidden
                />
                <div>
                  <p className="text-text text-base font-medium">
                    Hours of operation
                  </p>
                  <ul className="text-text-mid mt-2 space-y-1 text-sm">
                    {siteContact.hours.map((h) => (
                      <li
                        key={h.days}
                        className="grid grid-cols-[1fr_auto] gap-x-4"
                      >
                        <span>{h.days}</span>
                        <span>{h.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </ul>

            <p className="text-text-mid mt-8 border-t border-black/5 pt-6 text-sm leading-relaxed italic">
              A full contact form is coming with the next site update. In the
              meantime, please call or email — we&rsquo;ll get right back to
              you.
            </p>
          </section>

          <aside className="md:col-span-2">
            <div className="bg-cream-alt overflow-hidden rounded-lg">
              <a
                href={siteContact.address.mapHref}
                target="_blank"
                rel="noopener"
                className="block"
                aria-label="Open studio location in Google Maps"
              >
                <Image
                  src={siteImageUrl("contact", "contact--location-map.jpg")}
                  alt="Map showing Allen Kenoyer Glass studio in Lawndale, CA"
                  width={800}
                  height={800}
                  className="h-auto w-full"
                />
              </a>
            </div>
          </aside>
        </div>
      </Reveal>

      <Reveal className="mt-20" delay={0.1}>
        <section className="bg-plum-dark text-cream overflow-hidden rounded-lg p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="text-accent-gold-light mb-2 text-xs font-semibold tracking-[3.5px] uppercase">
                Newsletter
              </p>
              <h2 className="font-serif text-3xl">
                Stay informed about classes &amp; new designs
              </h2>
              <p className="text-cream/85 mt-4 text-base leading-relaxed">
                Subscribe through Constant Contact to get our newsletter in your
                inbox.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <a
                href={newsletter.signupHref}
                target="_blank"
                rel="noopener"
                className="bg-accent-gold text-plum-dark hover:bg-accent-gold-light inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-base font-semibold transition-colors"
              >
                Join the newsletter
                <span aria-hidden>&rarr;</span>
              </a>
              <a
                href={newsletter.latestHref}
                target="_blank"
                rel="noopener"
                className="text-cream/85 hover:text-cream text-sm underline-offset-4 hover:underline"
              >
                View the latest edition
              </a>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal className="mt-20" delay={0.1}>
        <section>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
              Inside the studio
            </p>
            <h2 className="text-primary font-serif text-3xl">
              A glimpse of where we work
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {STUDIO_IMAGES.map((img) => (
              <div
                key={img.file}
                className="bg-cream-alt overflow-hidden rounded-md"
              >
                <Image
                  src={siteImageUrl("contact", img.file)}
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

      <Reveal className="mt-20" delay={0.1}>
        <section className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
              Resources
            </p>
            <h2 className="text-primary font-serif text-3xl">
              Industry &amp; community
            </h2>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {INDUSTRY_LINKS.map((link) => (
              <li
                key={link.label}
                className="bg-card rounded-lg border border-black/5 p-5"
              >
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener"
                  className="text-primary text-base font-medium underline-offset-4 hover:underline"
                >
                  {link.label} <span aria-hidden>&rarr;</span>
                </a>
                <p className="text-text-mid mt-2 text-sm leading-relaxed">
                  {link.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>
    </Container>
  );
}
