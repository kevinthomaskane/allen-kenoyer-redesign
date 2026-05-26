import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/motion/reveal";
import { siteImageUrl } from "@/lib/site-images";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "A gallery of stained glass work by Allen Kenoyer Glass — windows, doors, panels, and custom installations since 1978.",
};

// Merged from the legacy /portfolio/ and /custom-design/more-custom-photos/
// pages per website-outline.md. All files live in site-images/portfolio/
// (the migration script preserves the original folder-derived prefix in the
// filename to keep both source galleries non-colliding).
type PortfolioImage = { file: string; alt: string; caption?: string };

const IMAGES: PortfolioImage[] = [
  { file: "portfolio--lily-th.jpg", alt: "Lily stained glass panel" },
  { file: "portfolio--3fish-th.jpg", alt: "Three-fish stained glass panel" },
  {
    file: "portfolio--dolphins-th.jpg",
    alt: "Dolphins stained glass panel — aquatic scene",
  },
  {
    file: "portfolio--abstract-th.jpg",
    alt: "Abstract contemporary stained glass design",
  },
  {
    file: "portfolio--victorian-th.jpg",
    alt: "Victorian-style stained glass panel",
  },
  { file: "portfolio--albert-th.jpg", alt: "Stained glass portrait panel" },
  { file: "portfolio--charlie-th.jpg", alt: "Whimsical stained glass design" },
  { file: "portfolio--wizard-th.jpg", alt: "Wizard fantasy stained glass" },
  {
    file: "portfolio--indian-th.jpg",
    alt: "Stained glass panel with cultural motif",
  },
  {
    file: "portfolio--bathroom-th.jpg",
    alt: "Bathroom stained glass window for privacy",
  },
  { file: "portfolio--iris-th.jpg", alt: "Iris floral stained glass" },
  { file: "portfolio--roses-th.jpg", alt: "Roses stained glass panel" },
  { file: "portfolio--peacocks-th.jpg", alt: "Peacocks stained glass design" },
  { file: "portfolio--trees-th.jpg", alt: "Trees nature stained glass scene" },
  {
    file: "portfolio--peacockr-th.jpg",
    alt: "Peacock detail stained glass piece",
  },
  {
    file: "more-custom-photos--db_1000_OAKS_WINDOW-2a1.jpg",
    alt: "Custom stained glass window installed in a home",
    caption: "Custom window",
  },
  {
    file: "more-custom-photos--db_BEV_GLASS_WINDOW-2a1.jpg",
    alt: "Beveled stained glass window",
    caption: "Beveled glass window",
  },
  {
    file: "more-custom-photos--db_CROCKETT3a1.jpg",
    alt: "Stained glass entry doors",
    caption: "Entry doors",
  },
  {
    file: "more-custom-photos--db_HERMOSA-BEVELa4a1.jpg",
    alt: "Hermosa Beach beveled glass installation",
    caption: "Hermosa beveled installation",
  },
  {
    file: "more-custom-photos--db_HERMOSA-BEVEL2a1.jpg",
    alt: "Hermosa Beach beveled glass — second view",
    caption: "Hermosa beveled — view 2",
  },
  {
    file: "more-custom-photos--db_IRRID_FLOWERaa1.jpg",
    alt: "Iridescent stained glass flower panel",
    caption: "Iridescent flower",
  },
  {
    file: "more-custom-photos--db_Kaaa1.jpg",
    alt: "Large stained glass bathroom windows",
    caption: "Large bathroom windows",
  },
  {
    file: "more-custom-photos--db_LARGE-CABa1.jpg",
    alt: "Large stained glass cabinet doors",
    caption: "Large cabinet doors",
  },
  {
    file: "more-custom-photos--db_LARGE-_FRONT_DOORc1.jpg",
    alt: "Large stained glass front door",
    caption: "Large front door",
  },
  {
    file: "more-custom-photos--db_KITCHEN_STUDIO2a1.jpg",
    alt: "Kitchen studio stained glass installation",
    caption: "Kitchen studio",
  },
  {
    file: "more-custom-photos--db_KITCHEN_STUDIO3a1.jpg",
    alt: "Kitchen studio stained glass — second view",
    caption: "Kitchen studio — view 2",
  },
  {
    file: "more-custom-photos--db_KITCHEN_STUDIO4a1.jpg",
    alt: "Kitchen studio stained glass — third view",
    caption: "Kitchen studio — view 3",
  },
  {
    file: "more-custom-photos--db_LARGE-DINING_RM_WINDOWSa1.jpg",
    alt: "Large dining room stained glass windows",
    caption: "Large dining room windows",
  },
  {
    file: "more-custom-photos--db_L-HOUSE_-_BOATa1.jpg",
    alt: "Lighthouse and boat stained glass scene",
    caption: "Lighthouse & boat",
  },
  {
    file: "more-custom-photos--IMG_0875.jpg",
    alt: "Custom stained glass piece",
  },
  {
    file: "more-custom-photos--P1010327.jpg",
    alt: "Custom stained glass installation",
  },
  {
    file: "more-custom-photos--FLWgreen-scaled.jpg",
    alt: "Green floral stained glass panel",
  },
  {
    file: "more-custom-photos--Fred.jpg",
    alt: "Stained glass piece by Allen Kenoyer Glass",
  },
  {
    file: "more-custom-photos--HumMag2020.jpg",
    alt: "Hummingbird stained glass piece",
  },
  {
    file: "more-custom-photos--aklilies-th-1.jpg",
    alt: "Lilies stained glass panel",
  },
  {
    file: "more-custom-photos--img-6463.jpg",
    alt: "Stained glass installation in a home",
  },
  {
    file: "more-custom-photos--Tot2020.jpg",
    alt: "Stained glass piece by Allen Kenoyer Glass",
  },
];

export default function PortfolioPage() {
  return (
    <Container className="py-16 md:py-24">
      <PageHeader
        eyebrow="Our Work"
        title="Portfolio"
        lead={
          <>
            Since 1978, Allen Kenoyer Glass has been producing the finest
            quality leaded glass. From contemporary to abstract, whimsical to
            dramatic — our designs are sure to spark your imagination and
            enhance your personal environment.
          </>
        }
      >
        <p className="text-text-mid mt-4 text-sm italic">
          All designs &copy; Allen Kenoyer Glass.
        </p>
      </PageHeader>

      <Reveal className="mt-16">
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {IMAGES.map((img) => (
            <li
              key={img.file}
              className="bg-cream-alt group relative overflow-hidden rounded-md"
            >
              <Image
                src={siteImageUrl("portfolio", img.file)}
                alt={img.alt}
                width={600}
                height={600}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {img.caption ? (
                <div className="from-plum-dark/85 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-3 pt-10 pb-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-cream text-sm font-medium">
                    {img.caption}
                  </p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </Reveal>
    </Container>
  );
}
