// Site-wide config: contact info and nav structure.
// Nav structure per the docs/website-outline.md decisions (Services dropdown
// for the four service pages; Classes/Supplies dropdowns each with one sub-route).

export const siteContact = {
  phone: "(310) 542-6225",
  phoneHref: "tel:3105426225",
  address: {
    line1: "4571 Artesia Blvd",
    line2: "Lawndale, CA 90260",
    mapHref:
      "https://www.google.com/maps/search/?api=1&query=4571+Artesia+Blvd+Lawndale+CA+90260",
  },
  social: {
    facebook:
      "https://www.facebook.com/p/Allen-Kenoyer-Stained-Glass-100057584555674/",
    instagram: "https://www.instagram.com/allenkenoyerglass/",
    pinterest: "https://www.pinterest.com/allenkenoyersta/",
  },
};

export type NavItem =
  | { label: string; href: string }
  | { label: string; children: { label: string; href: string }[] };

export const headerNav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Services",
    children: [
      { label: "Custom Design", href: "/custom-design" },
      { label: "Repairs", href: "/repairs" },
      { label: "Cabinet Doors", href: "/cabinet-doors" },
      { label: "Portfolio", href: "/portfolio" },
    ],
  },
  {
    label: "Classes",
    children: [
      { label: "All Classes", href: "/classes" },
      { label: "Class Calendar", href: "/classes/calendar" },
    ],
  },
  {
    label: "Supplies",
    children: [
      { label: "All Supplies", href: "/supplies" },
      { label: "Patterns", href: "/supplies/patterns" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

// Footer is the sitemap; groups mirror the header dropdowns plus standalone items.
export const footerSections = [
  {
    heading: "Services",
    links: [
      { label: "Custom Design", href: "/custom-design" },
      { label: "Repairs", href: "/repairs" },
      { label: "Cabinet Doors", href: "/cabinet-doors" },
      { label: "Portfolio", href: "/portfolio" },
    ],
  },
  {
    heading: "Classes",
    links: [
      { label: "All Classes", href: "/classes" },
      { label: "Class Calendar", href: "/classes/calendar" },
    ],
  },
  {
    heading: "Supplies",
    links: [
      { label: "All Supplies", href: "/supplies" },
      { label: "Patterns", href: "/supplies/patterns" },
    ],
  },
  {
    heading: "Studio",
    links: [
      { label: "Home", href: "/" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];
