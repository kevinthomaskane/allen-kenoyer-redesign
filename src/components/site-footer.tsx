import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import { Container } from "@/components/container";
import { footerSections, siteContact } from "@/lib/site-config";

// Site footer. Structure:
//   - Top: logo + tagline + social (left), contact card (right)
//   - Middle: four sitemap columns (Services / Classes / Supplies / Studio)
//   - Bottom: copyright row
//
// Group headings mirror the header dropdowns so users see the same mental
// model in both places. All link names match the header's short forms.
export function SiteFooter() {
  return (
    <footer className="bg-plum-dark text-cream mt-24">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div>
            <Image
              src="/logo-allen-kenoyer-glass.png"
              alt="Allen Kenoyer Glass"
              width={220}
              height={50}
              className="brightness-0 invert"
            />
            <p className="text-cream/80 mt-4 max-w-sm text-base">
              Crafting beauty and light since 1978.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <SocialLink href={siteContact.social.facebook} label="Facebook" />
              <SocialLink
                href={siteContact.social.instagram}
                label="Instagram"
              />
              <SocialLink
                href={siteContact.social.pinterest}
                label="Pinterest"
              />
            </div>
          </div>

          <div className="md:text-right">
            <h3 className="text-accent-gold-light text-base font-medium tracking-wide uppercase">
              Visit or Call
            </h3>
            <a
              href={siteContact.address.mapHref}
              target="_blank"
              rel="noopener"
              className="hover:text-accent-gold-light mt-3 inline-flex items-center gap-2 transition-colors"
            >
              <MapPin className="size-4" aria-hidden />
              <span>
                {siteContact.address.line1}, {siteContact.address.line2}
              </span>
            </a>
            <div>
              <a
                href={siteContact.phoneHref}
                className="hover:text-accent-gold-light mt-2 inline-flex items-center gap-2 font-medium transition-colors"
              >
                <Phone className="size-4" aria-hidden />
                <span>{siteContact.phone}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-cream/10 mt-12 grid gap-10 border-t pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.heading}>
              <h4 className="text-accent-gold-light text-sm font-medium tracking-wide uppercase">
                {section.heading}
              </h4>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-cream/80 hover:text-cream transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-cream/10 mt-12 border-t pt-6">
          <p className="text-cream/60 text-sm">
            &copy; {new Date().getFullYear()} Allen Kenoyer Glass. All rights
            reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="text-cream/80 hover:text-cream underline-offset-4 transition-colors hover:underline"
    >
      {label}
    </a>
  );
}
