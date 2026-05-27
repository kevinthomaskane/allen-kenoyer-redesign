import { MapPin, Phone } from "lucide-react";
import { Container } from "@/components/container";
import { siteContact } from "@/lib/site-config";

// Sticky info bar above the nav. Surfaces the studio's address and phone on
// every page per Kristin's "prominently displayed" requirement. Both items
// are clickable: address opens Google Maps directions, phone is a tel: link.
//
// Older-audience considerations: generous tap targets, text never smaller
// than 14px, high-contrast primary background against cream below — color
// matched to the phone CTA in SiteNav.
export function InfoBar() {
  return (
    <div className="bg-primary text-primary-foreground border-b border-black/10 py-2 text-sm">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 sm:justify-between md:justify-center">
          <a
            href={siteContact.address.mapHref}
            target="_blank"
            rel="noopener"
            className="hover:text-accent-gold-light flex items-center gap-2 transition-colors"
          >
            <MapPin className="size-4 shrink-0" aria-hidden />
            <span>
              {siteContact.address.line1}, {siteContact.address.line2}
            </span>
          </a>
          <a
            href={siteContact.phoneHref}
            className="hover:text-accent-gold-light flex items-center gap-2 font-medium transition-colors md:hidden"
          >
            <Phone className="size-4 shrink-0" aria-hidden />
            <span>{siteContact.phone}</span>
          </a>
        </div>
      </Container>
    </div>
  );
}
