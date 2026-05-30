import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
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
    <section className="hero-bg-gradient relative isolate flex min-h-[88vh] items-center overflow-hidden">
      <Image
        src={siteImageUrl("home", "ak-store-front_1000x492.jpg")}
        alt=""
        fill
        priority
        sizes="100vw"
        aria-hidden
        className="absolute inset-0 -z-10 scale-[1.06] object-cover object-[center_30%] opacity-[0.08] blur-[2px]"
      />
      <Container className="relative z-10 grid w-full items-center gap-12 py-24 md:grid-cols-2 md:gap-20 md:py-28">
        <div className="text-white">
          <p className="text-accent-gold-light mb-5 text-xs font-semibold tracking-[3px] uppercase">
            Lawndale, California · Founded 1978
          </p>
          <h1 className="font-serif text-5xl leading-[1.12] font-bold sm:text-6xl md:text-7xl">
            Allen Kenoyer{" "}
            <em className="text-accent-gold-light italic">Glass</em>
          </h1>
          <p className="mt-6 max-w-md text-base leading-[1.85] font-light text-white/90 sm:text-lg">
            Custom stained glass windows, doors &amp; panels. Hands-on classes
            in copper foil, lead came, mosaics &amp; fused glass. Expert repairs
            and art glass supplies — serving the South Bay and Greater Los
            Angeles for over 47 years.
          </p>
          <div className="mt-10 flex flex-wrap gap-5">
            <Link
              href="/classes"
              className="from-primary to-primary-light shadow-primary/30 inline-flex items-center rounded-full bg-gradient-to-br px-9 py-4 text-base font-semibold text-white shadow-lg transition-transform hover:-translate-y-1"
            >
              Explore our classes
            </Link>
            <Link
              href="/custom-design"
              className="inline-flex items-center rounded-full border-[1.5px] border-white/55 bg-white/15 px-9 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:-translate-y-1 hover:border-white hover:bg-white/25"
            >
              Request a custom design
            </Link>
          </div>
        </div>

        <Reveal direction="right">
          <div className="relative mx-auto h-[480px] w-full max-w-md md:mx-0 md:ml-auto">
            <span className="glass-gem gem-purple" aria-hidden />
            <span className="glass-gem gem-rose" aria-hidden />
            <span className="glass-gem gem-gold" aria-hidden />
            <div className="absolute top-0 left-0 z-30 h-[420px] w-[58%] -rotate-2 overflow-hidden rounded-2xl border-4 border-white/20 shadow-2xl shadow-black/40">
              <Image
                src={siteImageUrl(
                  "home",
                  "peacock-stained-glass-double-door_500x717.jpg",
                )}
                alt="Peacock stained glass double door panels by Allen Kenoyer Glass"
                fill
                sizes="(min-width: 768px) 290px, 55vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute top-[30px] right-0 z-20 h-[340px] w-[44%] rotate-3 overflow-hidden rounded-2xl border-4 border-white/20 shadow-2xl shadow-black/35">
              <Image
                src={siteImageUrl(
                  "home",
                  "tulip-floral-stained-glass-window_500x717.jpg",
                )}
                alt="Tulip floral stained glass window custom design"
                fill
                sizes="(min-width: 768px) 220px, 44vw"
                className="object-cover"
              />
            </div>
            <div className="absolute right-[18%] -bottom-5 z-40 h-[220px] w-[38%] -rotate-1 overflow-hidden rounded-2xl border-4 border-white/20 shadow-2xl shadow-black/40">
              <Image
                src={siteImageUrl(
                  "home",
                  "ocean-dolphin-stained-glass-door-sidelights_500x717.jpg",
                )}
                alt="Ocean dolphin stained glass door sidelights"
                fill
                sizes="(min-width: 768px) 190px, 38vw"
                className="object-cover"
              />
            </div>
          </div>
        </Reveal>
      </Container>
      <div className="hero-rainbow-strip absolute right-0 bottom-0 left-0 z-30 h-[7px]" />
    </section>
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
      label: "Average customer rating",
    },
  ];
  return (
    <section className="border-primary/10 border-b bg-white py-10 md:py-12">
      <Container>
        <ul className="flex flex-wrap items-center justify-center gap-x-0 gap-y-6">
          {items.map((item, i) => (
            <li key={i} className="flex items-center">
              <div className="px-6 text-center md:px-14">
                <p className="text-primary font-serif text-3xl font-bold md:text-4xl">
                  {item.num}
                </p>
                <p className="text-text-mid mt-2 text-[0.72rem] font-medium tracking-[2px] uppercase">
                  {item.label}
                </p>
              </div>
              {i < items.length - 1 && (
                <span
                  aria-hidden
                  className="via-primary/20 hidden h-[52px] w-px bg-gradient-to-b from-transparent to-transparent md:block"
                />
              )}
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
    <section className="bg-white py-20 md:py-28">
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
    <section className="bg-cream-alt py-20 md:py-28">
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
    <section className="bg-white py-20 md:py-28">
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
              <blockquote className="bg-cream border-accent-gold flex h-full flex-col rounded-xl border-l-4 px-8 py-10">
                <p className="text-text-mid flex-1 text-[0.95rem] leading-[1.85] italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <cite className="text-primary mt-5 block text-sm font-semibold not-italic">
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
  const pricing = [
    "Workshops from $15",
    "Private instruction available",
    "All supplies in-store",
  ];
  return (
    <section className="py-20 md:py-28">
      <Container>
        <Reveal>
          <div className="classes-banner-bg relative overflow-hidden rounded-3xl px-8 py-20 text-center text-white md:px-20 md:py-24">
            <p className="text-accent-gold-light relative z-10 mb-5 text-xs font-semibold tracking-[3px] uppercase">
              Stained glass classes in Los Angeles
            </p>
            <h2 className="relative z-10 font-serif text-3xl sm:text-4xl md:text-5xl">
              Ready to create something beautiful?
            </h2>
            <p className="relative z-10 mx-auto mt-6 max-w-2xl text-base leading-[1.85] font-light text-white/90 sm:text-lg">
              Our classes are perfect for beginners and experienced crafters
              alike. Learn copper foil, lead came, mosaics, glass fusing, and
              slumping in a warm, supportive studio.
            </p>
            <ul className="relative z-10 mt-10 flex flex-wrap justify-center gap-3 text-sm">
              {pricing.map((p) => (
                <li
                  key={p}
                  className="rounded-full border border-white/30 bg-white/15 px-6 py-2 font-medium text-white backdrop-blur-sm"
                >
                  + {p}
                </li>
              ))}
            </ul>
            <Link
              href="/classes"
              className="text-primary hover:bg-accent-gold relative z-10 mt-12 inline-flex items-center rounded-full bg-white px-9 py-4 text-sm font-bold tracking-[1px] uppercase shadow-lg shadow-black/15 transition hover:-translate-y-1 hover:text-white"
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
    <section className="bg-cream py-20 md:py-28">
      <Container>
        <div className="grid gap-12 md:grid-cols-2 md:gap-20">
          <Reveal>
            <div>
              <p className="text-accent-gold mb-3 text-xs font-semibold tracking-[3px] uppercase">
                Visit our Lawndale studio
              </p>
              <h2 className="text-primary font-serif text-3xl sm:text-4xl md:text-5xl">
                Come see us
              </h2>
              <a
                href={siteContact.address.mapHref}
                target="_blank"
                rel="noopener"
                className="text-text hover:text-primary mt-8 block text-lg leading-relaxed transition-colors"
              >
                {siteContact.address.line1}
                <br />
                {siteContact.address.line2}
              </a>
              <p className="text-text-mid mt-2 text-base italic">
                Enter from rear parking lot
              </p>
              <ul className="text-text mt-8 space-y-2 text-base">
                <li>
                  <span className="text-text-mid">Phone: </span>
                  <a
                    href={siteContact.phoneHref}
                    className="text-primary hover:text-primary-light font-semibold transition-colors"
                  >
                    {siteContact.phone}
                  </a>
                </li>
                <li>
                  <span className="text-text-mid">Email: </span>
                  <a
                    href={siteContact.emailHref}
                    className="text-primary hover:text-primary-light font-semibold transition-colors"
                  >
                    {siteContact.email}
                  </a>
                </li>
              </ul>
              <a
                href={siteContact.emailHref}
                className="from-primary to-primary-light shadow-primary/30 mt-10 inline-flex items-center rounded-full bg-gradient-to-br px-8 py-3.5 text-sm font-bold tracking-[1px] text-white uppercase shadow-lg transition hover:-translate-y-1"
              >
                Send us an email
              </a>
            </div>
          </Reveal>

          <Reveal direction="left">
            <div className="bg-card border-accent-gold relative rounded-2xl border-t-4 p-8 shadow-sm md:p-10">
              <h3 className="text-primary font-serif text-2xl md:text-3xl">
                Hours of operation
              </h3>
              <ul className="text-text mt-6 space-y-4 text-base">
                {siteContact.hours.map((h) => (
                  <li
                    key={h.days}
                    className="border-primary/15 grid grid-cols-[1fr_auto] gap-4 border-b border-dashed pb-4 last:border-none last:pb-0"
                  >
                    <span className="text-text-mid">{h.days}</span>
                    <span className="font-semibold">{h.time}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 text-center">
                <p className="text-text-mid text-base italic">
                  Stay inspired — get updates on classes &amp; new designs.
                </p>
                <a
                  href={newsletter.signupHref}
                  target="_blank"
                  rel="noopener"
                  className="bg-accent-gold hover:bg-accent-gold-light mt-4 inline-flex items-center rounded-full px-8 py-3.5 text-sm font-bold tracking-[1px] text-white uppercase shadow-md transition hover:-translate-y-1"
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
