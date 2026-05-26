import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, Phone, Star } from "lucide-react";
import { Container } from "@/components/container";
import { Reveal } from "@/components/motion/reveal";
import { siteImageUrl } from "@/lib/site-images";
import { newsletter, siteContact } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Stained Glass Studio in Lawndale, CA",
  description:
    "South Bay's premier stained glass studio since 1978. Custom stained glass windows & doors, classes from $15, expert repairs, and art glass supplies in Lawndale, CA.",
};

const SERVICES = [
  {
    name: "Custom Stained Glass Design",
    description:
      "Stained glass windows, entry doors, sidelights, lamps, and cabinet panels — handcrafted using traditional lead came and copper foil techniques. Free estimates.",
    href: "/custom-design",
    cta: "Learn more",
    image: { slug: "custom-design", file: "akdoors-th.jpg" },
    alt: "Custom stained glass entry door",
  },
  {
    name: "Classes & Workshops",
    description:
      "Beginner to advanced classes in copper foil, lead came, mosaics, glass fusing, and slumping. Open workshops and private instruction available. Classes from just $15.",
    href: "/classes",
    cta: "View schedule",
    image: { slug: "classes", file: "classes--img-06-beginning-foil.jpg" },
    alt: "Students in a copper foil stained glass class",
  },
  {
    name: "Art Glass Supplies & Retail",
    description:
      "Authorized dealer of Oceanside, Bullseye, and Wissmach art glass. Copper foil, lead came, fusible glass, dichroic glass, tools, grinders, soldering supplies, and more.",
    href: "/supplies",
    cta: "Browse supplies",
    image: { slug: "supplies", file: "Supplies2mr.jpg" },
    alt: "Wall of art glass supplies at the studio",
  },
];

const ABOUT_FEATURES = [
  "Stained glass repair & restoration",
  "Custom beveling & etching",
  "Free custom design estimates",
  "Lamp & crystal repair",
];

const GALLERY = [
  {
    slug: "custom-design",
    file: "redflowers-th.jpg",
    alt: "Red flowers stained glass design",
  },
  {
    slug: "custom-design",
    file: "aklilies-th-1.jpg",
    alt: "Lilies stained glass panel",
  },
  {
    slug: "custom-design",
    file: "akbevels2-th-1.jpg",
    alt: "Beveled stained glass cabinet door",
  },
  {
    slug: "custom-design",
    file: "akstarburst-th.jpg",
    alt: "Starburst stained glass design",
  },
  {
    slug: "custom-design",
    file: "aksailboat-th.jpg",
    alt: "Sailboat themed stained glass",
  },
  {
    slug: "custom-design",
    file: "akturtle.jpg",
    alt: "Turtle stained glass piece",
  },
  {
    slug: "portfolio",
    file: "portfolio--dolphins-th.jpg",
    alt: "Dolphins stained glass panel",
  },
  {
    slug: "portfolio",
    file: "portfolio--peacocks-th.jpg",
    alt: "Peacocks stained glass design",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Excellent teaching on techniques. Very detailed and personalized instruction. Very supportive and encouraging. I highly recommend taking a class.",
    author: "June Deliberto",
  },
  {
    quote:
      "Allen Kenoyer Stained Glass Shop has the best selection of glass and supplies. Everyone there is so very helpful.",
    author: "ES Reynolds",
  },
  {
    quote:
      "Did wonderful work on stained glass window repairs and finished them in the time quoted.",
    author: "Satisfied customer",
  },
  {
    quote:
      "Instructors are knowledgeable, patient, and very helpful. I would recommend anyone interested in working with glass to check this shop out!",
    author: "Donna Barrett",
  },
  {
    quote:
      "Best place for custom windows, or classes — perfect your art at AKGlass.",
    author: "Stacie O'Connor",
  },
  {
    quote: "Had custom pieces made just the way I wanted at affordable prices.",
    author: "Satisfied customer",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Services />
      <About />
      <Gallery />
      <Testimonials />
      <ClassesBanner />
      <VisitSection />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-cream relative overflow-hidden">
      <Container className="relative py-12 md:py-20">
        <div className="grid items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div>
            <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
              Lawndale, California · Founded 1978
            </p>
            <h1 className="text-primary font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
              Allen Kenoyer{" "}
              <em className="text-primary-light not-italic">Glass</em>
            </h1>
            <p className="text-text-mid mt-6 max-w-xl text-lg leading-relaxed">
              Custom stained glass windows, doors &amp; panels. Hands-on classes
              in copper foil, lead came, mosaics &amp; fused glass. Expert
              repairs and art glass supplies — serving the South Bay and Greater
              Los Angeles for over 47 years.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/classes"
                className="bg-primary text-primary-foreground hover:bg-primary-light inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-semibold transition-colors"
              >
                Explore our classes
              </Link>
              <Link
                href="/custom-design"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground inline-flex items-center gap-2 rounded-md border px-6 py-3 text-base font-semibold transition-colors"
              >
                Request a custom design
              </Link>
            </div>
            <VisitCard className="mt-8 md:mt-10" />
          </div>

          <Reveal direction="right">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md md:mx-0 md:ml-auto">
              <div className="bg-accent-rose/40 absolute -top-4 -left-4 size-24 rounded-full blur-3xl" />
              <div className="bg-primary-light/30 absolute -right-6 -bottom-6 size-32 rounded-full blur-3xl" />
              <div className="bg-accent-gold/30 absolute top-1/3 left-1/2 size-20 rounded-full blur-3xl" />
              <div className="relative grid h-full grid-cols-6 grid-rows-6 gap-3">
                <div className="bg-cream-alt relative col-span-4 row-span-4 overflow-hidden rounded-xl shadow-lg">
                  <Image
                    src={siteImageUrl("home", "akarchedBevels.jpg")}
                    alt="Arched beveled stained glass panel by Allen Kenoyer Glass"
                    fill
                    sizes="(min-width: 768px) 320px, 80vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="bg-cream-alt relative col-span-3 col-start-4 row-span-3 row-start-4 overflow-hidden rounded-xl shadow-lg">
                  <Image
                    src={siteImageUrl("home", "aklilies-th.jpg")}
                    alt="Lilies stained glass panel"
                    fill
                    sizes="(min-width: 768px) 240px, 60vw"
                    className="object-cover"
                  />
                </div>
                <div className="bg-cream-alt relative col-span-2 col-start-5 row-span-2 row-start-1 overflow-hidden rounded-xl shadow-lg">
                  <Image
                    src={siteImageUrl("home", "akbevels2-th.jpg")}
                    alt="Etched glass bevels"
                    fill
                    sizes="(min-width: 768px) 160px, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function VisitCard({ className }: { className?: string }) {
  return (
    <div
      className={`bg-card rounded-lg border border-black/5 p-5 shadow-sm ${className ?? ""}`}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-accent-gold flex items-center gap-2 text-xs font-semibold tracking-[2px] uppercase">
            <Clock className="size-4" aria-hidden /> Today &amp; this week
          </p>
          <ul className="text-text mt-3 space-y-1 text-sm">
            {siteContact.hours.map((h) => (
              <li key={h.days} className="grid grid-cols-[1fr_auto] gap-x-3">
                <span className="text-text-mid">{h.days}</span>
                <span className="font-medium">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-accent-gold flex items-center gap-2 text-xs font-semibold tracking-[2px] uppercase">
            <MapPin className="size-4" aria-hidden /> Visit the studio
          </p>
          <a
            href={siteContact.address.mapHref}
            target="_blank"
            rel="noopener"
            className="text-text hover:text-primary mt-3 block text-sm leading-relaxed transition-colors"
          >
            {siteContact.address.line1}
            <br />
            {siteContact.address.line2}
          </a>
          <a
            href={siteContact.phoneHref}
            className="text-primary hover:text-primary-light mt-2 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
          >
            <Phone className="size-3.5" aria-hidden />
            {siteContact.phone}
          </a>
        </div>
      </div>
    </div>
  );
}

function TrustBar() {
  const items = [
    { num: "47+", label: "Years of craftsmanship" },
    { num: "3,000+", label: "Satisfied customers" },
    { num: "5", label: "Creative services" },
    {
      num: (
        <span className="inline-flex items-center gap-1">
          5.0{" "}
          <Star className="text-accent-gold size-5 fill-current" aria-hidden />
        </span>
      ),
      label: "Average customer rating (70+ reviews)",
    },
  ];
  return (
    <section className="bg-plum-dark text-cream py-8 md:py-10">
      <Container>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
          {items.map((item, i) => (
            <li key={i} className="text-center">
              <p className="text-accent-gold-light font-serif text-3xl md:text-4xl">
                {item.num}
              </p>
              <p className="text-cream/85 mt-1 text-xs sm:text-sm">
                {item.label}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Services() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
            Our offerings
          </p>
          <h2 className="text-primary font-serif text-3xl sm:text-4xl">
            What we create together
          </h2>
          <p className="text-text-mid mt-4 text-base leading-relaxed">
            From one-of-a-kind custom commissions to hands-on workshops, we
            bring the beauty of stained glass to life.
          </p>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {SERVICES.map((svc, i) => (
            <Reveal key={svc.name} delay={i * 0.08}>
              <article className="bg-card group flex h-full flex-col overflow-hidden rounded-lg border border-black/5 shadow-sm transition-shadow hover:shadow-md">
                <div className="bg-cream-alt relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={siteImageUrl(svc.image.slug, svc.image.file)}
                    alt={svc.alt}
                    fill
                    sizes="(min-width: 768px) 380px, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 md:p-8">
                  <h3 className="text-primary font-serif text-2xl">
                    {svc.name}
                  </h3>
                  <p className="text-text-mid mt-3 flex-1 text-base leading-relaxed">
                    {svc.description}
                  </p>
                  <Link
                    href={svc.href}
                    className="text-primary hover:text-primary-light mt-5 inline-flex items-center gap-1.5 self-start text-base font-semibold transition-colors"
                  >
                    {svc.cta}
                    <span aria-hidden>&rarr;</span>
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function About() {
  return (
    <section className="bg-cream-alt py-20 md:py-28">
      <Container>
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <Reveal direction="right">
            <div className="relative aspect-[4/5] w-full max-w-md">
              <div className="bg-primary-pale absolute -top-6 -left-6 size-2/3 rounded-xl" />
              <div className="bg-card absolute inset-0 overflow-hidden rounded-xl shadow-md">
                <Image
                  src={siteImageUrl("home", "img-3423.jpg")}
                  alt="Stained glass piece in the Allen Kenoyer Glass studio"
                  fill
                  sizes="(min-width: 768px) 420px, 80vw"
                  className="object-cover"
                />
              </div>
              <div className="bg-card ring-cream-alt absolute -right-4 -bottom-6 aspect-square w-1/2 overflow-hidden rounded-xl shadow-lg ring-4">
                <Image
                  src={siteImageUrl("home", "img-6463.jpg")}
                  alt="Detail of a stained glass piece"
                  fill
                  sizes="(min-width: 768px) 200px, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div>
              <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
                Our story
              </p>
              <h2 className="text-primary font-serif text-3xl sm:text-4xl">
                Founded in 1978 — over 47 years &amp; 3,000 satisfied customers
              </h2>
              <p className="text-text-mid mt-6 text-base leading-relaxed">
                Allen Kenoyer Glass was founded in 1978 in Manhattan Beach and
                has called Lawndale, California home since 1987. What began as a
                passion for stained glass artistry has grown into the South
                Bay&rsquo;s premier art glass studio — offering custom design,
                expert repair and restoration, hands-on classes, and a fully
                stocked retail supply shop.
              </p>
              <p className="text-text-mid mt-4 text-base leading-relaxed">
                Led by manager Kristin Karlin and creative designer Cyndee
                Hoffman, our team brings decades of experience in lead came,
                copper foil, glass fusing, mosaics, and beveling. Whether
                you&rsquo;re a first-time student, a seasoned artisan, or a
                homeowner dreaming of a custom stained glass window —
                we&rsquo;re here to bring your vision to life.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {ABOUT_FEATURES.map((feat) => (
                  <li
                    key={feat}
                    className="text-text flex items-start gap-3 text-base"
                  >
                    <span
                      className="text-accent-gold mt-0.5 shrink-0"
                      aria-hidden
                    >
                      ✦
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="bg-primary text-primary-foreground hover:bg-primary-light mt-10 inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-semibold transition-colors"
              >
                Get in touch
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function Gallery() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
            Portfolio
          </p>
          <h2 className="text-primary font-serif text-3xl sm:text-4xl">
            A glimpse of our work
          </h2>
          <p className="text-text-mid mt-4 text-base leading-relaxed">
            From traditional florals to whimsical designs — every piece is
            crafted with care.
          </p>
        </div>
        <Reveal className="mt-12">
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {GALLERY.map((img) => (
              <li
                key={`${img.slug}/${img.file}`}
                className="bg-cream-alt group relative aspect-square overflow-hidden rounded-md"
              >
                <Image
                  src={siteImageUrl(img.slug, img.file)}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </li>
            ))}
          </ul>
        </Reveal>
        <div className="mt-10 text-center">
          <Link
            href="/portfolio"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground inline-flex items-center gap-2 rounded-md border px-6 py-3 text-base font-semibold transition-colors"
          >
            View full portfolio <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-primary-pale py-20 md:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
            What our customers say
          </p>
          <h2 className="text-primary font-serif text-3xl sm:text-4xl">
            Trusted by the South Bay community
          </h2>
          <p className="text-text-mid mt-4 text-base leading-relaxed">
            With a 5.0-star rating across 70+ reviews, our customers love their
            experience at Allen Kenoyer Glass.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <blockquote className="bg-card flex h-full flex-col rounded-lg border border-black/5 p-6 shadow-sm">
                <div className="text-accent-gold flex gap-0.5" aria-hidden>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="text-text mt-4 flex-1 text-base leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <cite className="text-text-mid mt-5 block text-sm not-italic">
                  &mdash; {t.author}
                </cite>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ClassesBanner() {
  return (
    <section className="py-20 md:py-24">
      <Container>
        <Reveal>
          <div className="bg-plum-dark text-cream relative overflow-hidden rounded-xl px-8 py-14 text-center md:px-12 md:py-20">
            <p className="text-accent-gold-light mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
              Stained glass classes in Los Angeles
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl">
              Ready to create something beautiful?
            </h2>
            <p className="text-cream/85 mx-auto mt-5 max-w-2xl text-base leading-relaxed">
              Our classes are perfect for beginners and experienced crafters
              alike. Learn copper foil, lead came, mosaics, glass fusing, and
              slumping in a warm, supportive studio.
            </p>
            <ul className="text-cream/90 mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm sm:text-base">
              <li className="flex items-center gap-2">
                <span className="text-accent-gold" aria-hidden>
                  ✦
                </span>
                Workshops from $15
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-gold" aria-hidden>
                  ✦
                </span>
                Private instruction available
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-gold" aria-hidden>
                  ✦
                </span>
                All supplies in-store
              </li>
            </ul>
            <Link
              href="/classes"
              className="bg-accent-gold text-plum-dark hover:bg-accent-gold-light mt-10 inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-semibold transition-colors"
            >
              See our class schedule
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function VisitSection() {
  return (
    <section className="bg-cream-alt py-20 md:py-24">
      <Container>
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <div>
              <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3.5px] uppercase">
                Visit our Lawndale studio
              </p>
              <h2 className="text-primary font-serif text-3xl sm:text-4xl">
                Come see us
              </h2>
              <div className="bg-card mt-8 rounded-lg border border-black/5 p-6 shadow-sm">
                <a
                  href={siteContact.address.mapHref}
                  target="_blank"
                  rel="noopener"
                  className="text-text hover:text-primary block text-lg font-medium transition-colors"
                >
                  {siteContact.address.line1}
                  <br />
                  {siteContact.address.line2}
                </a>
                <p className="text-text-mid mt-2 text-sm italic">
                  Enter from rear parking lot.
                </p>
              </div>
              <ul className="mt-6 space-y-3 text-base">
                <li>
                  <a
                    href={siteContact.phoneHref}
                    className="text-text hover:text-primary inline-flex items-center gap-3 transition-colors"
                  >
                    <Phone className="text-accent-gold size-5" aria-hidden />
                    {siteContact.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={siteContact.emailHref}
                    className="text-text hover:text-primary inline-flex items-center gap-3 transition-colors"
                  >
                    <span
                      className="text-accent-gold w-5 text-center"
                      aria-hidden
                    >
                      @
                    </span>
                    {siteContact.email}
                  </a>
                </li>
              </ul>
              <a
                href={siteContact.emailHref}
                className="bg-primary text-primary-foreground hover:bg-primary-light mt-8 inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-semibold transition-colors"
              >
                Send us an email
              </a>
            </div>
          </Reveal>

          <Reveal direction="left">
            <div className="bg-card rounded-lg border border-black/5 p-6 shadow-sm md:p-8">
              <h3 className="text-primary font-serif text-2xl">
                Hours of operation
              </h3>
              <ul className="text-text mt-6 space-y-3 text-base">
                {siteContact.hours.map((h) => (
                  <li
                    key={h.days}
                    className="border-primary/10 grid grid-cols-[1fr_auto] gap-4 border-b pb-3 last:border-none last:pb-0"
                  >
                    <span className="text-text-mid">{h.days}</span>
                    <span className="font-medium">{h.time}</span>
                  </li>
                ))}
              </ul>
              <div className="border-primary/10 mt-8 border-t pt-6">
                <p className="text-text text-base leading-relaxed">
                  Stay inspired — get updates on classes &amp; new designs.
                </p>
                <a
                  href={newsletter.signupHref}
                  target="_blank"
                  rel="noopener"
                  className="bg-accent-gold text-plum-dark hover:bg-accent-gold-light mt-4 inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-semibold transition-colors"
                >
                  Subscribe to our newsletter
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
